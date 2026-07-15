"use server"

import { and, eq } from "drizzle-orm"
import { updateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { skill } from "@/lib/db/schema"
import { getGitHubMetadata } from "@/lib/github"
import { requireActiveOrganization, requireSession } from "@/lib/session"

const skillSchema = z.object({
  githubUrl: z.url(),
  skillName: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
})

export async function addSkill(input: z.input<typeof skillSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = skillSchema.parse(input)
  const metadata = await getGitHubMetadata(parsed.githubUrl)
  const existing = await db.select({ id: skill.id }).from(skill).where(and(eq(skill.organizationId, organizationId), eq(skill.githubUrl, metadata.githubUrl), eq(skill.skillName, parsed.skillName))).limit(1)
  if (existing.length) return { ok: false as const, error: "This skill is already in your team library" }
  await db.insert(skill).values({
    organizationId,
    createdBy: userId,
    githubUrl: metadata.githubUrl,
    skillName: parsed.skillName,
    title: parsed.skillName.replaceAll("-", " "),
    description: metadata.description,
    repoOwner: metadata.repoOwner,
    repoName: metadata.repoName,
    repoStars: metadata.repoStars,
    repoUpdatedAt: metadata.repoUpdatedAt,
    tags: [...new Set(parsed.tags.map((tag) => tag.toLowerCase()))],
  })
  updateTag(cacheTags.organizationSkills(organizationId))
  return { ok: true as const }
}

export async function deleteSkill(id: string) {
  const session = await requireSession()
  const { organizationId } = await requireActiveOrganization(session)
  await db.delete(skill).where(and(eq(skill.id, id), eq(skill.organizationId, organizationId)))
  updateTag(cacheTags.organizationSkills(organizationId))
}

export async function refreshSkill(id: string) {
  const session = await requireSession()
  const { organizationId } = await requireActiveOrganization(session)
  const [savedSkill] = await db.select().from(skill).where(and(eq(skill.id, id), eq(skill.organizationId, organizationId))).limit(1)
  if (!savedSkill) throw new Error("Skill not found")
  const metadata = await getGitHubMetadata(savedSkill.githubUrl)
  await db.update(skill).set({ description: metadata.description, repoStars: metadata.repoStars, repoUpdatedAt: metadata.repoUpdatedAt, metadataRefreshedAt: new Date(), updatedAt: new Date() }).where(and(eq(skill.id, id), eq(skill.organizationId, organizationId)))
  updateTag(cacheTags.organizationSkills(organizationId))
}
