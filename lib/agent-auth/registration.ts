import { ID_JAG_ASSERTION_TYPE, agentAuthConfig } from "@/lib/agent-auth/config"
import {
  type AgentAuthStore,
  type AgentClaimRecord,
  type AgentDelegationRecord,
  type AgentIdentityKey,
  type AgentRegistrationRecord,
  effectiveRegistrationStatus,
  mintClaimAttemptId,
  mintClaimToken,
  mintClaimViewToken,
  mintUserCode,
  registrationIdFor,
  sha256Hex,
} from "@/lib/agent-auth/store"
import type { AgentUser } from "@/lib/agent-auth/user-resolver"

/**
 * Registration and claim-ceremony state, ported from the reference's
 * `findOrCreateIdJagRegistration` / `completeClaim`.
 *
 * The registration row is keyed on the `(iss, sub, aud)` triple, so the same
 * provider identity always lands on the same row whether or not a human has
 * confirmed it yet, and two concurrent presentations cannot fork it.
 */

export const REGISTRATION_TYPE_ID_JAG = ID_JAG_ASSERTION_TYPE

export type CeremonyMaterial = {
  registration: AgentRegistrationRecord
  claim: AgentClaimRecord
  /** Plaintexts, returned once. Only their hashes are stored. */
  claimTokenPlaintext: string
  claimViewTokenPlaintext: string
  userCode: string
}

export type FindOrCreateResult =
  | { kind: "ready"; registration: AgentRegistrationRecord }
  | ({ kind: "step_up" } & CeremonyMaterial)

type IdJagContext =
  | { user: AgentUser; delegation: AgentDelegationRecord }
  | { email: string }

/**
 * Mints a fresh ceremony on a registration: a new agent-held claim token, a new
 * verification-URL token and a new user code. Any attempt already outstanding is
 * superseded, so a stale link or code stops working the moment a new one exists.
 */
async function mintCeremony(
  store: AgentAuthStore,
  registration: AgentRegistrationRecord,
  loginHintEmail: string,
  now: Date,
): Promise<CeremonyMaterial> {
  const claimTokenPlaintext = mintClaimToken()
  const claimViewTokenPlaintext = mintClaimViewToken()
  const userCode = mintUserCode()

  await store.supersedeClaims(registration.id)

  const updated = await store.updateRegistration(registration.id, {
    status: "pending_claim",
    loginHintEmail,
    claimTokenHash: sha256Hex(claimTokenPlaintext),
    claimTokenExpiresAt: new Date(now.getTime() + agentAuthConfig.claimTtlSeconds * 1000),
    expiresAt: new Date(now.getTime() + agentAuthConfig.claimTtlSeconds * 1000),
    // A ceremony in flight has not been completed; a previously revoked row
    // that reached here is being legitimately re-authorized by a human.
    completedAt: null,
    revokedAt: null,
  })

  const claim = await store.createClaim({
    id: mintClaimAttemptId(),
    registrationId: registration.id,
    viewTokenHash: sha256Hex(claimViewTokenPlaintext),
    viewExpiresAt: new Date(now.getTime() + agentAuthConfig.claimViewTokenTtlSeconds * 1000),
    userCodeHash: sha256Hex(userCode),
    userCodeExpiresAt: new Date(now.getTime() + agentAuthConfig.userCodeTtlSeconds * 1000),
    loginHintEmail,
    attempts: 0,
    status: "pending",
    createdAt: now,
    completedAt: null,
    completedByUserId: null,
  })

  return {
    registration: updated,
    claim,
    claimTokenPlaintext,
    claimViewTokenPlaintext,
    userCode,
  }
}

export async function findOrCreateIdJagRegistration(input: {
  store: AgentAuthStore
  key: AgentIdentityKey
  context: IdJagContext
  requestedScopes: readonly string[]
  now?: Date
}): Promise<FindOrCreateResult> {
  const { store, key, context, requestedScopes } = input
  const now = input.now ?? new Date()
  const id = registrationIdFor(key)
  const existing = await store.findRegistrationById(id)

  if ("user" in context) {
    /* Clean match: a live delegation or a JIT account. No ceremony. */
    if (existing) {
      const registration = await store.updateRegistration(existing.id, {
        userId: context.user.id,
        delegationId: context.delegation.id,
        requestedScopes: [...requestedScopes],
        status: "claimed",
        completedAt: existing.completedAt ?? now,
        /*
         * A prior provider SET may have revoked this registration. Getting a
         * clean match again means the delegation is live: `matchOrProvision`
         * only returns a user for an unrevoked delegation or a fresh JIT
         * account, and reaching here at all required a non-replayed ID-JAG with
         * fresh `auth_time`. Leaving the row revoked would strand it in a
         * "resolved but unusable" state.
         */
        revokedAt: null,
        claimTokenHash: null,
        claimTokenExpiresAt: null,
      })
      await store.supersedeClaims(registration.id)
      return { kind: "ready", registration }
    }

    const registration = await store.createRegistration({
      id,
      type: REGISTRATION_TYPE_ID_JAG,
      issuer: key.issuer,
      subject: key.subject,
      audience: key.audience,
      userId: context.user.id,
      delegationId: context.delegation.id,
      requestedScopes: [...requestedScopes],
      status: "claimed",
      loginHintEmail: null,
      claimTokenHash: null,
      claimTokenExpiresAt: null,
      createdAt: now,
      updatedAt: now,
      expiresAt: null,
      completedAt: now,
      revokedAt: null,
    })
    return { kind: "ready", registration }
  }

  /* Step-up: a human has to confirm the link. */
  if (existing) {
    /*
     * Race: a concurrent ceremony completed between the match and here. Answer
     * exactly as the clean-match path would rather than asking for a retry.
     */
    if (effectiveRegistrationStatus(existing, now) === "claimed" && existing.userId) {
      return { kind: "ready", registration: existing }
    }
    return { kind: "step_up", ...(await mintCeremony(store, existing, context.email, now)) }
  }

  const registration = await store.createRegistration({
    id,
    type: REGISTRATION_TYPE_ID_JAG,
    issuer: key.issuer,
    subject: key.subject,
    audience: key.audience,
    userId: null,
    delegationId: null,
    requestedScopes: [...requestedScopes],
    status: "pending_claim",
    loginHintEmail: context.email,
    claimTokenHash: null,
    claimTokenExpiresAt: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + agentAuthConfig.claimTtlSeconds * 1000),
    completedAt: null,
    revokedAt: null,
  })
  return { kind: "step_up", ...(await mintCeremony(store, registration, context.email, now)) }
}

