import { and, asc, desc, eq, lt } from "drizzle-orm"

import {
  type AgentAuthStore,
  type AgentClaimRecord,
  type AgentClaimStatus,
  type AgentDelegationRecord,
  type AgentIdentityKey,
  type AgentRegistrationRecord,
  type AgentRegistrationStatus,
  type ReplayPurpose,
} from "@/lib/agent-auth/store"
import { db } from "@/lib/db"
import {
  agentAssertionReplay,
  agentClaim,
  agentCredentialRevocation,
  agentDelegation,
  agentRegistration,
} from "@/lib/db/schema"

type DelegationRow = typeof agentDelegation.$inferSelect
type RegistrationRow = typeof agentRegistration.$inferSelect
type ClaimRow = typeof agentClaim.$inferSelect

function toDelegation(row: DelegationRow): AgentDelegationRecord {
  return { ...row }
}

function toRegistration(row: RegistrationRow): AgentRegistrationRecord {
  return { ...row, status: row.status as AgentRegistrationStatus }
}

function toClaim(row: ClaimRow): AgentClaimRecord {
  return { ...row, status: row.status as AgentClaimStatus }
}

function identityWhere(
  table: typeof agentDelegation | typeof agentRegistration,
  key: AgentIdentityKey,
) {
  return and(
    eq(table.issuer, key.issuer),
    eq(table.subject, key.subject),
    eq(table.audience, key.audience),
  )
}

/**
 * The Postgres implementation of {@link AgentAuthStore}.
 *
 * Every read and write goes through the app's existing Drizzle pool, so agent
 * state shares a transaction boundary and a connection budget with the rest of
 * the application rather than living in a second store.
 */
export const agentAuthStore: AgentAuthStore = {
  async findDelegation(key) {
    const [row] = await db
      .select()
      .from(agentDelegation)
      .where(identityWhere(agentDelegation, key))
      .limit(1)
    return row ? toDelegation(row) : null
  },

  async findDelegationById(id) {
    const [row] = await db
      .select()
      .from(agentDelegation)
      .where(eq(agentDelegation.id, id))
      .limit(1)
    return row ? toDelegation(row) : null
  },

  async upsertDelegation(input) {
    const now = new Date()
    const [row] = await db
      .insert(agentDelegation)
      .values({
        userId: input.userId,
        issuer: input.issuer,
        subject: input.subject,
        audience: input.audience,
        providerName: input.providerName,
        createdAt: now,
        updatedAt: now,
        lastSeenAt: now,
      })
      .onConflictDoUpdate({
        target: [agentDelegation.issuer, agentDelegation.subject, agentDelegation.audience],
        set: {
          userId: input.userId,
          providerName: input.providerName,
          updatedAt: now,
          lastSeenAt: now,
          // Reached only after a human completed a fresh ceremony, or after a
          // live delegation matched; either way the link is current again.
          revokedAt: null,
        },
      })
      .returning()
    return toDelegation(row)
  },

  async touchDelegation(id) {
    await db
      .update(agentDelegation)
      .set({ lastSeenAt: new Date() })
      .where(eq(agentDelegation.id, id))
  },

  async revokeDelegation(key) {
    const now = new Date()
    const registrations = await db
      .update(agentRegistration)
      .set({
        status: "revoked",
        revokedAt: now,
        updatedAt: now,
        // Drop the polling handle so a claim_token that survived the
        // revocation stops resolving to this registration.
        claimTokenHash: null,
        claimTokenExpiresAt: null,
      })
      .where(identityWhere(agentRegistration, key))
      .returning({ id: agentRegistration.id })

    for (const registration of registrations) {
      await db
        .update(agentClaim)
        .set({ status: "superseded" })
        .where(and(eq(agentClaim.registrationId, registration.id), eq(agentClaim.status, "pending")))
    }

    const delegations = await db
      .update(agentDelegation)
      .set({ revokedAt: now, updatedAt: now })
      .where(identityWhere(agentDelegation, key))
      .returning({ id: agentDelegation.id })

    return { delegations: delegations.length, registrations: registrations.length }
  },

  async findRegistrationById(id) {
    const [row] = await db
      .select()
      .from(agentRegistration)
      .where(eq(agentRegistration.id, id))
      .limit(1)
    return row ? toRegistration(row) : null
  },

  async findRegistrationByClaimTokenHash(hash) {
    const [row] = await db
      .select()
      .from(agentRegistration)
      .where(eq(agentRegistration.claimTokenHash, hash))
      .limit(1)
    return row ? toRegistration(row) : null
  },

  async createRegistration(record) {
    const [row] = await db.insert(agentRegistration).values(record).returning()
    return toRegistration(row)
  },

  async updateRegistration(id, patch) {
    const [row] = await db
      .update(agentRegistration)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(agentRegistration.id, id))
      .returning()
    if (!row) throw new Error(`agentRegistration ${id} disappeared while updating it`)
    return toRegistration(row)
  },

  async latestClaim(registrationId) {
    const [row] = await db
      .select()
      .from(agentClaim)
      .where(eq(agentClaim.registrationId, registrationId))
      .orderBy(desc(agentClaim.createdAt), asc(agentClaim.id))
      .limit(1)
    return row ? toClaim(row) : null
  },

  async findClaimByViewTokenHash(hash) {
    const [row] = await db
      .select()
      .from(agentClaim)
      .where(eq(agentClaim.viewTokenHash, hash))
      .limit(1)
    return row ? toClaim(row) : null
  },

  async createClaim(record) {
    const [row] = await db.insert(agentClaim).values(record).returning()
    return toClaim(row)
  },

  async updateClaim(id, patch) {
    const [row] = await db
      .update(agentClaim)
      .set(patch)
      .where(eq(agentClaim.id, id))
      .returning()
    if (!row) throw new Error(`agentClaim ${id} disappeared while updating it`)
    return toClaim(row)
  },

  async supersedeClaims(registrationId) {
    await db
      .update(agentClaim)
      .set({ status: "superseded" })
      .where(and(eq(agentClaim.registrationId, registrationId), eq(agentClaim.status, "pending")))
  },

  async recordJti(jti, purpose: ReplayPurpose, expiresAt) {
    // Sweep first so the table stays bounded without a scheduled job. Bounded
    // by the index on expiresAt and only ever deletes rows that can no longer
    // reject anything, because the assertion they tombstone has expired.
    await db.delete(agentAssertionReplay).where(lt(agentAssertionReplay.expiresAt, new Date()))

    const inserted = await db
      .insert(agentAssertionReplay)
      .values({ jti, purpose, expiresAt })
      .onConflictDoNothing()
      .returning({ jti: agentAssertionReplay.jti })

    // The unique constraint is the arbiter, not a prior read: two concurrent
    // presentations of the same assertion race here, and exactly one wins.
    return inserted.length ? "ok" : "replay"
  },

  async revokeCredential(input) {
    await db.delete(agentCredentialRevocation).where(lt(agentCredentialRevocation.expiresAt, new Date()))
    await db
      .insert(agentCredentialRevocation)
      .values({
        jti: input.jti,
        registrationId: input.registrationId ?? null,
        reason: input.reason,
        expiresAt: input.expiresAt,
      })
      .onConflictDoUpdate({
        target: agentCredentialRevocation.jti,
        set: { reason: input.reason, expiresAt: input.expiresAt },
      })
  },

  async isCredentialRevoked(jti) {
    const [row] = await db
      .select({ jti: agentCredentialRevocation.jti })
      .from(agentCredentialRevocation)
      .where(eq(agentCredentialRevocation.jti, jti))
      .limit(1)
    return Boolean(row)
  },
}
