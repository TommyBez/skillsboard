import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  collection,
  collectionDistribution,
  collectionSkill,
  member,
  skill,
} from "@/lib/db/schema"
import { canChangeCollectionMembership } from "@/lib/installable-collection-permissions"

type CollectionMembershipMutation = "add" | "remove"

interface MutateCollectionMembershipInput {
  collectionId: string
  expectedOrganizationId?: string
  mutation: CollectionMembershipMutation
  skillId: string
  userId: string
}

export type MutateCollectionMembershipResult =
  | {
      changed: boolean
      collectionTitle: string
      organizationId: string
      status: "success"
    }
  | { status: "forbidden" }
  | { status: "not_found" }

export async function mutateCollectionMembership(
  input: MutateCollectionMembershipInput,
): Promise<MutateCollectionMembershipResult> {
  return db.transaction(async (tx) => {
    // Match deleteSkill's lock order so a concurrent skill deletion cannot
    // deadlock with an add that later locks the collection row.
    const [foundSkill] = input.mutation === "add"
      ? await tx
          .select({
            id: skill.id,
            organizationId: skill.organizationId,
          })
          .from(skill)
          .where(and(
            eq(skill.id, input.skillId),
            input.expectedOrganizationId
              ? eq(skill.organizationId, input.expectedOrganizationId)
              : undefined,
          ))
          .limit(1)
          .for("key share")
      : [undefined]

    if (input.mutation === "add" && !foundSkill) {
      return { status: "not_found" as const }
    }

    const [foundCollection] = await tx
      .select({
        createdBy: collection.createdBy,
        id: collection.id,
        organizationId: collection.organizationId,
        title: collection.title,
      })
      .from(collection)
      .where(and(
        eq(collection.id, input.collectionId),
        input.expectedOrganizationId
          ? eq(collection.organizationId, input.expectedOrganizationId)
          : undefined,
      ))
      .limit(1)
      .for("update")

    if (!foundCollection) return { status: "not_found" as const }

    if (
      input.mutation === "add"
      && foundSkill?.organizationId !== foundCollection.organizationId
    ) {
      return { status: "not_found" as const }
    }

    const [organizationMembership] = await tx
      .select({ role: member.role })
      .from(member)
      .where(and(
        eq(member.organizationId, foundCollection.organizationId),
        eq(member.userId, input.userId),
      ))
      .limit(1)
      .for("share")

    if (!organizationMembership) return { status: "not_found" as const }

    const [distribution] = await tx
      .select({ collectionId: collectionDistribution.collectionId })
      .from(collectionDistribution)
      .where(eq(collectionDistribution.collectionId, foundCollection.id))
      .limit(1)
      .for("share")

    if (!canChangeCollectionMembership({
      collectionCreatedBy: foundCollection.createdBy,
      hasDistribution: Boolean(distribution),
      role: organizationMembership.role,
      userId: input.userId,
    })) return { status: "forbidden" as const }

    const changedRows = input.mutation === "add"
      ? await tx
          .insert(collectionSkill)
          .values({
            addedBy: input.userId,
            collectionId: foundCollection.id,
            skillId: input.skillId,
          })
          .onConflictDoNothing()
          .returning({ collectionId: collectionSkill.collectionId })
      : await tx
          .delete(collectionSkill)
          .where(and(
            eq(collectionSkill.collectionId, foundCollection.id),
            eq(collectionSkill.skillId, input.skillId),
          ))
          .returning({ collectionId: collectionSkill.collectionId })

    if (changedRows.length) {
      await tx
        .update(collection)
        .set({ updatedAt: new Date() })
        .where(eq(collection.id, foundCollection.id))
    }

    return {
      changed: changedRows.length > 0,
      collectionTitle: foundCollection.title,
      organizationId: foundCollection.organizationId,
      status: "success" as const,
    }
  })
}