/** Re-mints a ceremony for a registration the agent already holds a token for. */
export async function reissueCeremony(input: {
  store: AgentAuthStore
  registration: AgentRegistrationRecord
  loginHintEmail: string
  now?: Date
}): Promise<CeremonyMaterial> {
  return mintCeremony(
    input.store,
    input.registration,
    input.loginHintEmail,
    input.now ?? new Date(),
  )
}

export type CompleteClaimResult =
  | { ok: true; registration: AgentRegistrationRecord; delegation: AgentDelegationRecord }
  | {
      ok: false
      error:
        | "user_code_invalid"
        | "user_code_expired"
        | "too_many_attempts"
        | "previously_claimed"
        | "claim_expired"
        | "wrong_account"
    }

/**
 * The human side of the ceremony, run after Better Auth has established who is
 * signed in. This is the only path that creates a delegation for an identity the
 * service had not seen before.
 *
 * `signedInUser` comes from the Better Auth session, never from the request
 * body: the whole point of the step-up is that the person confirming is the
 * person the service authenticated.
 */
export async function completeClaim(input: {
  store: AgentAuthStore
  registration: AgentRegistrationRecord
  claim: AgentClaimRecord
  userCode: string
  signedInUser: AgentUser
  providerName: string
  now?: Date
}): Promise<CompleteClaimResult> {
  const { store, registration, claim, userCode, signedInUser, providerName } = input
  const now = input.now ?? new Date()

  const status = effectiveRegistrationStatus(registration, now)
  if (status === "claimed") return { ok: false, error: "previously_claimed" }
  if (status === "expired" || status === "revoked") return { ok: false, error: "claim_expired" }
  /*
   * An attempt only ever reaches "expired" by spending its code budget below,
   * so say that rather than the generic expiry — the person in front of the
   * page needs to know a fresh code will not help, a fresh ceremony will.
   */
  if (claim.status === "expired") return { ok: false, error: "too_many_attempts" }
  if (claim.status !== "pending") return { ok: false, error: "claim_expired" }
  if (claim.viewExpiresAt.getTime() < now.getTime()) return { ok: false, error: "claim_expired" }
  if (claim.userCodeExpiresAt.getTime() < now.getTime()) {
    return { ok: false, error: "user_code_expired" }
  }

  /*
   * The attempt is bound to the account the agent named. Without this a person
   * who obtained the verification URL could attach the provider identity to
   * their own account and inherit the agent's future access. Compared against
   * the session's user, not against anything the submitter typed.
   */
  if (
    claim.loginHintEmail &&
    claim.loginHintEmail.toLowerCase() !== signedInUser.email.toLowerCase()
  ) {
    return { ok: false, error: "wrong_account" }
  }

  if (claim.attempts >= agentAuthConfig.userCodeMaxAttempts) {
    return { ok: false, error: "too_many_attempts" }
  }

  if (sha256Hex(userCode) !== claim.userCodeHash) {
    const attempts = claim.attempts + 1
    await store.updateClaim(claim.id, {
      attempts,
      // Burn the attempt outright once the budget is spent, so guessing a
      // 6-digit code costs a whole new ceremony rather than another try.
      status: attempts >= agentAuthConfig.userCodeMaxAttempts ? "expired" : "pending",
    })
    return {
      ok: false,
      error: attempts >= agentAuthConfig.userCodeMaxAttempts ? "too_many_attempts" : "user_code_invalid",
    }
  }

  const delegation = await store.upsertDelegation({
    userId: signedInUser.id,
    issuer: registration.issuer,
    subject: registration.subject,
    audience: registration.audience,
    providerName,
  })

  const claimed = await store.updateRegistration(registration.id, {
    userId: signedInUser.id,
    delegationId: delegation.id,
    status: "claimed",
    completedAt: now,
    revokedAt: null,
  })
  await store.updateClaim(claim.id, {
    status: "completed",
    completedAt: now,
    completedByUserId: signedInUser.id,
  })

  return { ok: true, registration: claimed, delegation }
}
