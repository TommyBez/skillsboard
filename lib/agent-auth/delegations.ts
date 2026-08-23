import { and, eq, isNull, sql } from "drizzle-orm"

import { AgentAuthError } from "@/lib/agent-auth/errors"
import { db } from "@/lib/db"
import { agentDelegation, oauthAccessToken, oauthRefreshToken } from "@/lib/db/schema"

/**
 * The queries here run standalone or inside a transaction — revocation has to
 * be atomic with the replay tombstone that guards it (see
 * `applySecurityEventToken`), so every writer takes the executor as a
 * parameter and defaults to the shared client.
 */
type DbClient = typeof db | Parameters<Parameters<(typeof db)["transaction"]>[0]>[0]

export interface AgentDelegationRow {
  id: string
  userId: string
  issuer: string
  subject: string
  audience: string
  providerName: string | null
  revokedAt: Date | null
}

/**
 * The zero-interaction path: an ID-JAG's `(iss, sub, aud)` resolved straight
 * to the user who once approved it.
 *
 * Revoked rows are excluded here but deliberately still exist — see
 * `findDelegation`, which the identity flow uses to tell "never linked" from
 * "linked and then revoked".
 */
export async function findActiveDelegation(key: {
  issuer: string
  subject: string
  audience: string
}): Promise<AgentDelegationRow | undefined> {
  const [row] = await db
    .select()
    .from(agentDelegation)
    .where(
      and(
        eq(agentDelegation.issuer, key.issuer),
        eq(agentDelegation.subject, key.subject),
        eq(agentDelegation.audience, key.audience),
        isNull(agentDelegation.revokedAt),
      ),
    )
    .limit(1)

  return row
}

/** The row for a key whether or not it is revoked. */
export async function findDelegation(key: {
  issuer: string
  subject: string
  audience: string
}): Promise<AgentDelegationRow | undefined> {
  const [row] = await db
    .select()
    .from(agentDelegation)
    .where(
      and(
        eq(agentDelegation.issuer, key.issuer),
        eq(agentDelegation.subject, key.subject),
        eq(agentDelegation.audience, key.audience),
      ),
    )
    .limit(1)

  return row
}

export async function findActiveDelegationById(id: string): Promise<AgentDelegationRow | undefined> {
  const [row] = await db
    .select()
    .from(agentDelegation)
    .where(and(eq(agentDelegation.id, id), isNull(agentDelegation.revokedAt)))
    .limit(1)

  return row
}

/**
 * Writes the delegation the caller has already established.
 *
 * The conflict target is the `(issuer, subject, audience)` unique index, so a
 * ceremony completed twice — a double-submitted form, a retried poll — settles
 * on one row rather than failing.
 *
 * Both callers have already decided who the delegation belongs to: the
 * identity flow only gets here with an active delegation's own `userId` or a
 * freshly provisioned account, and the ceremony only gets here after an
 * authenticated user confirmed the link. `revokedAt` is cleared as part of
 * that, which is the one way a revoked delegation comes back — and the
 * identity flow refuses a revoked delegation before reaching this function, so
 * a fresh ID-JAG on its own can never reinstate one.
 */
export async function upsertDelegation(input: {
  userId: string
  issuer: string
  subject: string
  audience: string
  providerName?: string | null
}): Promise<AgentDelegationRow> {
  const [row] = await db
    .insert(agentDelegation)
    .values({
      userId: input.userId,
      issuer: input.issuer,
      subject: input.subject,
      audience: input.audience,
      providerName: input.providerName ?? null,
    })
    .onConflictDoUpdate({
      target: [agentDelegation.issuer, agentDelegation.subject, agentDelegation.audience],
      set: {
        userId: input.userId,
        providerName: input.providerName ?? null,
        revokedAt: null,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    })
    .returning()

  return row
}

/**
 * Revokes every access and refresh token minted through a delegation.
 *
 * The jwt-bearer grant stamps `referenceId = delegation.id` on the tokens it
 * issues, which is what makes this query possible: revoking the delegation is
 * a statement about the *relationship*, and the credentials derived from it
 * must not outlive it. This is the same `revoked` mark `/oauth2/revoke`
 * writes, so introspection and opaque validation reject the tokens
 * immediately; a JWT access token already in flight validates statelessly
 * until its own `exp`, which is the ceiling Better Auth's model has.
 */
export async function revokeDelegationTokens(
  delegationId: string,
  client: DbClient = db,
): Promise<void> {
  const revoked = sql`CURRENT_TIMESTAMP`
  await client
    .update(oauthAccessToken)
    .set({ revoked })
    .where(and(eq(oauthAccessToken.referenceId, delegationId), isNull(oauthAccessToken.revoked)))
  await client
    .update(oauthRefreshToken)
    .set({ revoked })
    .where(and(eq(oauthRefreshToken.referenceId, delegationId), isNull(oauthRefreshToken.revoked)))
}

/** Stamps a successful exchange, so an operator can see a delegation is live. */
export async function touchDelegation(id: string): Promise<void> {
  await db
    .update(agentDelegation)
    .set({ lastUsedAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(agentDelegation.id, id))
}

/**
 * Writes the delegation the identity flow resolved, without ever resurrecting
 * a revoked one.
 *
 * `onConflictDoNothing` instead of an upsert is the point: between the flow's
 * revocation check and this write, a security event can land, and an update
 * that cleared `revokedAt` here would let an already-in-flight ID-JAG undo it.
 * On conflict the stored row is re-read and its `revokedAt` is honoured; only
 * the claim ceremony's `upsertDelegation`, backed by a human approval, may
 * clear a tombstone.
 */
export async function createDelegationIfAbsent(input: {
  userId: string
  issuer: string
  subject: string
  audience: string
  providerName?: string | null
}): Promise<AgentDelegationRow> {
  const [inserted] = await db
    .insert(agentDelegation)
    .values({
      userId: input.userId,
      issuer: input.issuer,
      subject: input.subject,
      audience: input.audience,
      providerName: input.providerName ?? null,
    })
    .onConflictDoNothing()
    .returning()

  if (inserted) return inserted

  const existing = await findDelegation({
    issuer: input.issuer,
    subject: input.subject,
    audience: input.audience,
  })

  // A concurrent writer beat this one. Revoked or re-pointed, the stored row
  // wins and this exchange does not: resolving it takes the ceremony.
  if (!existing || existing.revokedAt || existing.userId !== input.userId) {
    throw new AgentAuthError(
      "access_denied",
      "This delegation was revoked. The account holder has to approve the link again.",
    )
  }

  return existing
}

/**
 * Marks a delegation revoked, returning the row when one changed.
 *
 * Idempotent: an already-revoked delegation keeps its original `revokedAt`, so
 * a provider that retries a security event does not keep moving the timestamp.
 */
export async function revokeDelegation(
  key: {
    issuer: string
    subject: string
    audience: string
  },
  client: DbClient = db,
): Promise<AgentDelegationRow | undefined> {
  const [row] = await client
    .update(agentDelegation)
    .set({ revokedAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(
      and(
        eq(agentDelegation.issuer, key.issuer),
        eq(agentDelegation.subject, key.subject),
        eq(agentDelegation.audience, key.audience),
        isNull(agentDelegation.revokedAt),
      ),
    )
    .returning()

  return row
}
