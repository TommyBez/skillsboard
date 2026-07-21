import { and, count, desc, eq, gt } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { invitation, member, organization, skill, user } from "@/lib/db/schema"

export async function listOrganizationSkills(organizationId: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(cacheTags.organizationSkills(organizationId))

  return db
    .select({
      id: skill.id,
      organizationId: skill.organizationId,
      createdBy: skill.createdBy,
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
      note: skill.note,
      examplePrompts: skill.examplePrompts,
      metadataRefreshedAt: skill.metadataRefreshedAt,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      addedByName: user.name,
    })
    .from(skill)
    .leftJoin(user, eq(skill.createdBy, user.id))
    .where(eq(skill.organizationId, organizationId))
    .orderBy(desc(skill.createdAt))
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
      note: skill.note,
      examplePrompts: skill.examplePrompts,
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
      organizationId: skill.organizationId,
      createdBy: skill.createdBy,
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

export async function listUserOrganizations(userId: string) {
  return db.select({ id: organization.id, name: organization.name, slug: organization.slug, role: member.role }).from(member).innerJoin(organization, eq(member.organizationId, organization.id)).where(eq(member.userId, userId))
}

export async function countOrganizationMembers(organizationId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(member)
    .where(eq(member.organizationId, organizationId))

  return result?.value ?? 0
}

export async function countPendingOrganizationInvitations(organizationId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(invitation)
    .where(and(
      eq(invitation.organizationId, organizationId),
      eq(invitation.status, "pending"),
      gt(invitation.expiresAt, new Date()),
    ))

  return result?.value ?? 0
}

export async function organizationSlugExists(slug: string) {
  const [existing] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1)

  return Boolean(existing)
}
