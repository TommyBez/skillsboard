"use server"

import { randomBytes } from "node:crypto"

import { and, asc, eq, inArray, isNull, lt, ne, sql } from "drizzle-orm"
import { updateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import {
  collection,
  collectionDistribution,
  collectionRelease,
  collectionReleaseSkill,
  collectionSkill,
  member,
  skill,
} from "@/lib/db/schema"
import {
  buildInstallableSkillArchives,
  SkillArchiveError,
  type InstallableSkillArchive,
} from "@/lib/github-skill-archive"
import {
  discoverGitHubSkillCandidates,
  GitHubSkillDiscoveryError,
} from "@/lib/github-skill-discovery"
import { createCollectionArchiveBudget } from "@/lib/installable-collection-package-budget"
import {
  buildInstallableCollectionArtifactFilename,
  MAX_INSTALLABLE_COLLECTION_DESCRIPTION_LENGTH,
  MAX_INSTALLABLE_COLLECTION_SKILLS,
} from "@/lib/installable-collection-protocol"
import {
  shouldRetainSupersededReleaseGrace,
  supersededReleaseCutoff,
} from "@/lib/installable-collection-release-policy"
import {
  decideLegacySkillPathPersistence,
  matchesRecoveredCanonicalName,
  resolveLegacySkillPaths,
} from "@/lib/legacy-skill-path-resolution"
import { captureTeamEvent } from "@/lib/posthog-server"
import { isOrganizationAdmin, requireActiveOrganization, requireSession } from "@/lib/session"

const MAX_ARTIFACT_BYTES = 4 * 1024 * 1024
const MAX_COLLECTION_ARTIFACT_BYTES = 20 * 1024 * 1024
const MAX_COLLECTION_SOURCE_BYTES = 50 * 1024 * 1024
const PACKAGE_CONCURRENCY = 3

const collectionDistributionSchema = z.object({ collectionId: z.uuid() })

interface PublishableSkill {
  githubUrl: string
  id: string
  repoName: string
  repoOwner: string
  skillName: string
  skillPath: string | null
  title: string
}

interface PackagedSkill {
  archive: InstallableSkillArchive
  source: PublishableSkill
}

interface RecoveredSkillPath {
  id: string
  skillPath: string
}

interface ResolvedRepositorySkill {
  expectedCanonicalName: string | null
  index: number
  skillPath: string
  source: PublishableSkill
}

class CollectionPackagingError extends SkillArchiveError {}

function createShareId() {
  return randomBytes(24).toString("base64url")
}

async function getManageableCollection(collectionId: string) {
  const session = await requireSession()
  const { organizationId, role, userId } = await requireActiveOrganization(session)
  const [found] = await db
    .select({
      createdBy: collection.createdBy,
      description: collection.description,
      id: collection.id,
      title: collection.title,
      updatedAt: collection.updatedAt,
    })
    .from(collection)
    .where(and(
      eq(collection.id, collectionId),
      eq(collection.organizationId, organizationId),
    ))
    .limit(1)

  if (!found) return { error: "Collection not found" } as const
  if (found.createdBy !== userId && !isOrganizationAdmin(role)) {
    return {
      error: "Only the person who created this collection, or a team admin, can manage its install link.",
    } as const
  }

  return { collection: found, organizationId, userId } as const
}

async function mutateActiveCollectionDistribution(input: {
  collectionId: string
  operation: "disable" | "rotate"
  organizationId: string
  userId: string
}) {
  return db.transaction(async (tx) => {
    const [currentCollection] = await tx
      .select({ createdBy: collection.createdBy })
      .from(collection)
      .where(and(
        eq(collection.id, input.collectionId),
        eq(collection.organizationId, input.organizationId),
      ))
      .limit(1)
      .for("update")

    if (!currentCollection) return { status: "not_found" as const }

    const [currentMembership] = await tx
      .select({ role: member.role })
      .from(member)
      .where(and(
        eq(member.organizationId, input.organizationId),
        eq(member.userId, input.userId),
      ))
      .limit(1)
      .for("share")

    if (
      !currentMembership
      || (
        currentCollection.createdBy !== input.userId
        && !isOrganizationAdmin(currentMembership.role)
      )
    ) return { status: "forbidden" as const }

    const now = new Date()
    const [updated] = await tx
      .update(collectionDistribution)
      .set(input.operation === "disable"
        ? { revokedAt: now, updatedAt: now }
        : { shareId: createShareId(), updatedAt: now })
      .where(and(
        eq(collectionDistribution.collectionId, input.collectionId),
        isNull(collectionDistribution.revokedAt),
      ))
      .returning({ shareId: collectionDistribution.shareId })

    return updated
      ? { shareId: updated.shareId, status: "updated" as const }
      : { status: "inactive" as const }
  })
}

async function packageSkills(skills: PublishableSkill[]) {
  const packaged = new Array<PackagedSkill>(skills.length)
  const recoveredPaths = new Array<RecoveredSkillPath | undefined>(skills.length)
  const collectionBudget = createCollectionArchiveBudget({
    artifactBytes: MAX_COLLECTION_ARTIFACT_BYTES,
    sourceBytes: MAX_COLLECTION_SOURCE_BYTES,
  })
  let packagingError: CollectionPackagingError | null = null
  const repositoryGroups = new Map<string, Array<{
    index: number
    source: PublishableSkill
  }>>()

  for (const [index, source] of skills.entries()) {
    const repositoryKey = `${source.repoOwner}/${source.repoName}`.toLowerCase()
    const entry = { index, source }
    const group = repositoryGroups.get(repositoryKey)
    if (group) group.push(entry)
    else repositoryGroups.set(repositoryKey, [entry])
  }

  const groups = [...repositoryGroups.values()]
  let nextGroupIndex = 0

  function failPackaging(error: CollectionPackagingError): never {
    packagingError ??= error
    throw packagingError
  }

  function retainArchive(
    entry: ResolvedRepositorySkill,
    archive: InstallableSkillArchive,
  ) {
    if (packagingError) throw packagingError

    if (!matchesRecoveredCanonicalName({
      actualName: archive.skillName,
      expectedName: entry.expectedCanonicalName,
    })) {
      failPackaging(new CollectionPackagingError(
        `${entry.source.title}: its GitHub source changed while it was being packaged. Try publishing again.`,
        409,
      ))
    }

    if (archive.artifactBytes > MAX_ARTIFACT_BYTES) {
      failPackaging(new CollectionPackagingError(
        `${entry.source.title}: the compressed skill is larger than 4 MB and cannot be published yet.`,
        413,
      ))
    }
    if (archive.description.length > MAX_INSTALLABLE_COLLECTION_DESCRIPTION_LENGTH) {
      failPackaging(new CollectionPackagingError(
        `${entry.source.title}: the skill description is longer than ${MAX_INSTALLABLE_COLLECTION_DESCRIPTION_LENGTH} characters and is not compatible with the installer.`,
        422,
      ))
    }
    try {
      buildInstallableCollectionArtifactFilename(archive.skillName)
    } catch {
      failPackaging(new CollectionPackagingError(
        `${entry.source.title}: the resolved skill name cannot be installed safely on every supported platform.`,
        422,
      ))
    }

    const budgetResult = collectionBudget.add(archive)
    if (!budgetResult.ok) {
      failPackaging(budgetResult.limit === "artifact"
        ? new CollectionPackagingError(
            "The collection produces more than 20 MB of compressed skill files and cannot be published yet.",
            413,
          )
        : new CollectionPackagingError(
            "The collection contains more than 50 MB of source files and cannot be published safely.",
            413,
          ))
    }

    packaged[entry.index] = { archive, source: entry.source }
    if (entry.source.skillPath === null) {
      recoveredPaths[entry.index] = {
        id: entry.source.id,
        skillPath: archive.skillPath,
      }
    }
  }

  async function worker() {
    while (nextGroupIndex < groups.length) {
      const groupIndex = nextGroupIndex
      const group = groups[groupIndex]
      nextGroupIndex += 1

      try {
        let resolvedGroup: ResolvedRepositorySkill[]
        let expectedCommitSha: string | undefined
        const legacyEntries = group.filter(({ source }) => source.skillPath === null)
        if (legacyEntries.length) {
          const discovery = await discoverGitHubSkillCandidates(group[0].source.githubUrl)
          expectedCommitSha = discovery.commitSha
          const resolution = resolveLegacySkillPaths({
            candidates: discovery.skills,
            claimedPaths: group.flatMap(({ source }) => (
              source.skillPath === null ? [] : [source.skillPath]
            )),
            legacySkills: legacyEntries.map(({ source }) => ({
              id: source.id,
              skillName: source.skillName,
            })),
          })

          if (!resolution.ok) {
            const source = group.find((entry) => entry.source.id === resolution.skillId)?.source
              ?? group[0].source
            if (resolution.code === "path_collision") {
              failPackaging(new CollectionPackagingError(
                `${source.title}: more than one saved skill resolves to the same GitHub source folder. Remove one of the duplicate skills from this collection before publishing.`,
                422,
              ))
            }
            if (resolution.code === "no_candidates") {
              failPackaging(new CollectionPackagingError(
                `${source.title}: Skills Board could not find a current skill definition in this repository. Its GitHub source must be verified before publishing.`,
                422,
              ))
            }
            failPackaging(new CollectionPackagingError(
              `${source.title}: this repository contains multiple skills and the saved name no longer identifies one safely. Its exact GitHub source must be verified before publishing.`,
              422,
            ))
          }

          const recoveredById = new Map(resolution.resolved.map((item) => [item.id, item]))
          resolvedGroup = group.map(({ index, source }) => {
            if (source.skillPath !== null) {
              return {
                expectedCanonicalName: null,
                index,
                skillPath: source.skillPath,
                source,
              }
            }
            const recovered = recoveredById.get(source.id)
            if (!recovered) {
              failPackaging(new CollectionPackagingError(
                `${source.title}: its saved source path could not be recovered.`,
                422,
              ))
            }
            return {
              expectedCanonicalName: recovered.canonicalName,
              index,
              skillPath: recovered.skillPath,
              source,
            }
          })
        } else {
          resolvedGroup = group.map(({ index, source }) => {
            if (source.skillPath === null) {
              failPackaging(new CollectionPackagingError(
                `${source.title}: its saved source path could not be recovered.`,
                422,
              ))
            }
            return {
              expectedCanonicalName: null,
              index,
              skillPath: source.skillPath,
              source,
            }
          })
        }

        const entriesByPath = new Map<string, ResolvedRepositorySkill[]>()
        for (const entry of resolvedGroup) {
          const entries = entriesByPath.get(entry.skillPath)
          if (entries) entries.push(entry)
          else entriesByPath.set(entry.skillPath, [entry])
        }

        await buildInstallableSkillArchives({
          expectedCommitSha,
          githubUrl: group[0].source.githubUrl,
          onArchiveBuilt: (archive) => {
            const entries = entriesByPath.get(archive.skillPath)
            if (!entries) {
              failPackaging(new CollectionPackagingError(
                "The selected skill could not be matched to its saved source path.",
                422,
              ))
            }
            // GitHub resolution deduplicates identical paths. Fan the archive
            // back out so each saved skill retains its prior storage and budget semantics.
            for (const entry of entries) retainArchive(entry, archive)
          },
          skillPaths: resolvedGroup.map((item) => item.skillPath),
        })
      } catch (error) {
        if (error instanceof CollectionPackagingError) throw error
        const repository = `${group[0].source.repoOwner}/${group[0].source.repoName}`
        if (error instanceof GitHubSkillDiscoveryError) {
          throw new SkillArchiveError(`${repository}: ${error.message}`, error.status, { cause: error })
        }
        if (error instanceof SkillArchiveError) {
          throw new SkillArchiveError(`${repository}: ${error.message}`, error.status, { cause: error })
        }
        throw error
      }

      for (const { index, source } of group) {
        if (!packaged[index]) {
          failPackaging(new CollectionPackagingError(
            `${source.title}: the selected skill could not be packaged.`,
            422,
          ))
        }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(PACKAGE_CONCURRENCY, groups.length) }, () => worker()),
  )

  const seenNames = new Set<string>()
  const duplicateNames = new Set<string>()
  for (const item of packaged) {
    const { skillName } = item.archive
    if (seenNames.has(skillName)) duplicateNames.add(skillName)
    else seenNames.add(skillName)
  }
  if (duplicateNames.size) {
    throw new SkillArchiveError(
      `Two skills resolve to the same install name: ${[...duplicateNames].join(", ")}. Remove one before publishing.`,
      422,
    )
  }

  return {
    packaged,
    recoveredPaths: recoveredPaths.filter(
      (item): item is RecoveredSkillPath => item !== undefined,
    ),
  }
}

export async function publishCollectionDistribution(
  input: z.input<typeof collectionDistributionSchema>,
) {
  const parsed = collectionDistributionSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: "Collection not found" }

  const manageable = await getManageableCollection(parsed.data.collectionId)
  if ("error" in manageable) return { ok: false as const, error: manageable.error }
  const { collection: found, organizationId, userId } = manageable

  const [skills, [existingDistribution]] = await Promise.all([
    db
      .select({
        githubUrl: skill.githubUrl,
        id: skill.id,
        repoName: skill.repoName,
        repoOwner: skill.repoOwner,
        skillName: skill.skillName,
        skillPath: skill.skillPath,
        title: skill.title,
      })
      .from(collectionSkill)
      .innerJoin(skill, and(
        eq(collectionSkill.skillId, skill.id),
        eq(skill.organizationId, organizationId),
      ))
      .where(eq(collectionSkill.collectionId, found.id))
      .orderBy(asc(collectionSkill.createdAt), asc(skill.skillName)),
    db
      .select({
        activeReleaseId: collectionDistribution.activeReleaseId,
        revokedAt: collectionDistribution.revokedAt,
        updatedAt: collectionDistribution.updatedAt,
      })
      .from(collectionDistribution)
      .where(eq(collectionDistribution.collectionId, found.id))
      .limit(1),
  ])

  if (!skills.length) {
    return { ok: false as const, error: "Add at least one skill before publishing this collection." }
  }
  if (skills.length > MAX_INSTALLABLE_COLLECTION_SKILLS) {
    return {
      ok: false as const,
      error: `Installable collections currently support up to ${MAX_INSTALLABLE_COLLECTION_SKILLS} skills.`,
    }
  }

  let packagingResult: Awaited<ReturnType<typeof packageSkills>>
  try {
    packagingResult = await packageSkills(skills)
  } catch (error) {
    if (error instanceof SkillArchiveError) {
      return { ok: false as const, error: error.message }
    }
    console.error("Unable to package installable collection", error)
    return { ok: false as const, error: "We couldn’t package this collection. Try again." }
  }
  const { packaged, recoveredPaths } = packagingResult

  const now = new Date()
  const nextShareId = createShareId()
  const expectedPathBySkillId = new Map(packaged.map(({ archive, source }) => (
    [source.id, archive.skillPath]
  )))
  const recoveredPathBySkillId = new Map(recoveredPaths.map((item) => (
    [item.id, item.skillPath]
  )))
  const sourceSkillIds = [...expectedPathBySkillId.keys()].sort()
  const published = await db.transaction(async (tx) => {
    // Keep the same skill -> collection lock order used by deletion and
    // membership changes. Stable ordering also prevents two collections that
    // share skills from locking the source rows in opposite orders.
    const currentSources = await tx
      .select({
        id: skill.id,
        skillPath: skill.skillPath,
      })
      .from(skill)
      .where(and(
        eq(skill.organizationId, organizationId),
        inArray(skill.id, sourceSkillIds),
      ))
      .orderBy(asc(skill.id))
      .for("update")

    if (currentSources.length !== sourceSkillIds.length) {
      return { status: "source_changed" as const }
    }

    const sourcePathRepairs: RecoveredSkillPath[] = []
    for (const currentSource of currentSources) {
      const expectedPath = expectedPathBySkillId.get(currentSource.id)
      if (expectedPath === undefined) return { status: "source_changed" as const }

      const recoveredPath = recoveredPathBySkillId.get(currentSource.id) ?? null
      const decision = decideLegacySkillPathPersistence({
        currentPath: currentSource.skillPath,
        expectedPath,
        recoveredPath,
      })
      if (decision === "conflict") return { status: "source_changed" as const }
      if (decision === "repair") {
        sourcePathRepairs.push({ id: currentSource.id, skillPath: expectedPath })
      }
    }

    const [currentCollection] = await tx
      .select({
        createdBy: collection.createdBy,
        updatedAt: collection.updatedAt,
      })
      .from(collection)
      .where(and(
        eq(collection.id, found.id),
        eq(collection.organizationId, organizationId),
      ))
      .limit(1)
      .for("update")

    if (
      !currentCollection
      || currentCollection.updatedAt.getTime() !== found.updatedAt.getTime()
    ) return { status: "collection_changed" as const }

    const [currentMembership] = await tx
      .select({ role: member.role })
      .from(member)
      .where(and(
        eq(member.organizationId, organizationId),
        eq(member.userId, userId),
      ))
      .limit(1)
      .for("share")

    if (
      !currentMembership
      || (
        currentCollection.createdBy !== userId
        && !isOrganizationAdmin(currentMembership.role)
      )
    ) return { status: "authorization_changed" as const }

    const [currentDistribution] = await tx
      .select({
        activeReleaseId: collectionDistribution.activeReleaseId,
        revokedAt: collectionDistribution.revokedAt,
        updatedAt: collectionDistribution.updatedAt,
      })
      .from(collectionDistribution)
      .where(eq(collectionDistribution.collectionId, found.id))
      .limit(1)
      .for("update")

    const distributionChanged = existingDistribution
      ? !currentDistribution
        || currentDistribution.updatedAt.getTime() !== existingDistribution.updatedAt.getTime()
      : Boolean(currentDistribution)
    if (distributionChanged) return { status: "distribution_changed" as const }
    const retainSupersededReleaseGrace = shouldRetainSupersededReleaseGrace(
      Boolean(currentDistribution?.revokedAt),
    )

    await Promise.all(sourcePathRepairs.map((repair) => (
      tx
        .update(skill)
        .set({ skillPath: repair.skillPath, updatedAt: now })
        .where(and(
          eq(skill.id, repair.id),
          eq(skill.organizationId, organizationId),
          isNull(skill.skillPath),
        ))
    )))

    await tx
      .insert(collectionDistribution)
      .values({
        collectionId: found.id,
        createdBy: userId,
        shareId: nextShareId,
      })
      .onConflictDoNothing({ target: collectionDistribution.collectionId })

    const [distribution] = await tx
      .update(collectionDistribution)
      .set({
        activeRevision: sql`${collectionDistribution.activeRevision} + 1`,
        publishedAt: now,
        revokedAt: null,
        shareId: sql`CASE WHEN ${collectionDistribution.revokedAt} IS NOT NULL THEN ${nextShareId} ELSE ${collectionDistribution.shareId} END`,
        updatedAt: now,
      })
      .where(eq(collectionDistribution.collectionId, found.id))
      .returning({
        activeRevision: collectionDistribution.activeRevision,
        shareId: collectionDistribution.shareId,
      })

    if (!distribution) throw new Error("Collection distribution could not be created")

    const [release] = await tx
      .insert(collectionRelease)
      .values({
        collectionId: found.id,
        createdBy: userId,
        description: found.description,
        revision: distribution.activeRevision,
        title: found.title,
      })
      .returning({ id: collectionRelease.id })

    if (!release) throw new Error("Collection release could not be created")

    await tx.insert(collectionReleaseSkill).values(packaged.map(({ archive, source }, position) => ({
      artifactBase64: Buffer.from(archive.bytes).toString("base64"),
      artifactBytes: archive.artifactBytes,
      artifactDigest: archive.digest,
      commitSha: archive.commitSha,
      description: archive.description,
      githubUrl: source.githubUrl,
      position,
      releaseId: release.id,
      repoName: source.repoName,
      repoOwner: source.repoOwner,
      skillName: archive.skillName,
      skillPath: archive.skillPath,
      sourceSkillId: source.id,
    })))

    if (currentDistribution?.activeReleaseId && retainSupersededReleaseGrace) {
      await tx
        .update(collectionRelease)
        .set({ supersededAt: now })
        .where(and(
          eq(collectionRelease.collectionId, found.id),
          eq(collectionRelease.id, currentDistribution.activeReleaseId),
        ))
    }

    await tx
      .update(collectionDistribution)
      .set({ activeReleaseId: release.id, updatedAt: now })
      .where(eq(collectionDistribution.collectionId, found.id))

    if (retainSupersededReleaseGrace) {
      // Keep superseded artifacts available for in-flight installers. Cleanup
      // runs only after a full grace period measured from deactivation, so a
      // manifest fetched immediately before a republish remains installable.
      const retentionCutoff = supersededReleaseCutoff(now)
      await tx
        .delete(collectionRelease)
        .where(and(
          eq(collectionRelease.collectionId, found.id),
          lt(collectionRelease.supersededAt, retentionCutoff),
        ))
    } else {
      // Republish after disable starts a new share generation. Do not make any
      // artifact from the revoked generation accessible through the new link.
      await tx
        .delete(collectionRelease)
        .where(and(
          eq(collectionRelease.collectionId, found.id),
          ne(collectionRelease.id, release.id),
        ))
    }

    return {
      status: "published" as const,
      repairedSkillCount: sourcePathRepairs.length,
      revision: distribution.activeRevision,
      shareId: distribution.shareId,
    }
  })

  if (published.status === "collection_changed") {
    return {
      ok: false as const,
      error: "The collection changed while it was being packaged. Review it and publish again.",
    }
  }
  if (published.status === "authorization_changed") {
    return {
      ok: false as const,
      error: "Your team permissions changed while this release was being packaged. Review access and publish again.",
    }
  }
  if (published.status === "distribution_changed") {
    return {
      ok: false as const,
      error: "The install link changed while this release was being packaged. Review its current state and publish again.",
    }
  }
  if (published.status === "source_changed") {
    return {
      ok: false as const,
      error: "A skill source changed while this release was being packaged. Refresh the page and publish again.",
    }
  }

  updateTag(cacheTags.organizationCollections(organizationId))
  if (published.repairedSkillCount > 0) {
    updateTag(cacheTags.organizationSkills(organizationId))
  }
  captureTeamEvent({
    distinctId: userId,
    event: "collection_distribution_published",
    properties: {
      collection_id: found.id,
      is_update: Boolean(existingDistribution?.activeReleaseId && !existingDistribution.revokedAt),
      recovered_source_count: published.repairedSkillCount,
      revision: published.revision,
      skill_count: packaged.length,
    },
    teamId: organizationId,
  })

  return { ok: true as const, revision: published.revision, shareId: published.shareId }
}

