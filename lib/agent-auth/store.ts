import { createHash, randomBytes, randomInt } from "node:crypto"

/**
 * Persistence contract for the auth.md Agent Verified state.
 *
 * The WorkOS reference keeps all of this in Maps; here it is an interface so the
 * protocol code stays free of Drizzle and so tests can run every
 * security-sensitive branch against an in-memory implementation. The Postgres
 * implementation lives in `store-db.ts`.
 */

export type AgentRegistrationStatus =
  | "pending_claim"
  | "claimed"
  | "revoked"
  | "expired"

export type AgentClaimStatus = "pending" | "completed" | "superseded" | "expired"

export type AgentDelegationRecord = {
  id: string
  userId: string
  issuer: string
  subject: string
  audience: string
  providerName: string
  createdAt: Date
  updatedAt: Date
  lastSeenAt: Date
  revokedAt: Date | null
}

export type AgentRegistrationRecord = {
  id: string
  type: string
  issuer: string
  subject: string
  audience: string
  userId: string | null
  delegationId: string | null
  requestedScopes: string[]
  status: AgentRegistrationStatus
  loginHintEmail: string | null
  claimTokenHash: string | null
  claimTokenExpiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  expiresAt: Date | null
  completedAt: Date | null
  revokedAt: Date | null
}

export type AgentClaimRecord = {
  id: string
  registrationId: string
  viewTokenHash: string
  viewExpiresAt: Date
  userCodeHash: string
  userCodeExpiresAt: Date
  loginHintEmail: string | null
  attempts: number
  status: AgentClaimStatus
  createdAt: Date
  completedAt: Date | null
  completedByUserId: string | null
}

export type AgentIdentityKey = {
  issuer: string
  subject: string
  audience: string
}

/** Purposes a `jti` tombstone can be recorded under; each has its own space. */
export type ReplayPurpose = "id_jag" | "secevent" | "service_assertion"

export interface AgentAuthStore {
  findDelegation(key: AgentIdentityKey): Promise<AgentDelegationRecord | null>
  findDelegationById(id: string): Promise<AgentDelegationRecord | null>
  /**
   * Creates the `(iss, sub, aud) → userId` link, or refreshes `lastSeenAt` on
   * the existing one. Reviving a revoked row is deliberate and only ever
   * reached after a human completed a fresh confirmation ceremony.
   */
  upsertDelegation(input: {
    userId: string
    issuer: string
    subject: string
    audience: string
    providerName: string
  }): Promise<AgentDelegationRecord>
  touchDelegation(id: string): Promise<void>
  /** Provider-driven revocation: severs the delegation and its registration. */
  revokeDelegation(key: AgentIdentityKey): Promise<{
    delegations: number
    registrations: number
  }>

  findRegistrationById(id: string): Promise<AgentRegistrationRecord | null>
  findRegistrationByClaimTokenHash(hash: string): Promise<AgentRegistrationRecord | null>
  createRegistration(record: AgentRegistrationRecord): Promise<AgentRegistrationRecord>
  updateRegistration(
    id: string,
    patch: Partial<Omit<AgentRegistrationRecord, "id">>,
  ): Promise<AgentRegistrationRecord>

  latestClaim(registrationId: string): Promise<AgentClaimRecord | null>
  findClaimByViewTokenHash(hash: string): Promise<AgentClaimRecord | null>
  createClaim(record: AgentClaimRecord): Promise<AgentClaimRecord>
  updateClaim(id: string, patch: Partial<Omit<AgentClaimRecord, "id">>): Promise<AgentClaimRecord>
  /** Marks every pending attempt on a registration superseded. */
  supersedeClaims(registrationId: string): Promise<void>

  /**
   * Single-use `jti`. Returns `"replay"` when this `jti` was already consumed
   * for this purpose; the tombstone lives until `expiresAt`.
   */
  recordJti(jti: string, purpose: ReplayPurpose, expiresAt: Date): Promise<"ok" | "replay">

  revokeCredential(input: {
    jti: string
    registrationId?: string | null
    reason: string
    expiresAt: Date
  }): Promise<void>
  isCredentialRevoked(jti: string): Promise<boolean>
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

function randomToken(prefix: string, bytes = 24): string {
  return `${prefix}${randomBytes(bytes).toString("base64url")}`
}

/** Agent-facing polling handle for a claim ceremony. */
export function mintClaimToken(): string {
  return randomToken("clm_", 24)
}

/** Binds the verification URL to one attempt without carrying the user code. */
export function mintClaimViewToken(): string {
  return randomToken("cvt_", 24)
}

export function mintClaimAttemptId(): string {
  return randomToken("cla_", 16)
}

/**
 * The 6-digit code the human types. `randomInt` is the CSPRNG-backed generator;
 * a predictable code would let anyone who can reach the verification URL
 * complete someone else's ceremony.
 */
export function mintUserCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0")
}

/**
 * Registration id, derived from the identity triple.
 *
 * Deriving it rather than randomising means the same `(iss, sub, aud)` always
 * lands on the same row, so a concurrent second presentation of an ID-JAG
 * cannot create a rival registration for the same delegation. It is a hash, so
 * the id itself discloses no provider identity.
 */
export function registrationIdFor(key: AgentIdentityKey): string {
  return `reg_${sha256Hex(`${key.issuer}|${key.subject}|${key.audience}`).slice(0, 32)}`
}

/**
 * Registration status derived from timestamps, the way the reference derives it
 * from its fields — there is no sweeper marking rows expired, so a stored
 * `status` alone would go stale.
 */
export function effectiveRegistrationStatus(
  registration: AgentRegistrationRecord,
  now = new Date(),
): AgentRegistrationStatus {
  if (registration.revokedAt) return "revoked"
  if (registration.completedAt) return "claimed"
  if (registration.expiresAt && registration.expiresAt.getTime() < now.getTime()) return "expired"
  return "pending_claim"
}
