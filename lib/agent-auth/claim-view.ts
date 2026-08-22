import {
  type AgentAuthStore,
  type AgentClaimRecord,
  type AgentRegistrationRecord,
  effectiveRegistrationStatus,
  sha256Hex,
} from "@/lib/agent-auth/store"
import { trustedProviderDisplayName } from "@/lib/agent-auth/trust"

/**
 * What the confirmation page needs to know about a ceremony, resolved from the
 * `claim_attempt_token` in the URL.
 *
 * The token is looked up by hash — the plaintext is never stored — and every
 * refusal below is a state the page renders as prose rather than a redirect, so
 * a person who followed a stale link learns what to ask the agent for.
 */
export type ClaimViewState =
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "already_claimed" }
  | { kind: "wrong_account"; expectedEmail: string }
  | {
      kind: "confirm"
      registration: AgentRegistrationRecord
      claim: AgentClaimRecord
      providerName: string
      firstProviderLink: boolean
    }

export async function loadClaimView(input: {
  store: AgentAuthStore
  claimAttemptToken: string | undefined
  signedInUser: { id: string; email: string }
  now?: Date
}): Promise<ClaimViewState> {
  const now = input.now ?? new Date()
  if (!input.claimAttemptToken) return { kind: "invalid" }

  const claim = await input.store.findClaimByViewTokenHash(sha256Hex(input.claimAttemptToken))
  if (!claim) return { kind: "invalid" }

  const registration = await input.store.findRegistrationById(claim.registrationId)
  if (!registration) return { kind: "invalid" }

  const status = effectiveRegistrationStatus(registration, now)
  if (status === "claimed") return { kind: "already_claimed" }
  if (status === "expired" || status === "revoked") return { kind: "expired" }
  if (claim.status !== "pending") return { kind: "expired" }
  if (claim.viewExpiresAt.getTime() < now.getTime()) return { kind: "expired" }

  /*
   * The hard stop against claim hijacking. The ceremony was minted for the
   * account the ID-JAG's verified email matched; whoever is signed in has to be
   * that account. Someone who obtained the link and the code — by shoulder
   * surfing, a shared screen, a phishing message — cannot bind the agent to
   * their own account instead, and the form never renders for them.
   */
  if (
    claim.loginHintEmail &&
    claim.loginHintEmail.toLowerCase() !== input.signedInUser.email.toLowerCase()
  ) {
    return { kind: "wrong_account", expectedEmail: claim.loginHintEmail }
  }

  const existingForProvider = await input.store.findDelegation({
    issuer: registration.issuer,
    subject: registration.subject,
    audience: registration.audience,
  })

  return {
    kind: "confirm",
    registration,
    claim,
    // Read from this service's trust list, never from anything the provider put
    // in the assertion, so a provider cannot choose the name a user is shown.
    providerName: trustedProviderDisplayName(registration.issuer),
    firstProviderLink: !existingForProvider || Boolean(existingForProvider.revokedAt),
  }
}
