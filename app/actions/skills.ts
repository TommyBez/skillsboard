"use server"

import { and, asc, eq, inArray } from "drizzle-orm"
import { updateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { collection, collectionDistribution, collectionSkill, skill } from "@/lib/db/schema"
import { getGitHubMetadata } from "@/lib/github"
import {
  discoverGitHubSkills,
  GitHubSkillDiscoveryError,
} from "@/lib/github-skill-discovery"
import { captureTeamEvent } from "@/lib/posthog-server"
import { saveSkillsToLibrary } from "@/lib/save-skill"
import { isOrganizationAdmin, requireActiveOrganization, requireSession } from "@/lib/session"

const githubRepositorySchema = z.object({
  githubUrl: z.url(),
})

const examplePromptsSchema = z
  .array(z.string().trim().min(1).max(800))
  .max(8)
  .transform((prompts) => [...new Set(prompts)])

const skillsSchema = z.object({
  githubUrl: z.url(),
  skillPaths: z
    .array(z.string().max(512))
    .min(1)
    .max(100)
    .transform((paths) => [...new Set(paths)]),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  note: z.string().trim().max(500).optional(),
  examplePrompts: examplePromptsSchema.default([]),
})

export async function discoverRepositorySkills(input: z.input<typeof githubRepositorySchema>) {
  await requireSession()
  const parsed = githubRepositorySchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid GitHub repository URL." }
  }

  try {
    const repository = await discoverGitHubSkills(parsed.data.githubUrl)
    if (!repository.skills.length) {
      return {
        ok: false as const,
        error: "We couldn’t find a valid SKILL.md in this repository.",
      }
    }

    return {
      ok: true as const,
      githubUrl: repository.githubUrl,
      skills: repository.skills,
      linkedSkillPath: repository.linkedSkillPath,
    }
  } catch (error) {
    console.error("Unable to discover repository skills", error)
    return {
      ok: false as const,
      error: error instanceof GitHubSkillDiscoveryError
        ? error.message
        : "We couldn’t inspect this repository. Check the URL and try again.",
    }
  }
}

export async function addSkills(input: z.input<typeof skillsSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = skillsSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Check the repository, selected skills, tags, note, and prompts, then try again." }
  }

  const result = await saveSkillsToLibrary({
    organizationId,
    userId,
    githubUrl: parsed.data.githubUrl,
    skillPaths: parsed.data.skillPaths,
    tags: parsed.data.tags,
    note: parsed.data.note,
    examplePrompts: parsed.data.examplePrompts,
    surface: "web",
  })
  if (!result.ok) return { ok: false as const, error: result.error }
  if (result.saved.length) updateTag(cacheTags.organizationSkills(organizationId))
  return {
    ok: true as const,
    savedCount: result.saved.length,
    alreadySaved: result.alreadySaved,
  }
}

const updateSkillNoteSchema = z.object({
  skillId: z.uuid(),
  note: z.string().trim().max(500),
})

export async function updateSkillNote(input: z.input<typeof updateSkillNoteSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = updateSkillNoteSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Check the note and try again." }
  }

  const [savedSkill] = await db
    .select({ id: skill.id, createdBy: skill.createdBy })
    .from(skill)
    .where(and(eq(skill.id, parsed.data.skillId), eq(skill.organizationId, organizationId)))
    .limit(1)

  if (!savedSkill) {
    return { ok: false as const, error: "Skill not found" }
  }

  if (savedSkill.createdBy !== userId) {
    return { ok: false as const, error: "Only the person who added this skill can edit its note." }
  }

  await db
    .update(skill)
    .set({
      note: parsed.data.note || null,
      updatedAt: new Date(),
    })
    .where(and(eq(skill.id, parsed.data.skillId), eq(skill.organizationId, organizationId), eq(skill.createdBy, userId)))

  updateTag(cacheTags.organizationSkills(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "skill_note_updated",
    properties: {
      skill_id: parsed.data.skillId,
      has_note: Boolean(parsed.data.note),
    },
    teamId: organizationId,
  })
  return { ok: true as const }
}

const updateSkillExamplePromptsSchema = z.object({
  skillId: z.uuid(),
  examplePrompts: examplePromptsSchema,
})

