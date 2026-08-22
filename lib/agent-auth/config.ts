import { getDiscoveryOrigin, discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"

/**
 * Configuration for the auth.md Agent Verified (ID-JAG) profile.
 *
 * Values track the WorkOS reference implementation
 * (`agent-services/src/config.ts`) unless this deployment has a reason to
 * differ; where they differ the reason is written down beside the value.
 */

/** RFC 7523 JWT-bearer: exchange a service identity_assertion for a token. */
export const JWT_BEARER_GRANT = "urn:ietf:params:oauth:grant-type:jwt-bearer"

/**
 * Claim-ceremony polling grant. A profile-specific URN, not the IANA device
 * code grant, so it cannot collide with a device-authorization implementation
 * at the same token endpoint — the reference makes the same choice.
 */
export const CLAIM_GRANT = "urn:workos:agent-auth:grant-type:claim"

/** The assertion type `/agent/identity` accepts under `identity_assertion`. */
export const ID_JAG_ASSERTION_TYPE = "urn:ietf:params:oauth:token-type:id-jag"

/** RFC 8417 media type / `typ` of an ID-JAG. */
export const ID_JAG_TYP = "oauth-id-jag+jwt"

/** `typ` of a provider-pushed Security Event Token (RFC 8417). */
export const SECEVENT_TYP = "secevent+jwt"

/** Event schema the SET receiver acts on (revoke everything for a delegation). */
export const IDENTITY_ASSERTION_REVOKED_SCHEMA =
  "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked"

/** Agent-facing protocol paths, served at the deployment origin. */
export const AGENT_AUTH_PATHS = {
  identity: "/agent/identity",
  claim: "/agent/identity/claim",
  events: "/agent/event/notify",
  /** Where the human lands to confirm a first link. */
  claimConfirmation: "/agent/claim",
} as const

export const agentAuthConfig = Object.freeze({
  /**
   * Scopes an Agent Verified credential can carry. Deliberately a subset of
   * `oauthScopes`: an agent never receives `openid`/`profile`/`email` (it is not
   * signing a human in) nor `offline_access` (this profile refreshes by
   * re-exchanging the identity_assertion, not with a refresh token).
   */
  scopesSupported: ["skills:read", "skills:write"] as const,
  /** Access-token lifetime, matching the provider default for this deployment. */
  accessTokenTtlSeconds: 3600,
  /**
   * Lifetime of a service-signed identity_assertion. The agent re-exchanges it
   * at the token endpoint while it is live; when it expires the agent calls
   * `/agent/identity` again with a fresh ID-JAG.
   */
  serviceAssertionTtlSeconds: 3600,
  /**
   * Maximum age of the upstream user authentication an ID-JAG asserts through
   * `auth_time`. Older than this and the answer is `login_required`: only the
   * Agent Provider can fix it, so signing in here would not help.
   */
  idJagMaxAuthAgeSeconds: 3600,
  /** How long an unfinished first-link ceremony survives before restarting. */
  claimTtlSeconds: 86_400,
  /** Lifetime of the verification URL minted for one attempt. */
  claimViewTokenTtlSeconds: 600,
  /** Lifetime of the 6-digit code the human types (RFC 8628 `user_code`). */
  userCodeTtlSeconds: 600,
  /** Wrong codes accepted on one attempt before it is burned. */
  userCodeMaxAttempts: 5,
  /** Recommended agent poll cadence (RFC 8628 `interval`). */
  pollIntervalSeconds: 5,
  /** Tolerance for clock drift between us and a provider. */
  clockSkewSeconds: 60,
  /** Signature algorithms accepted on a provider JWT. */
  allowedProviderAlgorithms: ["RS256", "ES256", "PS256", "EdDSA"] as const,
})

export type AgentScope = (typeof agentAuthConfig.scopesSupported)[number]

/**
 * The RFC 8707 resource an ID-JAG must be minted for. `aud` is checked against
 * this exact string: AUTH.md tells an agent to use the PRM's `resource`, and it
 * is also the audience Better Auth binds the resulting access token to.
 */
export function getAgentAudience(): string {
  return getMcpResource()
}

/** Issuer of service-signed assertions: the Better Auth authorization server. */
export function getServiceIssuer(): string {
  return `${getDiscoveryOrigin()}/api/auth`
}

export function agentAuthUrl(path: string): string {
  return discoveryUrl(path)
}
