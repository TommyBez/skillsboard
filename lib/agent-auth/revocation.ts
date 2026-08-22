import { ID_JAG_TYP, agentAuthConfig } from "@/lib/agent-auth/config"
import { type ServiceJwksSource, verifyServiceIssuedToken } from "@/lib/agent-auth/signer"
import type { AgentAuthStore } from "@/lib/agent-auth/store"

/**
 * RFC 7009 revocation for credentials issued through the auth.md profile.
 *
 * Access tokens here are self-contained JWTs — that is what `/api/mcp` verifies
 * — so there is no server-side row to flip. Revocation therefore records the
 * credential's `jti` as a tombstone that lives exactly as long as the credential
 * would have, and the resource server and the token endpoint both consult it.
 *
 * Which layer a revocation hits follows AUTH.md:
 *  - revoking an access token kills that one credential; the identity assertion
 *    survives and the agent can mint another;
 *  - revoking an identity assertion kills the refresh path, so the agent has to
 *    go back to `/agent/identity` with a fresh ID-JAG.
 */

export type AgentRevocationOutcome =
  | { handled: true; kind: "access_token" | "identity_assertion" }
  /** Not a credential this profile issued — the caller should pass it on. */
  | { handled: false }

export async function revokeAgentCredential(
  token: string,
  store: AgentAuthStore,
  options?: { jwks?: ServiceJwksSource },
): Promise<AgentRevocationOutcome> {
  const verified = await verifyServiceIssuedToken(token, options)
  if (!verified.ok) return { handled: false }

  const payload = verified.payload
  const jti = typeof payload.jti === "string" ? payload.jti : undefined
  if (!jti) return { handled: false }

  const isAssertion = verified.typ === ID_JAG_TYP
  const isAgentAccessToken = typeof payload.agent_delegation_id === "string"
  if (!isAssertion && !isAgentAccessToken) return { handled: false }

  // Keep the tombstone exactly as long as the credential could have been
  // presented; past its own expiry the signature check already refuses it.
  const expSeconds =
    typeof payload.exp === "number"
      ? payload.exp
      : Math.floor(Date.now() / 1000) + agentAuthConfig.accessTokenTtlSeconds

  await store.revokeCredential({
    jti,
    registrationId:
      typeof payload.agent_registration_id === "string"
        ? payload.agent_registration_id
        : isAssertion && typeof payload.sub === "string"
          ? payload.sub
          : null,
    reason: isAssertion ? "identity_assertion_revoked" : "access_token_revoked",
    expiresAt: new Date((expSeconds + agentAuthConfig.clockSkewSeconds) * 1000),
  })

  return { handled: true, kind: isAssertion ? "identity_assertion" : "access_token" }
}
