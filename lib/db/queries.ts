import { and, desc, eq, inArray } from "drizzle-orm"
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
  const memberships = await db.select({ organizationId: member.organizationId }).from(member).where(eq(member.userId, userId))
  if (!memberships.length) return []
  return db.select().from(skill).where(inArray(skill.organizationId, memberships.map((item) => item.organizationId))).orderBy(desc(skill.createdAt))
}

export async function canAccessOrganization(userId: string, organizationId: string) {
  const rows = await db.select({ id: member.id }).from(member).where(and(eq(member.userId, userId), eq(member.organizationId, organizationId))).limit(1)
  return rows.length > 0
}

export async function listUserOrganizations(userId: string) {
  return db.select({ id: organization.id, name: organization.name, slug: organization.slug, role: member.role }).from(member).innerJoin(organization, eq(member.organizationId, organization.id)).where(eq(member.userId, userId))
}
