import type { GenericEndpointContext } from "@better-auth/core"
import type {
  OAuthProviderApi,
  OAuthTokenIssueParams,
  OAuthTokenResponse,
} from "@better-auth/oauth-provider"
import { APIError } from "better-auth/api"

import { CLAIM_GRANT, JWT_BEARER_GRANT, agentAuthConfig, getAgentAudience } from "@/lib/agent-auth/config"
import {
  serviceJwksFromContext,
  signServiceAssertion,
  verifyServiceAssertion,
} from "@/lib/agent-auth/signer"
import {
  type AgentAuthStore,
  type AgentRegistrationRecord,
  effectiveRegistrationStatus,
  sha256Hex,
} from "@/lib/agent-auth/store"
import { findTrustedProvider } from "@/lib/agent-auth/trust"
import { createBetterAuthUserResolver } from "@/lib/agent-auth/user-resolver"

/**
 * The OAuth half of the profile: the RFC 7523 JWT-bearer exchange and the
 * claim-ceremony polling grant, both registered on Better Auth's own
 * `/oauth2/token` endpoint through the provider's extension surface.
 *
 * Better Auth issues the access token. Nothing here mints credentials of its
 * own, so an agent token is the same kind of token a human's MCP client holds —
 * same signing keys, same audience, same verification path at `/api/mcp` — and
 * the resource server needs no knowledge of ID-JAG.
 */

/**
 * The provider capability surface the token endpoint hands a grant handler,
 * narrowed to the two calls this profile makes. Taking the real type keeps the
 * issuance parameters honest — a claim name or a field that Better Auth stops
 * accepting fails to compile rather than at runtime.
 */
type ProviderApi = Pick<OAuthProviderApi, "getClient" | "issueTokens">
type ProviderClient = Awaited<ReturnType<OAuthProviderApi["getClient"]>>

function oauthError(
  code: string,
  description: string,
  status: "BAD_REQUEST" | "UNAUTHORIZED" = "BAD_REQUEST",
): APIError {
  return new APIError(status, { error: code, error_description: description })
}

/**
 * The OAuth client an Agent Verified credential is issued to.
 *
 * One per trusted Agent Provider rather than one per agent: the provider is what
 * this deployment made a trust decision about, and `oauthAccessToken.clientId`
 * has a foreign key, so the row has to exist. It is a public client
 * (`token_endpoint_auth_method: none`) because the agent authenticates with the
 * assertion, not a secret — which is also what lets it call the standard
 * revocation endpoint with nothing but its `client_id`.
 */
export function agentClientIdFor(issuer: string): string {
  return `agent-auth-${sha256Hex(issuer).slice(0, 32)}`
}

export async function ensureAgentOAuthClient(
  ctx: GenericEndpointContext,
  input: { issuer: string; displayName: string },
): Promise<NonNullable<ProviderClient>> {
  const clientId = agentClientIdFor(input.issuer)
  const existing = (await ctx.context.adapter.findOne({
    model: "oauthClient",
    where: [{ field: "clientId", value: clientId }],
  })) as NonNullable<ProviderClient> | null
  if (existing) return existing

  const now = new Date()
  try {
    return (await ctx.context.adapter.create({
      model: "oauthClient",
      data: {
        clientId,
        name: `${input.displayName} (auth.md agent)`,
        // No browser redirect ever happens in this profile; the array is
        // required by the schema, so it stays empty on purpose.
        redirectUris: [],
        grantTypes: [JWT_BEARER_GRANT, CLAIM_GRANT],
        responseTypes: [],
        scopes: [...agentAuthConfig.scopesSupported],
        tokenEndpointAuthMethod: "none",
        // Consent for this client is the auth.md ceremony, not the browser
        // consent screen — which this client can never reach.
        skipConsent: true,
        disabled: false,
        createdAt: now,
        updatedAt: now,
      },
    })) as NonNullable<ProviderClient>
  } catch {
    // Two first requests for the same provider raced; the unique index on
    // clientId decided, and the loser reads the winner's row.
    const created = (await ctx.context.adapter.findOne({
      model: "oauthClient",
      where: [{ field: "clientId", value: clientId }],
    })) as NonNullable<ProviderClient> | null
    if (!created) throw oauthError("server_error", "Unable to resolve the agent OAuth client.")
    return created
  }
}

/**
 * Narrows the scopes an exchange may carry. The registration's authorized set is
 * the ceiling; a `scope` parameter can only ask for a subset of it, so an agent
 * cannot widen its access at the token endpoint after the fact.
 */
