"use server"

import { and, eq } from "drizzle-orm"
import { updateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { skill } from "@/lib/db/schema"
import { getGitHubMetadata } from "@/lib/github"
import { getPostHogClient } from "@/lib/posthog-server"
import { requireActiveOrganization, requireSession } from "@/lib/session"

const skillSchema = z.object({
  githubUrl: z.url(),
  skillName: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  note: z.string().trim().max(500).optional(),
})

export async function addSkill(input: z.input<typeof skillSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = skillSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Check the repository URL, skill name, tags, and note, then try again." }
  }

  try {
    const metadata = await getGitHubMetadata(parsed.data.githubUrl)
    const existing = await db.select({ id: skill.id }).from(skill).where(and(eq(skill.organizationId, organizationId), eq(skill.githubUrl, metadata.githubUrl), eq(skill.skillName, parsed.data.skillName))).limit(1)
    if (existing.length) return { ok: false as const, error: "This skill is already in your team library" }
    const note = parsed.data.note || null
    await db.insert(skill).values({
      organizationId,
      createdBy: userId,
      githubUrl: metadata.githubUrl,
      skillName: parsed.data.skillName,
      title: parsed.data.skillName.replaceAll("-", " "),
      description: metadata.description,
      repoOwner: metadata.repoOwner,
      repoName: metadata.repoName,
      repoStars: metadata.repoStars,
      repoUpdatedAt: metadata.repoUpdatedAt,
      tags: [...new Set(parsed.data.tags.map((tag) => tag.toLowerCase()))],
      note,
    })
    updateTag(cacheTags.organizationSkills(organizationId))
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: userId,
      event: "skill_saved",
      properties: {
        skill_name: parsed.data.skillName,
        repo_owner: metadata.repoOwner,
        repo_name: metadata.repoName,
        tag_count: parsed.data.tags.length,
        has_note: Boolean(note),
      },
    })
    await posthog.shutdown()
    return { ok: true as const }
  } catch (error) {
    console.error("Unable to save skill", error)
    return { ok: false as const, error: "We couldn’t fetch this repository or save the skill. Check the URL and try again." }
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
  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: userId,
    event: "skill_note_updated",
    properties: {
      skill_id: parsed.data.skillId,
      has_note: Boolean(parsed.data.note),
    },
  })
  await posthog.shutdown()
  return { ok: true as const }
}

export async function deleteSkill(id: string) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  await db.delete(skill).where(and(eq(skill.id, id), eq(skill.organizationId, organizationId)))
  updateTag(cacheTags.organizationSkills(organizationId))
  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: userId,
    event: "skill_deleted",
    properties: { skill_id: id },
  })
  await posthog.shutdown()
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
  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: userId,
    event: "skill_refreshed",
    properties: {
      skill_id: id,
      repo_owner: savedSkill.repoOwner,
      repo_name: savedSkill.repoName,
    },
  })
  await posthog.shutdown()
}
