"use server"

import { completeRegistration, denyRegistration, findOpenRegistration } from "@/lib/agent-auth/registrations"
import { upsertDelegation } from "@/lib/agent-auth/delegations"
import { capturePostHogEvent } from "@/lib/posthog-server"
import { requireSession } from "@/lib/session"

export interface ClaimDecisionResult {
  status: "approved" | "denied" | "unavailable" | "wrong_account"
}

/**
 * The human half of the first-link ceremony.
 *
 * Everything here turns on one comparison: the Better Auth user who is signed
 * in right now has to be the user the registration was opened against. That is
 * what makes this a *step-up* rather than a second way in — the agent
 * provider's verified email found a candidate account, and only the person
 * holding that account, proven by the ordinary OTP session, can confirm it.
 */
export async function decideAgentClaim(
  registrationId: string,
  decision: "approve" | "deny",
): Promise<ClaimDecisionResult> {
  const session = await requireSession(`/agent/claim/${registrationId}`)
  const registration = await findOpenRegistration(registrationId)

  if (!registration || registration.status !== "pending_claim") {
    return { status: "unavailable" }
  }

  // The account the ID-JAG's verified email resolved to. A different signed-in
  // user must not be able to complete this ceremony — otherwise the agent
  // provider's assertion would end up linked to whoever happened to click.
  if (registration.userId && registration.userId !== session.user.id) {
    return { status: "wrong_account" }
  }

  if (decision === "deny") {
    await denyRegistration(registration.id)
    capturePostHogEvent({
      distinctId: session.user.id,
      event: "agent_delegation_denied",
      properties: { provider: registration.providerName ?? "unknown" },
    })
    return { status: "denied" }
  }

  const completed = await completeRegistration(registration.id, session.user.id)
  if (!completed) return { status: "unavailable" }

  // Written here as well as in the agent's poll so the link exists the moment
  // the user approves it, whether or not the agent is still polling.
  await upsertDelegation({
    userId: session.user.id,
    issuer: registration.issuer,
    subject: registration.subject,
    audience: registration.audience,
    providerName: registration.providerName,
  })

  capturePostHogEvent({
    distinctId: session.user.id,
    event: "agent_delegation_approved",
    properties: { provider: registration.providerName ?? "unknown" },
  })

  return { status: "approved" }
}