export async function updateSkillExamplePrompts(
  input: z.input<typeof updateSkillExamplePromptsSchema>,
) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = updateSkillExamplePromptsSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Add up to 8 prompts, with no more than 800 characters each.",
    }
  }

  const [savedSkill] = await db
    .select({ id: skill.id })
    .from(skill)
    .where(and(
      eq(skill.id, parsed.data.skillId),
      eq(skill.organizationId, organizationId),
    ))
    .limit(1)

  if (!savedSkill) {
    return { ok: false as const, error: "Skill not found" }
  }

  await db
    .update(skill)
    .set({
      examplePrompts: parsed.data.examplePrompts,
      updatedAt: new Date(),
    })
    .where(and(
      eq(skill.id, parsed.data.skillId),
      eq(skill.organizationId, organizationId),
    ))

  updateTag(cacheTags.organizationSkills(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "skill_example_prompts_updated",
    properties: {
      skill_id: parsed.data.skillId,
      example_prompt_count: parsed.data.examplePrompts.length,
    },
    teamId: organizationId,
  })
  return { ok: true as const }
}

const deleteSkillSchema = z.object({
  skillId: z.uuid(),
})

export async function deleteSkill(input: z.input<typeof deleteSkillSchema>) {
  const session = await requireSession()
  const { organizationId, userId, role } = await requireActiveOrganization(session)
  const parsed = deleteSkillSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Skill not found" }
  }

  const now = new Date()
  const outcome = await db.transaction(async (tx) => {
    const [savedSkill] = await tx
      .select({ id: skill.id, createdBy: skill.createdBy })
      .from(skill)
      .where(and(eq(skill.id, parsed.data.skillId), eq(skill.organizationId, organizationId)))
      .limit(1)
      .for("update")

    if (!savedSkill) return "not_found" as const

    const canDelete = savedSkill.createdBy === userId || isOrganizationAdmin(role)
    if (!canDelete) return "forbidden" as const

    const affectedCollections = await tx
      .select({
        createdBy: collection.createdBy,
        id: collection.id,
      })
      .from(collectionSkill)
      .innerJoin(collection, and(
        eq(collectionSkill.collectionId, collection.id),
        eq(collection.organizationId, organizationId),
      ))
      .where(eq(collectionSkill.skillId, savedSkill.id))
      .orderBy(asc(collection.id))
      .for("update")

    const affectedCollectionIds = affectedCollections.map((item) => item.id)
    if (affectedCollectionIds.length && !isOrganizationAdmin(role)) {
      const distributions = await tx
        .select({ collectionId: collectionDistribution.collectionId })
        .from(collectionDistribution)
        .where(inArray(collectionDistribution.collectionId, affectedCollectionIds))
      const distributedCollectionIds = new Set(distributions.map((item) => item.collectionId))
      const protectedCollection = affectedCollections.some((item) => (
        distributedCollectionIds.has(item.id) && item.createdBy !== userId
      ))
      if (protectedCollection) return "protected_collection" as const
    }

    await tx
      .delete(skill)
      .where(and(eq(skill.id, savedSkill.id), eq(skill.organizationId, organizationId)))

    if (affectedCollectionIds.length) {
      await tx
        .update(collection)
        .set({ updatedAt: now })
        .where(inArray(collection.id, affectedCollectionIds))
    }

    return "deleted" as const
  })

  if (outcome === "not_found") {
    return { ok: false as const, error: "Skill not found" }
  }
  if (outcome === "forbidden") {
    return {
      ok: false as const,
      error: "Only the person who added this skill, or a team admin, can delete it.",
    }
  }
  if (outcome === "protected_collection") {
    return {
      ok: false as const,
      error: "This skill belongs to an installable collection managed by someone else. Ask its creator or a team admin to remove it first.",
    }
  }

  updateTag(cacheTags.organizationSkills(organizationId))
  // Removing a skill cascades out of every collection that referenced it.
  updateTag(cacheTags.organizationCollections(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "skill_deleted",
    properties: { skill_id: parsed.data.skillId },
    teamId: organizationId,
  })
  return { ok: true as const }
}

export async function refreshSkill(id: string) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const [savedSkill] = await db.select().from(skill).where(and(eq(skill.id, id), eq(skill.organizationId, organizationId))).limit(1)
  if (!savedSkill) throw new Error("Skill not found")
  updateTag(cacheTags.githubRepository(savedSkill.repoOwner, savedSkill.repoName))
  const metadata = await getGitHubMetadata(savedSkill.githubUrl)
  await db.update(skill).set({ description: metadata.description, repoStars: metadata.repoStars, repoUpdatedAt: metadata.repoUpdatedAt, metadataRefreshedAt: new Date(), updatedAt: new Date() }).where(and(eq(skill.id, id), eq(skill.organizationId, organizationId)))
  updateTag(cacheTags.organizationSkills(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "skill_refreshed",
    properties: {
      skill_id: id,
      repo_owner: savedSkill.repoOwner,
      repo_name: savedSkill.repoName,
    },
    teamId: organizationId,
  })
}