export async function disableCollectionDistribution(
  input: z.input<typeof collectionDistributionSchema>,
) {
  const parsed = collectionDistributionSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: "Collection not found" }

  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const outcome = await mutateActiveCollectionDistribution({
    collectionId: parsed.data.collectionId,
    operation: "disable",
    organizationId,
    userId,
  })
  if (outcome.status === "not_found") {
    return { ok: false as const, error: "Collection not found" }
  }
  if (outcome.status === "forbidden") {
    return {
      ok: false as const,
      error: "Only the person who created this collection, or a team admin, can manage its install link.",
    }
  }
  if (outcome.status === "inactive") {
    return { ok: false as const, error: "This collection does not have an active install link." }
  }

  updateTag(cacheTags.organizationCollections(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "collection_distribution_disabled",
    properties: { collection_id: parsed.data.collectionId },
    teamId: organizationId,
  })
  return { ok: true as const }
}

export async function rotateCollectionDistributionLink(
  input: z.input<typeof collectionDistributionSchema>,
) {
  const parsed = collectionDistributionSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: "Collection not found" }

  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const outcome = await mutateActiveCollectionDistribution({
    collectionId: parsed.data.collectionId,
    operation: "rotate",
    organizationId,
    userId,
  })
  if (outcome.status === "not_found") {
    return { ok: false as const, error: "Collection not found" }
  }
  if (outcome.status === "forbidden") {
    return {
      ok: false as const,
      error: "Only the person who created this collection, or a team admin, can manage its install link.",
    }
  }
  if (outcome.status === "inactive") {
    return { ok: false as const, error: "This collection does not have an active install link." }
  }

  updateTag(cacheTags.organizationCollections(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "collection_distribution_link_rotated",
    properties: { collection_id: parsed.data.collectionId },
    teamId: organizationId,
  })
  return { ok: true as const, shareId: outcome.shareId }
}
