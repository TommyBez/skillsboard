import { eq } from "drizzle-orm"

import {
  allowsJitProvisioning,
  CLAIM_POLL_INTERVAL_SECONDS,
  getAgentAudience,
  JWT_BEARER_GRANT_TYPE,
  resolveAgentVerifiedScopes,
  type AgentVerifiedScope,
} from "@/lib/agent-auth/config"
import {
  createDelegationIfAbsent,
  findActiveDelegation,
  touchDelegation,
  type AgentDelegationRow,
} from "@/lib/agent-auth/delegations"
import { AgentAuthError } from "@/lib/agent-auth/errors"
import { verifyIdJag, type VerifiedIdJag } from "@/lib/agent-auth/id-jag"
import {
  mintIdentityAssertion,
  type MintedIdentityAssertion,
} from "@/lib/agent-auth/identity-assertion"
import { pruneConsumedAssertions } from "@/lib/agent-auth/replay"
import { createClaimRegistration, pruneRegistrations } from "@/lib/agent-auth/registrations"
import { discoveryUrl } from "@/lib/agent-discovery"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export interface IdentityRequest {
  type?: unknown
  assertion_type?: unknown
  assertion?: unknown
  client_id?: unknown
  scope?: unknown
  scopes?: unknown
}

export interface IdentityAssertionResult {
  identity_assertion: string
  assertion_expires: string
  scopes: AgentVerifiedScope[]
  token_endpoint: string
  grant_type: string
}

/**
 * `POST /agent/identity`, end to end.
 *
 * Verify the ID-JAG, resolve it to a Skills Board user, and mint the assertion
 * the agent exchanges at the token endpoint. The three ways it can end are the
 * three cases the auth.md security model names: an existing delegation
 * resolves silently, a stranger's verified email is either provisioned or
 * refused, and a verified email that *already belongs to an account* stops and
 * asks the human.
 */
export async function runIdentityFlow(
  request: IdentityRequest,
  { clientId }: { clientId: string },
): Promise<{ result: IdentityAssertionResult; delegationId: string }> {
  const idJag = await verifyIdJag(request.assertion)
  const audience = getAgentAudience()
  const requestedScopes = resolveAgentVerifiedScopes(readRequestedScopes(request))

  // Housekeeping on the path that creates the rows. Failures here are not the
  // caller's problem and must never fail an otherwise valid exchange.
  void pruneExpiredState()

  const resolution = await resolveUserForIdJag(idJag, { clientId, requestedScopes, audience })
  const userId = resolution.userId

  // An already-active delegation is used as found, never rewritten: an update
  // here could race a concurrent revocation event and clear a tombstone that
  // was just written. Only a resolution with no row yet (JIT provisioning)
  // creates one, and `createDelegationIfAbsent` refuses to touch a revoked one.
  const delegation =
    resolution.delegation ??
    (await createDelegationIfAbsent({
      userId,
      issuer: idJag.issuer,
      subject: idJag.subject,
      audience,
      providerName: idJag.provider.displayName,
    }))

  // `lastUsedAt` on the delegation is the record that an exchange happened;
  // `agentRegistration` stays a queue of in-flight ceremonies rather than
  // collecting a row per zero-interaction request.
  await touchDelegation(delegation.id)

  const minted = await mintIdentityAssertion({
    userId,
    delegationId: delegation.id,
    clientId,
    scopes: requestedScopes,
    providerIssuer: idJag.issuer,
    providerSubject: idJag.subject,
    authTime: idJag.authTime,
  })

  return { result: toResult(minted), delegationId: delegation.id }
}

export function toResult(minted: MintedIdentityAssertion): IdentityAssertionResult {
  return {
    identity_assertion: minted.assertion,
    assertion_expires: minted.expiresAt.toISOString(),
    scopes: minted.scopes,
    token_endpoint: discoveryUrl("/api/auth/oauth2/token"),
    grant_type: JWT_BEARER_GRANT_TYPE,
  }
}

/**
 * The resolution ladder, in the one order that is safe.
 *
 * A: an active delegation exists — use it, and never re-derive the user from
 * the email, because the delegation is the stronger statement and the email
 * may since have moved.
 *
 * B: no delegation, no account with that verified email — provision one only
 * if an operator turned that on.
 *
 * C: no delegation, but an account already uses that verified email — stop.
 * This is the case the whole flow exists to get right: `email_verified: true`
 * means the provider checked the address, not that the provider is entitled to
 * the Skills Board account that happens to share it.
 *
 * A *revoked* delegation deliberately falls through to the same ladder rather
 * than dead-ending: the assertion alone can never reactivate it (case A only
 * matches active rows, and `createDelegationIfAbsent` refuses a tombstone),
 * but the account holder can re-approve the link through the case C ceremony —
 * which is exactly the recovery the revocation error tells the agent to seek.
 */
