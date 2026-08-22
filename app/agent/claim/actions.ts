"use server"

import { headers } from "next/headers"

import { loadClaimView } from "@/lib/agent-auth/claim-view"
import { completeClaim } from "@/lib/agent-auth/registration"
import { agentAuthStore } from "@/lib/agent-auth/store-db"
import { trustedProviderDisplayName } from "@/lib/agent-auth/trust"
import { auth } from "@/lib/auth"

export type ConfirmAgentClaimState = { status: "idle" | "done"; error?: string }

/**
 * Completes an auth.md first-link ceremony.
 *
 * Everything about *who* is confirming comes from the Better Auth session — the
 * same session email OTP produces for a browser login. The form supplies only
 * the ceremony token and the code the agent displayed, so a forged form field
 * cannot redirect the delegation to another account.
 */
export async function confirmAgentClaim(
  _previous: ConfirmAgentClaimState,
  formData: FormData,
): Promise<ConfirmAgentClaimState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { status: "idle", error: "Your session expired. Sign in again and reopen the link." }
  }

  const claimAttemptToken = formData.get("claim_attempt_token")
  const userCode = formData.get("user_code")
  if (typeof claimAttemptToken !== "string" || typeof userCode !== "string") {
    return { status: "idle", error: "That submission was incomplete. Reload the page and try again." }
  }
  if (!/^\d{6}$/.test(userCode)) {
    return { status: "idle", error: "Enter the 6-digit code the agent showed you." }
  }

  const view = await loadClaimView({
    store: agentAuthStore,
    claimAttemptToken,
    signedInUser: { id: session.user.id, email: session.user.email },
  })

  if (view.kind === "wrong_account") {
    return {
      status: "idle",
      error: `This authorization was started for ${view.expectedEmail}. Sign out and sign back in as that account.`,
    }
  }
  if (view.kind === "already_claimed") {
    return { status: "done" }
  }
  if (view.kind !== "confirm") {
    return {
      status: "idle",
      error: "This authorization link is no longer valid. Ask the agent to start a new one.",
    }
  }

  const result = await completeClaim({
    store: agentAuthStore,
    registration: view.registration,
    claim: view.claim,
    userCode,
    signedInUser: {
      id: session.user.id,
      email: session.user.email,
      emailVerified: Boolean(session.user.emailVerified),
      name: session.user.name ?? null,
    },
    providerName: trustedProviderDisplayName(view.registration.issuer),
  })

  if (result.ok) return { status: "done" }

  return { status: "idle", error: claimErrorMessage(result.error) }
}

function claimErrorMessage(error: string): string {
  switch (error) {
    case "user_code_invalid":
      return "That code doesn’t match. Check the digits and try again."
    case "user_code_expired":
      return "That code has expired. Ask the agent for a fresh code."
    case "too_many_attempts":
      return "Too many incorrect codes. Ask the agent to start a new authorization."
    case "previously_claimed":
      return "This authorization has already been completed."
    case "wrong_account":
      return "This authorization was started for a different account."
    default:
      return "This authorization link has expired. Ask the agent to start a new one."
  }
}