export function narrowScopes(
  authorized: string[],
  requested: string | undefined,
): { ok: true; scopes: string[] } | { ok: false; invalid: string[] } {
  if (!requested?.trim()) return { ok: true, scopes: authorized }
  const asked = [...new Set(requested.trim().split(/\s+/))]
  const invalid = asked.filter((scope) => !authorized.includes(scope))
  if (invalid.length) return { ok: false, invalid }
  return { ok: true, scopes: asked }
}

/**
 * Everything that must still hold at exchange time, re-checked on every call
 * rather than trusted from the moment the assertion was minted. A revocation
 * that lands between minting and exchange stops the exchange here.
 */
async function loadLiveRegistration(
  store: AgentAuthStore,
  registrationId: string,
  now: Date,
): Promise<AgentRegistrationRecord> {
  const registration = await store.findRegistrationById(registrationId)
  if (!registration) {
    throw oauthError("invalid_grant", "No registration matches this identity assertion.")
  }
  const status = effectiveRegistrationStatus(registration, now)
  if (status === "revoked") {
    throw oauthError(
      "invalid_grant",
      "This registration has been revoked. Register again at the identity endpoint with a fresh ID-JAG.",
    )
  }
  if (status === "expired") {
    throw oauthError("invalid_grant", "This registration has expired. Register again at the identity endpoint.")
  }
  if (status !== "claimed" || !registration.userId) {
    throw oauthError("invalid_grant", "This registration has not been confirmed by a user yet.")
  }
  return registration
}

async function assertDelegationLive(
  store: AgentAuthStore,
  registration: AgentRegistrationRecord,
): Promise<string> {
  const delegation = await store.findDelegation({
    issuer: registration.issuer,
    subject: registration.subject,
    audience: registration.audience,
  })
  if (!delegation || delegation.revokedAt) {
    throw oauthError(
      "invalid_grant",
      "The delegation behind this assertion has been revoked. Register again at the identity endpoint with a fresh ID-JAG.",
    )
  }
  if (delegation.userId !== registration.userId) {
    // The delegation was re-pointed at another account after this registration
    // was confirmed. Refuse rather than issue for whichever row is newer.
    throw oauthError("invalid_grant", "This assertion no longer matches its delegation.")
  }
  return delegation.id
}

async function issueForRegistration(input: {
  ctx: GenericEndpointContext
  api: ProviderApi
  registration: AgentRegistrationRecord
  delegationId: string
  scopes: string[]
  extraResponse?: Record<string, unknown>
}): Promise<OAuthTokenResponse> {
  const { ctx, api, registration, delegationId, scopes } = input

  const trusted = findTrustedProvider(registration.issuer)
  if (!trusted) {
    // The provider left the trust list since the registration was made. Its
    // assertions stop working immediately, the same as an unknown issuer.
    throw oauthError("invalid_grant", "This Agent Provider is no longer trusted by this service.")
  }

  const userRow = (await ctx.context.adapter.findOne({
    model: "user",
    where: [{ field: "id", value: registration.userId as string }],
  })) as OAuthTokenIssueParams["user"] | null
  if (!userRow) throw oauthError("invalid_grant", "The account behind this registration no longer exists.")

  const client = await ensureAgentOAuthClient(ctx, trusted)
  const resolved = await api.getClient(client.clientId)
  if (!resolved) throw oauthError("server_error", "Unable to resolve the agent OAuth client.")

  return api.issueTokens({
    client: resolved,
    scopes,
    user: userRow,
    // Binds the access token's `aud` to the MCP resource, which is what makes it
    // a JWT the resource server already knows how to verify.
    resources: [getAgentAudience()],
    /*
     * Provenance the resource server checks on every call: the registration and
     * delegation this credential speaks for. `/api/mcp` refuses a token whose
     * delegation has since been revoked, which is how revocation reaches a
     * self-contained JWT that carries no server-side row to flip.
     */
    accessTokenClaims: {
      agent_registration_id: registration.id,
      agent_delegation_id: delegationId,
      agent_issuer: registration.issuer,
    },
    ...(input.extraResponse ? { tokenResponse: input.extraResponse } : {}),
  })
}

