import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto"

import { and, eq, gt, lt, sql } from "drizzle-orm"

import { CLAIM_TTL_SECONDS, type AgentVerifiedScope } from "@/lib/agent-auth/config"
import { hashClaimToken } from "@/lib/agent-auth/identity-assertion"
import { db } from "@/lib/db"
import { agentRegistration } from "@/lib/db/schema"

export type AgentRegistrationStatus =
  | "linked"
  | "pending_claim"
  | "claimed"
  | "expired"
  | "denied"

export interface AgentRegistrationRow {
  id: string
  type: string
  issuer: string
  subject: string
  audience: string
  clientId: string
  email: string | null
  providerName: string | null
  userId: string | null
  requestedScopes: string[]
  status: string
  claimTokenHash: string | null
  userCode: string | null
  attempts: number
  expiresAt: Date
  createdAt: Date
  completedAt: Date | null
}

/**
 * The code a human reads off their agent and types (or checks) in the browser.
 *
 * Eight characters from an unambiguous alphabet — no `0`/`O`, no `1`/`I` — in
 * two groups, because the user is transcribing it from one device to another
 * and the failure mode of a homoglyph is a stranger's ceremony, not a typo
 * they can see.
 */
const USER_CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXZ23456789"

function generateUserCode(): string {
  const bytes = randomBytes(8)
  const characters = [...bytes].map((byte) => USER_CODE_ALPHABET[byte % USER_CODE_ALPHABET.length])
  return `${characters.slice(0, 4).join("")}-${characters.slice(4).join("")}`
}

/**
 * Opens a first-link ceremony.
 *
 * The agent gets `claimToken` once, here, and never again: only its hash is
 * stored, so a database read cannot be turned into the ability to poll — or
 * complete — someone else's link.
 */
export async function createClaimRegistration(input: {
  issuer: string
  subject: string
  audience: string
  clientId: string
  email: string | null
  providerName: string | null
  userId: string | null
  requestedScopes: readonly AgentVerifiedScope[]
}): Promise<{ registration: AgentRegistrationRow; claimToken: string }> {
  const claimToken = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + CLAIM_TTL_SECONDS * 1000)

  const [registration] = await db
    .insert(agentRegistration)
    .values({
      id: randomUUID(),
      type: "identity_assertion",
      issuer: input.issuer,
      subject: input.subject,
      audience: input.audience,
      clientId: input.clientId,
      email: input.email,
      providerName: input.providerName,
      userId: input.userId,
      requestedScopes: [...input.requestedScopes],
      status: "pending_claim" satisfies AgentRegistrationStatus,
      claimTokenHash: hashClaimToken(claimToken),
      userCode: generateUserCode(),
      expiresAt,
    })
    .returning()

  return { registration, claimToken }
}

/**
 * Spends an approved ceremony, returning the row only to the caller that won.
 *
 * A registration the user approved is worth exactly one identity assertion.
 * Without this transition a polling agent would mint a fresh credential on
 * every poll for as long as the row lived, and the `claimed` state would be a
 * standing licence to issue rather than a one-time result. The
 * `status = 'claimed'` predicate makes the transition the arbiter, so
 * concurrent polls resolve to one winner.
 */
export async function exchangeRegistration(
  id: string,
): Promise<AgentRegistrationRow | undefined> {
  const [row] = await db
    .update(agentRegistration)
    .set({ status: "linked" satisfies AgentRegistrationStatus })
    .where(and(eq(agentRegistration.id, id), eq(agentRegistration.status, "claimed")))
    .returning()

  return row
}

export async function findOpenRegistration(id: string): Promise<AgentRegistrationRow | undefined> {
  const [row] = await db
    .select()
    .from(agentRegistration)
    .where(and(eq(agentRegistration.id, id), gt(agentRegistration.expiresAt, new Date())))
    .limit(1)

  return row
}

export async function findOpenRegistrationByUserCode(
  userCode: string,
): Promise<AgentRegistrationRow | undefined> {
  const normalized = userCode.trim().toUpperCase()
  if (!normalized) return undefined

  const [row] = await db
    .select()
    .from(agentRegistration)
    .where(
      and(eq(agentRegistration.userCode, normalized), gt(agentRegistration.expiresAt, new Date())),
    )
    .limit(1)

  return row
}

/**
 * Whether a presented claim token is the one this registration was opened
 * with. Compared in constant time so a polling agent cannot learn the stored
 * hash a byte at a time.
 */
export function claimTokenMatches(registration: AgentRegistrationRow, token: unknown): boolean {
  if (typeof token !== "string" || !registration.claimTokenHash) return false
  const presented = Buffer.from(hashClaimToken(token), "hex")
  const stored = Buffer.from(registration.claimTokenHash, "hex")
  return presented.length === stored.length && timingSafeEqual(presented, stored)
}

/** Counts a poll, so an agent hammering the claim endpoint can be cut off. */
export async function countClaimAttempt(id: string): Promise<number> {
  const [row] = await db
    .update(agentRegistration)
    .set({ attempts: sql`${agentRegistration.attempts} + 1` })
    .where(eq(agentRegistration.id, id))
    .returning({ attempts: agentRegistration.attempts })

  return row?.attempts ?? 0
}

/**
 * Closes a ceremony the user approved, binding it to the account that
 * approved it.
 *
 * The `status = 'pending_claim'` predicate is the concurrency control: two
 * submissions race, one updates a row and one updates nothing, and only the
 * winner is told the claim completed.
 */
export async function completeRegistration(
  id: string,
  userId: string,
): Promise<AgentRegistrationRow | undefined> {
  const [row] = await db
    .update(agentRegistration)
    .set({
      status: "claimed" satisfies AgentRegistrationStatus,
      userId,
      completedAt: new Date(),
    })
    .where(and(eq(agentRegistration.id, id), eq(agentRegistration.status, "pending_claim")))
    .returning()

  return row
}

/** Closes a ceremony the user refused. */
export async function denyRegistration(id: string): Promise<void> {
  await db
    .update(agentRegistration)
    .set({ status: "denied" satisfies AgentRegistrationStatus, completedAt: new Date() })
    .where(and(eq(agentRegistration.id, id), eq(agentRegistration.status, "pending_claim")))
}

/** Drops ceremonies nobody completed, plus the audit rows past their window. */
export async function pruneRegistrations(now = new Date()): Promise<void> {
  await db.delete(agentRegistration).where(lt(agentRegistration.expiresAt, now))
}
