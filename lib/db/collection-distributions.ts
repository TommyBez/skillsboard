import "server-only"

import { and, asc, eq, gte, isNull, or } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  collection,
  collectionDistribution,
  collectionRelease,
  collectionReleaseSkill,
} from "@/lib/db/schema"
import { supersededReleaseCutoff } from "@/lib/installable-collection-release-policy"

export async function getCollectionDistribution(
  organizationId: string,
  collectionId: string,
) {
  const [found] = await db
    .select({
      activeReleaseId: collectionDistribution.activeReleaseId,
      activeRevision: collectionDistribution.activeRevision,
      publishedAt: collectionDistribution.publishedAt,
      releaseTitle: collectionRelease.title,
      revokedAt: collectionDistribution.revokedAt,
      shareId: collectionDistribution.shareId,
    })
    .from(collectionDistribution)
    .innerJoin(collection, and(
      eq(collectionDistribution.collectionId, collection.id),
      eq(collection.organizationId, organizationId),
    ))
    .leftJoin(collectionRelease, and(
      eq(collectionDistribution.activeReleaseId, collectionRelease.id),
      eq(collectionDistribution.collectionId, collectionRelease.collectionId),
    ))
    .where(eq(collectionDistribution.collectionId, collectionId))
    .limit(1)

  return found ?? null
}

export async function listCollectionDistributionIds(organizationId: string) {
  return db
    .select({ collectionId: collectionDistribution.collectionId })
    .from(collectionDistribution)
    .innerJoin(collection, and(
      eq(collectionDistribution.collectionId, collection.id),
      eq(collection.organizationId, organizationId),
    ))
}

export async function getPublishedCollectionByShareId(shareId: string) {
  const rows = await db
    .select({
      artifactBytes: collectionReleaseSkill.artifactBytes,
      artifactDigest: collectionReleaseSkill.artifactDigest,
      artifactId: collectionReleaseSkill.id,
      collectionId: collectionRelease.collectionId,
      commitSha: collectionReleaseSkill.commitSha,
      releaseDescription: collectionRelease.description,
      skillDescription: collectionReleaseSkill.description,
      githubUrl: collectionReleaseSkill.githubUrl,
      position: collectionReleaseSkill.position,
      publishedAt: collectionDistribution.publishedAt,
      releaseId: collectionRelease.id,
      repoName: collectionReleaseSkill.repoName,
      repoOwner: collectionReleaseSkill.repoOwner,
      revision: collectionRelease.revision,
      skillName: collectionReleaseSkill.skillName,
      skillPath: collectionReleaseSkill.skillPath,
      title: collectionRelease.title,
    })
    .from(collectionDistribution)
    .innerJoin(collectionRelease, and(
      eq(collectionDistribution.activeReleaseId, collectionRelease.id),
      eq(collectionDistribution.collectionId, collectionRelease.collectionId),
    ))
    .innerJoin(
      collectionReleaseSkill,
      eq(collectionReleaseSkill.releaseId, collectionRelease.id),
    )
    .where(and(
      eq(collectionDistribution.shareId, shareId),
      isNull(collectionDistribution.revokedAt),
    ))
    .orderBy(asc(collectionReleaseSkill.position))

  const first = rows[0]
  const publishedAt = first?.publishedAt
  if (!first || !publishedAt) return null

  return {
    collectionId: first.collectionId,
    description: first.releaseDescription,
    publishedAt,
    releaseId: first.releaseId,
    revision: first.revision,
    title: first.title,
    skills: rows.map((row) => ({
      artifactBytes: row.artifactBytes,
      artifactDigest: row.artifactDigest,
      artifactId: row.artifactId,
      commitSha: row.commitSha,
      description: row.skillDescription,
      githubUrl: row.githubUrl,
      position: row.position,
      repoName: row.repoName,
      repoOwner: row.repoOwner,
      skillName: row.skillName,
      skillPath: row.skillPath,
    })),
  }
}

export async function getPublishedCollectionArtifact(
  shareId: string,
  artifactId: string,
) {
  const retentionCutoff = supersededReleaseCutoff(new Date())
  const [artifact] = await db
    .select({
      artifactBase64: collectionReleaseSkill.artifactBase64,
      artifactBytes: collectionReleaseSkill.artifactBytes,
      artifactDigest: collectionReleaseSkill.artifactDigest,
      skillName: collectionReleaseSkill.skillName,
    })
    .from(collectionReleaseSkill)
    .innerJoin(
      collectionRelease,
      eq(collectionReleaseSkill.releaseId, collectionRelease.id),
    )
    .innerJoin(collectionDistribution, and(
      eq(collectionRelease.collectionId, collectionDistribution.collectionId),
      eq(collectionDistribution.shareId, shareId),
      isNull(collectionDistribution.revokedAt),
    ))
    .where(and(
      eq(collectionReleaseSkill.id, artifactId),
      or(
        eq(collectionRelease.id, collectionDistribution.activeReleaseId),
        gte(collectionRelease.supersededAt, retentionCutoff),
      ),
    ))
    .limit(1)

  return artifact ?? null
}
