"use server"

import { and, eq } from "drizzle-orm"
import { updateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { skill } from "@/lib/db/schema"
import { getGitHubMetadata } from "@/lib/github"
import {
  discoverGitHubSkills,
  GitHubSkillDiscoveryError,
} from "@/lib/github-skill-discovery"
import { captureTeamEvent } from "@/lib/posthog-server"
import { saveSkillToLibrary } from "@/lib/save-skill"
import { isOrganizationAdmin, requireActiveOrganization, requireSession } from "@/lib/session"

const githubRepositorySchema = z.object({
  githubUrl: z.url(),
})

const examplePromptsSchema = z
  .array(z.string().trim().min(1).max(800))
  .max(8)
  .transform((prompts) => [...new Set(prompts)])

const skillSchema = z.object({
  githubUrl: z.url(),
  skillPath: z.string().max(512),
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

export async function addSkill(input: z.input<typeof skillSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = skillSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Check the repository, selected skill, tags, note, and prompts, then try again." }
  }

  const result = await saveSkillToLibrary({
    organizationId,
    userId,
    githubUrl: parsed.data.githubUrl,
    skillPath: parsed.data.skillPath,
    tags: parsed.data.tags,
    note: parsed.data.note,
    examplePrompts: parsed.data.examplePrompts,
    surface: "web",
  })
  if (!result.ok) return { ok: false as const, error: result.error }
  updateTag(cacheTags.organizationSkills(organizationId))
  return { ok: true as const }
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

  const [savedSkill] = await db
    .select({ id: skill.id, createdBy: skill.createdBy })
    .from(skill)
    .where(and(eq(skill.id, parsed.data.skillId), eq(skill.organizationId, organizationId)))
    .limit(1)

  if (!savedSkill) {
    return { ok: false as const, error: "Skill not found" }
  }

  const canDelete = savedSkill.createdBy === userId || isOrganizationAdmin(role)
  if (!canDelete) {
    return {
      ok: false as const,
      error: "Only the person who added this skill, or a team admin, can delete it.",
    }
  }

  await db
    .delete(skill)
    .where(and(eq(skill.id, parsed.data.skillId), eq(skill.organizationId, organizationId)))
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
