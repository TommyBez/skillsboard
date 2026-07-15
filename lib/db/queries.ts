import { and, desc, eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { member, organization, skill } from "@/lib/db/schema"

export async function listOrganizationSkills(organizationId: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(cacheTags.organizationSkills(organizationId))

  return db.select().from(skill).where(eq(skill.organizationId, organizationId)).orderBy(desc(skill.createdAt))
}

export async function listUserSkills(userId: string) {
  return db
    .select({
      id: skill.id,
      organizationId: skill.organizationId,
      organizationName: organization.name,
      githubUrl: skill.githubUrl,
      skillName: skill.skillName,
      title: skill.title,
      description: skill.description,
      repoOwner: skill.repoOwner,
      repoName: skill.repoName,
      repoStars: skill.repoStars,
      repoUpdatedAt: skill.repoUpdatedAt,
      skillPath: skill.skillPath,
      tags: skill.tags,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    })
    .from(skill)
    .innerJoin(member, and(
      eq(member.organizationId, skill.organizationId),
      eq(member.userId, userId),
    ))
    .innerJoin(organization, eq(organization.id, skill.organizationId))
    .orderBy(desc(skill.createdAt))
}

export async function getUserSkill(userId: string, skillId: string) {
  const [savedSkill] = await db
    .select({
      id: skill.id,
      githubUrl: skill.githubUrl,
      skillName: skill.skillName,
      skillPath: skill.skillPath,
    })
    .from(skill)
    .innerJoin(member, and(
      eq(member.organizationId, skill.organizationId),
      eq(member.userId, userId),
    ))
    .where(eq(skill.id, skillId))
    .limit(1)

  return savedSkill ?? null
}

export async function canAccessOrganization(userId: string, organizationId: string) {
  const rows = await db.select({ id: member.id }).from(member).where(and(eq(member.userId, userId), eq(member.organizationId, organizationId))).limit(1)
  return rows.length > 0
}

export async function listUserOrganizations(userId: string) {
  return db.select({ id: organization.id, name: organization.name, slug: organization.slug, role: member.role }).from(member).innerJoin(organization, eq(member.organizationId, organization.id)).where(eq(member.userId, userId))
}
