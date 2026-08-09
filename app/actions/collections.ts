"use server"

import { and, count, eq } from "drizzle-orm"
import { updateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { mutateCollectionMembership } from "@/lib/db/collection-memberships"
import { collection, collectionSkill } from "@/lib/db/schema"
import { captureTeamEvent } from "@/lib/posthog-server"
import { isOrganizationAdmin, requireActiveOrganization, requireSession } from "@/lib/session"

const collectionTagsSchema = z
  .array(z.string().trim().min(1).max(30))
  .max(10)
  .transform((tags) => [...new Set(tags)])

const collectionDetailsSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  tags: collectionTagsSchema.default([]),
})

const createCollectionSchema = collectionDetailsSchema

export async function createCollection(input: z.input<typeof createCollectionSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = createCollectionSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Add a title up to 80 characters, a description up to 500, and up to 10 tags." }
  }

  const [created] = await db
    .insert(collection)
    .values({
      organizationId,
      createdBy: userId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      tags: parsed.data.tags,
    })
    .returning({ id: collection.id })

  updateTag(cacheTags.organizationCollections(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "collection_created",
    properties: {
      collection_id: created.id,
      has_description: Boolean(parsed.data.description),
      surface: "web",
      tag_count: parsed.data.tags.length,
    },
    teamId: organizationId,
  })
  return { ok: true as const, collectionId: created.id }
}

const updateCollectionSchema = collectionDetailsSchema.extend({
  collectionId: z.uuid(),
})

export async function updateCollection(input: z.input<typeof updateCollectionSchema>) {
  const session = await requireSession()
  const { organizationId, userId, role } = await requireActiveOrganization(session)
  const parsed = updateCollectionSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Add a title up to 80 characters, a description up to 500, and up to 10 tags." }
  }

  const [existing] = await db
    .select({ id: collection.id, createdBy: collection.createdBy })
    .from(collection)
    .where(and(eq(collection.id, parsed.data.collectionId), eq(collection.organizationId, organizationId)))
    .limit(1)

  if (!existing) {
    return { ok: false as const, error: "Collection not found" }
  }

  if (existing.createdBy !== userId && !isOrganizationAdmin(role)) {
    return {
      ok: false as const,
      error: "Only the person who created this collection, or a team admin, can edit it.",
    }
  }

  await db
    .update(collection)
    .set({
      title: parsed.data.title,
      description: parsed.data.description || null,
      tags: parsed.data.tags,
      updatedAt: new Date(),
    })
    .where(and(eq(collection.id, parsed.data.collectionId), eq(collection.organizationId, organizationId)))

  updateTag(cacheTags.organizationCollections(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "collection_updated",
    properties: {
      collection_id: parsed.data.collectionId,
      has_description: Boolean(parsed.data.description),
      tag_count: parsed.data.tags.length,
    },
    teamId: organizationId,
  })
  return { ok: true as const }
}

const deleteCollectionSchema = z.object({
  collectionId: z.uuid(),
})

export async function deleteCollection(input: z.input<typeof deleteCollectionSchema>) {
  const session = await requireSession()
  const { organizationId, userId, role } = await requireActiveOrganization(session)
  const parsed = deleteCollectionSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Collection not found" }
  }

  const [existing] = await db
    .select({ id: collection.id, createdBy: collection.createdBy })
    .from(collection)
    .where(and(eq(collection.id, parsed.data.collectionId), eq(collection.organizationId, organizationId)))
    .limit(1)

  if (!existing) {
    return { ok: false as const, error: "Collection not found" }
  }

  if (existing.createdBy !== userId && !isOrganizationAdmin(role)) {
    return {
      ok: false as const,
      error: "Only the person who created this collection, or a team admin, can delete it.",
    }
  }

  const [skillTally] = await db
    .select({ value: count() })
    .from(collectionSkill)
    .where(eq(collectionSkill.collectionId, parsed.data.collectionId))

  await db
    .delete(collection)
    .where(and(eq(collection.id, parsed.data.collectionId), eq(collection.organizationId, organizationId)))

  updateTag(cacheTags.organizationCollections(organizationId))
  captureTeamEvent({
    distinctId: userId,
    event: "collection_deleted",
    properties: {
      collection_id: parsed.data.collectionId,
      skill_count: skillTally?.value ?? 0,
    },
    teamId: organizationId,
  })
  return { ok: true as const }
}

const collectionMembershipSchema = z.object({
  collectionId: z.uuid(),
  skillId: z.uuid(),
  surface: z.enum(["collection_detail", "library"]).default("library"),
})

export async function addSkillToCollection(input: z.input<typeof collectionMembershipSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = collectionMembershipSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Collection or skill not found" }
  }

  const outcome = await mutateCollectionMembership({
    collectionId: parsed.data.collectionId,
    expectedOrganizationId: organizationId,
    mutation: "add",
    skillId: parsed.data.skillId,
    userId,
  })
  if (outcome.status === "not_found") {
    return { ok: false as const, error: "Collection or skill not found" }
  }
  if (outcome.status === "forbidden") {
    return {
      ok: false as const,
      error: "Only the collection creator or a team admin can change an installable collection.",
    }
  }

  if (outcome.changed) {
    updateTag(cacheTags.organizationCollections(outcome.organizationId))
    captureTeamEvent({
      distinctId: userId,
      event: "collection_skill_added",
      properties: {
        collection_id: parsed.data.collectionId,
        skill_id: parsed.data.skillId,
        surface: parsed.data.surface,
      },
      teamId: outcome.organizationId,
    })
  }
  return { ok: true as const, changed: outcome.changed }
}

export async function removeSkillFromCollection(input: z.input<typeof collectionMembershipSchema>) {
  const session = await requireSession()
  const { organizationId, userId } = await requireActiveOrganization(session)
  const parsed = collectionMembershipSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false as const, error: "Collection or skill not found" }
  }

  const outcome = await mutateCollectionMembership({
    collectionId: parsed.data.collectionId,
    expectedOrganizationId: organizationId,
    mutation: "remove",
    skillId: parsed.data.skillId,
    userId,
  })
  if (outcome.status === "not_found") {
    return { ok: false as const, error: "Collection not found" }
  }
  if (outcome.status === "forbidden") {
    return {
      ok: false as const,
      error: "Only the collection creator or a team admin can change an installable collection.",
    }
  }

  if (outcome.changed) {
    updateTag(cacheTags.organizationCollections(outcome.organizationId))
    captureTeamEvent({
      distinctId: userId,
      event: "collection_skill_removed",
      properties: {
        collection_id: parsed.data.collectionId,
        skill_id: parsed.data.skillId,
        surface: parsed.data.surface,
      },
      teamId: outcome.organizationId,
    })
  }
  return { ok: true as const, changed: outcome.changed }
}
