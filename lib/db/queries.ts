import { and, asc, count, desc, eq, gt } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { collection, collectionSkill, invitation, member, organization, skill, user } from "@/lib/db/schema"

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

export async function listOrganizationCollections(organizationId: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(cacheTags.organizationCollections(organizationId))

  return db
    .select({
      id: collection.id,
      organizationId: collection.organizationId,
      createdBy: collection.createdBy,
      title: collection.title,
      description: collection.description,
      tags: collection.tags,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      createdByName: user.name,
      skillCount: count(collectionSkill.skillId),
    })
    .from(collection)
    .leftJoin(user, eq(collection.createdBy, user.id))
    .leftJoin(collectionSkill, eq(collectionSkill.collectionId, collection.id))
    .where(eq(collection.organizationId, organizationId))
    .groupBy(collection.id, user.name)
    .orderBy(desc(collection.createdAt))
}

export async function getOrganizationCollection(organizationId: string, collectionId: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(cacheTags.organizationCollections(organizationId))

  const [found] = await db
    .select({
      id: collection.id,
      organizationId: collection.organizationId,
      createdBy: collection.createdBy,
      title: collection.title,
      description: collection.description,
      tags: collection.tags,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      createdByName: user.name,
    })
    .from(collection)
    .leftJoin(user, eq(collection.createdBy, user.id))
    .where(and(eq(collection.id, collectionId), eq(collection.organizationId, organizationId)))
    .limit(1)

  return found ?? null
}

export async function listCollectionSkills(organizationId: string, collectionId: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(cacheTags.organizationCollections(organizationId))
  cacheTag(cacheTags.organizationSkills(organizationId))

  return db
    .select({
      id: skill.id,
      createdBy: skill.createdBy,
      githubUrl: skill.githubUrl,
      skillName: skill.skillName,
      title: skill.title,
      description: skill.description,
      repoOwner: skill.repoOwner,
      repoName: skill.repoName,
      repoStars: skill.repoStars,
      skillPath: skill.skillPath,
      tags: skill.tags,
      note: skill.note,
      examplePrompts: skill.examplePrompts,
      addedByName: user.name,
      addedToCollectionAt: collectionSkill.createdAt,
    })
    .from(collectionSkill)
    .innerJoin(skill, and(
      eq(collectionSkill.skillId, skill.id),
      eq(skill.organizationId, organizationId),
    ))
    .leftJoin(user, eq(skill.createdBy, user.id))
    .where(eq(collectionSkill.collectionId, collectionId))
    .orderBy(asc(collectionSkill.createdAt))
}

export async function listOrganizationCollectionMemberships(organizationId: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(cacheTags.organizationCollections(organizationId))

  return db
    .select({
      collectionId: collectionSkill.collectionId,
      skillId: collectionSkill.skillId,
    })
    .from(collectionSkill)
    .innerJoin(collection, and(
      eq(collectionSkill.collectionId, collection.id),
      eq(collection.organizationId, organizationId),
    ))
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
