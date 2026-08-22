import {
  CLAIM_POLL_INTERVAL_SECONDS,
  resolveAgentVerifiedScopes,
} from "@/lib/agent-auth/config"
import { touchDelegation, upsertDelegation } from "@/lib/agent-auth/delegations"
import { AgentAuthError } from "@/lib/agent-auth/errors"
import { mintIdentityAssertion } from "@/lib/agent-auth/identity-assertion"
import { toResult, type IdentityAssertionResult } from "@/lib/agent-auth/identity-flow"
import {
  claimTokenMatches,
  countClaimAttempt,
  exchangeRegistration,
  findOpenRegistration,
  type AgentRegistrationRow,
} from "@/lib/agent-auth/registrations"

/** Polls beyond this on one registration are refused rather than answered. */
const MAX_CLAIM_ATTEMPTS = 240

export type ClaimPollOutcome =
  | { status: "pending"; interval: number; expiresIn: number }
  | { status: "complete"; result: IdentityAssertionResult }

/**
 * `POST /agent/identity/claim`: the agent asking whether the human has
 * approved the link yet.
 *
 * Answers `authorization_pending` — the device-flow vocabulary auth.md
 * reuses — until the ceremony closes, then mints the same identity assertion
 * the zero-interaction path would have produced. The agent's code path after
 * a claim is therefore identical to its code path without one; only the wait
 * differs.
 */
export async function pollClaim(input: {
  registrationId: unknown
  claimToken: unknown
}): Promise<ClaimPollOutcome> {
  if (typeof input.registrationId !== "string" || !input.registrationId.trim()) {
    throw new AgentAuthError("invalid_request", "registration_id is required.")
  }

  const registration = await findOpenRegistration(input.registrationId.trim())

  // One answer for "no such registration", "expired", and "wrong token". They
  // are the same fact from the caller's side — this credential does not open
  // this ceremony — and distinguishing them would let an agent enumerate the
  // ceremonies other agents have open.
  if (!registration || !claimTokenMatches(registration, input.claimToken)) {
    throw new AgentAuthError("invalid_grant", "This claim is unknown, expired, or already closed.")
  }

  const attempts = await countClaimAttempt(registration.id)
  if (attempts > MAX_CLAIM_ATTEMPTS) {
    throw new AgentAuthError(
      "access_denied",
      "This claim was polled too many times. Start a new identity request.",
    )
  }

  switch (registration.status) {
    case "denied":
      throw new AgentAuthError("access_denied", "The account holder declined to link this agent.")
    case "pending_claim":
      throw new AgentAuthError("interaction_required", "The account holder has not approved this agent yet.", {
        error: "authorization_pending",
        interval: CLAIM_POLL_INTERVAL_SECONDS,
      })
    case "claimed": {
      // One approval buys one assertion. The transition, not the read above,
      // decides who gets it, so two concurrent polls cannot both mint.
      const spent = await exchangeRegistration(registration.id)
      if (!spent) {
        throw new AgentAuthError(
          "invalid_grant",
          "This claim was already exchanged. Start a new identity request.",
        )
      }
      return { status: "complete", result: await completeClaim(spent) }
    }
    case "linked":
      throw new AgentAuthError(
        "invalid_grant",
        "This claim was already exchanged. Start a new identity request.",
      )
    default:
      throw new AgentAuthError("invalid_grant", "This claim is no longer open.")
  }
}

/**
 * Turns an approved ceremony into the delegation and the assertion.
 *
 * The delegation is written here rather than in the browser action so the two
 * halves of the ceremony cannot disagree: the row is created from the same
 * registration the agent is holding a token for, keyed on the same
 * `(issuer, subject, audience)` the ID-JAG carried.
 */
async function completeClaim(
  registration: AgentRegistrationRow,
): Promise<IdentityAssertionResult> {
  if (!registration.userId) {
    throw new AgentAuthError("server_error", "This claim closed without an account.")
  }

  const delegation = await upsertDelegation({
    userId: registration.userId,
    issuer: registration.issuer,
    subject: registration.subject,
    audience: registration.audience,
    providerName: registration.providerName,
  })

  await touchDelegation(delegation.id)

  const scopes = resolveAgentVerifiedScopes(registration.requestedScopes)

  const minted = await mintIdentityAssertion({
    userId: registration.userId,
    delegationId: delegation.id,
    clientId: registration.clientId,
    scopes,
    providerIssuer: registration.issuer,
    providerSubject: registration.subject,
    authTime: Math.floor(registration.createdAt.getTime() / 1000),
  })

  return toResult(minted)
}