async function resolveUserForIdJag(
  idJag: VerifiedIdJag,
  context: {
    clientId: string
    requestedScopes: AgentVerifiedScope[]
    audience: string
  },
): Promise<{ userId: string; delegation?: AgentDelegationRow }> {
  const key = { issuer: idJag.issuer, subject: idJag.subject, audience: context.audience }

  const active = await findActiveDelegation(key)
  if (active) return { userId: active.userId, delegation: active }

  const email = idJag.emailVerified ? idJag.email : undefined
  if (!email) {
    // Only a verified phone number got us this far. Skills Board identifies
    // accounts by email, so there is nothing here to match or provision on.
    throw new AgentAuthError(
      "invalid_grant",
      "Skills Board links agent identities by verified email address, and this assertion carries none.",
    )
  }

  const existing = await findUserByEmail(email)

  if (existing) {
    // Case C. The ceremony, not the assertion, decides.
    throw await buildClaimChallenge(idJag, existing.id, context)
  }

  if (!allowsJitProvisioning()) {
    throw new AgentAuthError(
      "access_denied",
      "No Skills Board account uses this email address. Sign in to Skills Board once to create it, then link this agent.",
    )
  }

  const provisioned = await provisionUser({ email, providerName: idJag.provider.displayName })

  // The account came into existence between the lookup above and the create —
  // another request, or an ordinary signup. That address now belongs to an
  // existing account, which is case C, not case B: the collision loser does
  // not get to adopt an account it did not create.
  if (provisioned.collidedWithExisting) {
    throw await buildClaimChallenge(idJag, provisioned.userId, context)
  }

  return { userId: provisioned.userId }
}

/**
 * Case C's answer: `interaction_required`, plus everything the agent needs to
 * put a human in front of the ceremony.
 *
 * Returned as an error rather than a result because that is what it is — the
 * exchange did not produce a credential — and because an agent that treats a
 * 200 as success would otherwise silently believe it was linked.
 */
async function buildClaimChallenge(
  idJag: VerifiedIdJag,
  userId: string,
  context: { clientId: string; requestedScopes: AgentVerifiedScope[]; audience: string },
): Promise<AgentAuthError> {
  const { registration, claimToken } = await createClaimRegistration({
    issuer: idJag.issuer,
    subject: idJag.subject,
    audience: context.audience,
    clientId: context.clientId,
    email: idJag.email ?? null,
    providerName: idJag.provider.displayName,
    // Recorded so the ceremony can check that the human who signs in is the
    // one this link would bind to; it is not a decision the agent gets to see.
    userId,
    requestedScopes: context.requestedScopes,
  })

  return new AgentAuthError(
    "interaction_required",
    "A Skills Board account already uses this email address. The account holder has to approve this agent once.",
    {
      registration_id: registration.id,
      claim_url: discoveryUrl("/agent/identity/claim"),
      claim_token: claimToken,
      claim: {
        user_code: registration.userCode,
        verification_uri: discoveryUrl("/agent/claim"),
        verification_uri_complete: discoveryUrl(`/agent/claim/${registration.id}`),
        interval: CLAIM_POLL_INTERVAL_SECONDS,
        expires_in: Math.max(
          0,
          Math.floor((registration.expiresAt.getTime() - Date.now()) / 1000),
        ),
      },
    },
  )
}

async function findUserByEmail(email: string): Promise<{ id: string } | undefined> {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  return row
}

/**
 * Case B, when an operator has enabled it.
 *
 * Created through Better Auth's own internal adapter rather than by inserting
 * a row, so the account is byte-for-byte the account an OTP sign-in would have
 * created — same id shape, same hooks, same downstream assumptions. There is
 * exactly one kind of Skills Board user, and this is how it stays that way.
 */
async function provisionUser({
  email,
  providerName,
}: {
  email: string
  providerName: string
}): Promise<{ userId: string; collidedWithExisting: boolean }> {
  const context = await auth.$context

  try {
    const created = await context.internalAdapter.createUser(
      {
        email,
        name: email.split("@")[0] ?? email,
        // The provider verified it, and the trust list is what makes that
        // provider's word good enough to stand in for our own OTP here.
        emailVerified: true,
      },
      // The provisioning method, in Better Auth's own vocabulary. It is not
      // one of the built-in ones — the identity came from an agent provider's
      // ID-JAG — so it is named for what it is, and a `validateUserInfo` gate
      // can single this path out.
      { method: "agent-id-jag" },
    )
    return { userId: created.id, collidedWithExisting: false }
  } catch (error) {
    // The unique index on email says someone else created this account after
    // the lookup. Reported rather than adopted: the caller has to send this
    // through the claim ceremony like any other existing account.
    const existing = await findUserByEmail(email)
    if (existing) return { userId: existing.id, collidedWithExisting: true }

    console.error("Unable to provision a Skills Board account from an agent assertion", {
      provider: providerName,
      name: error instanceof Error ? error.name : "UnknownError",
    })
    throw new AgentAuthError("server_error", "The account could not be created.")
  }
}

function readRequestedScopes(request: IdentityRequest): string[] | undefined {
  if (typeof request.scope === "string") return request.scope.split(" ").filter(Boolean)
  if (Array.isArray(request.scopes)) {
    return request.scopes.filter((scope): scope is string => typeof scope === "string")
  }
  return undefined
}

async function pruneExpiredState(): Promise<void> {
  try {
    await Promise.all([pruneConsumedAssertions(), pruneRegistrations()])
  } catch (error) {
    console.error("Unable to prune expired agent auth state", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
  }
}
