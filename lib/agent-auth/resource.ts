import { effectiveRegistrationStatus, type AgentAuthStore } from "@/lib/agent-auth/store"
import { findTrustedProvider } from "@/lib/agent-auth/trust"

/**
 * The resource server's side of the profile.
 *
 * A business endpoint should only ever care about "which user" and "which
 * scopes", and `/api/mcp` still does: it verifies a Better Auth JWT exactly as
 * it does for a human's MCP client and reads `sub` and `scope`. What this adds
 * is the one thing a self-contained token cannot carry — whether the delegation
 * behind it is still live — because a JWT has no server-side row to flip when a
 * provider or a user revokes.
 *
 * Tokens with no agent provenance skip every query below, so the human path pays
 * nothing for this.
 */

export type AgentTokenClaims = {
  sub?: string
  jti?: string
  agent_delegation_id?: unknown
  agent_registration_id?: unknown
  agent_issuer?: unknown
}

export type AgentCredentialRefusal = {
  code: "token_revoked" | "delegation_revoked" | "registration_revoked" | "issuer_untrusted"
  message: string
}

export async function refuseAgentCredential(
  claims: AgentTokenClaims,
  store: AgentAuthStore,
): Promise<AgentCredentialRefusal | null> {
  const delegationId = claims.agent_delegation_id
  if (typeof delegationId !== "string") return null

  if (claims.jti && (await store.isCredentialRevoked(claims.jti))) {
    return {
      code: "token_revoked",
      message: "This access token has been revoked. Exchange your identity assertion for a new one.",
    }
  }

  const delegation = await store.findDelegationById(delegationId)
  if (!delegation || delegation.revokedAt) {
    return {
      code: "delegation_revoked",
      message:
        "The delegation behind this credential has been revoked. Register again at /agent/identity with a fresh ID-JAG.",
    }
  }

  /*
   * The token names the user it was minted for; the delegation names the user it
   * currently points at. If the two disagree the delegation was re-pointed after
   * this token was issued, and honoring the token would act for the wrong
   * person.
   */
  if (claims.sub && delegation.userId !== claims.sub) {
    return {
      code: "delegation_revoked",
      message: "This credential no longer matches its delegation.",
    }
  }

  // A provider dropped from the trust list takes its live credentials with it.
  if (!findTrustedProvider(delegation.issuer)) {
    return {
      code: "issuer_untrusted",
      message: "The Agent Provider behind this credential is no longer trusted by this service.",
    }
  }

  const registrationId = claims.agent_registration_id
  if (typeof registrationId === "string") {
    const registration = await store.findRegistrationById(registrationId)
    if (!registration || effectiveRegistrationStatus(registration) !== "claimed") {
      return {
        code: "registration_revoked",
        message:
          "The registration behind this credential is no longer active. Register again at /agent/identity with a fresh ID-JAG.",
      }
    }
  }

  return null
}