/** RFC 7523: exchange a service-signed identity_assertion for an access token. */
export async function handleJwtBearerGrant(input: {
  ctx: GenericEndpointContext
  api: ProviderApi
  store: AgentAuthStore
  now?: Date
}): Promise<OAuthTokenResponse> {
  const { ctx, api, store } = input
  const now = input.now ?? new Date()
  const body = (ctx.body ?? {}) as Record<string, unknown>

  const assertion = body.assertion
  if (typeof assertion !== "string" || !assertion) {
    throw oauthError("invalid_request", "assertion is required for the jwt-bearer grant.")
  }

  const verified = await verifyServiceAssertion(assertion, { jwks: serviceJwksFromContext(ctx) })
  if (!verified.ok) throw oauthError("invalid_grant", verified.error.message)

  /*
   * The assertion is reusable until it expires — AUTH.md says so explicitly, and
   * the two-step exchange replaces the refresh token. What makes it stoppable is
   * revocation by `jti`: an agent that calls the revocation endpoint with its
   * assertion, or a provider SET that tears the registration down, lands here.
   */
  if (await store.isCredentialRevoked(verified.claims.jti)) {
    throw oauthError("invalid_grant", "This identity assertion has been revoked.")
  }

  const registration = await loadLiveRegistration(store, verified.claims.sub, now)
  const delegationId = await assertDelegationLive(store, registration)

  const authorized = verified.claims.scope
    ? verified.claims.scope.split(/\s+/).filter((scope) => registration.requestedScopes.includes(scope))
    : registration.requestedScopes
  const narrowed = narrowScopes(authorized, typeof body.scope === "string" ? body.scope : undefined)
  if (!narrowed.ok) {
    throw oauthError(
      "invalid_scope",
      `Scope(s) not authorized for this registration: ${narrowed.invalid.join(", ")}.`,
    )
  }

  /*
   * RFC 8707: a `resource` the agent pins must be the one this service issues
   * for. Silently ignoring a mismatch would hand back a token for a different
   * audience than the agent asked for.
   */
  const requestedResource = body.resource
  if (typeof requestedResource === "string" && requestedResource !== getAgentAudience()) {
    throw oauthError("invalid_target", `This authorization server issues tokens for ${getAgentAudience()}.`)
  }

  return issueForRegistration({
    ctx,
    api,
    registration,
    delegationId,
    scopes: narrowed.scopes,
  })
}

/**
 * The claim-ceremony polling grant. Device-authorization-shaped (RFC 8628 §3.5
 * vocabulary) under a profile-specific URN, so it cannot collide with a real
 * device-code implementation on the same endpoint.
 */
export async function handleClaimGrant(input: {
  ctx: GenericEndpointContext
  api: ProviderApi
  store: AgentAuthStore
  now?: Date
  /** Overridable so the protocol tests can run without a signing key. */
  sign?: typeof signServiceAssertion
}): Promise<OAuthTokenResponse> {
  const { ctx, api, store } = input
  const now = input.now ?? new Date()
  const body = (ctx.body ?? {}) as Record<string, unknown>

  const claimToken = body.claim_token
  if (typeof claimToken !== "string" || !claimToken) {
    throw oauthError("invalid_request", "claim_token is required for the claim grant.")
  }

  const registration = await store.findRegistrationByClaimTokenHash(sha256Hex(claimToken))
  if (!registration) throw oauthError("expired_token", "Unknown or expired claim_token.")

  const status = effectiveRegistrationStatus(registration, now)
  if (status === "expired" || status === "revoked") {
    throw oauthError("expired_token", "The claim ceremony window has closed.")
  }

  if (status !== "claimed") {
    /*
     * The user_code expires well before the outer registration does. Saying
     * `expired_token` here rather than pending tells the agent to mint a fresh
     * code at the claim endpoint instead of polling out the whole outer window.
     */
    const attempt = await store.latestClaim(registration.id)
    if (
      !attempt ||
      attempt.status !== "pending" ||
      attempt.userCodeExpiresAt.getTime() < now.getTime()
    ) {
      throw oauthError(
        "expired_token",
        "The user_code window has closed. Re-initiate the ceremony at the claim endpoint.",
      )
    }
    /*
     * RFC 8628 §3.5. A production service would also answer `slow_down` when a
     * client polls faster than the advertised `interval`; the reference leaves
     * that out, and the rate limit Better Auth already applies to
     * `/oauth2/token` bounds the cost in the meantime.
     */
    throw oauthError("authorization_pending", "The user has not completed the ceremony yet.")
  }

  const delegationId = await assertDelegationLive(store, registration)

  /*
   * Mint a fresh assertion alongside the token: the agent reached this endpoint
   * holding only a claim_token, so this is the first assertion it can refresh
   * with. Mirrors the reference's "v2 assertion" on ceremony completion.
   */
  const users = createBetterAuthUserResolver(ctx)
  const user = registration.userId ? await users.findUserById(registration.userId) : null
  if (!user) throw oauthError("invalid_grant", "The account behind this registration no longer exists.")

  const assertion = await (input.sign ?? signServiceAssertion)(ctx, {
    registrationId: registration.id,
    delegationId,
    scopes: registration.requestedScopes,
    email: user.email,
    emailVerified: user.emailVerified,
  })

  return issueForRegistration({
    ctx,
    api,
    registration,
    delegationId,
    scopes: registration.requestedScopes,
    extraResponse: {
      identity_assertion: assertion.jwt,
      assertion_expires: assertion.expiresAt.toISOString(),
    },
  })
}
