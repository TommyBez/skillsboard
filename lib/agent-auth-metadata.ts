import {
  AGENT_AUTH_PATHS,
  ID_JAG_ASSERTION_TYPE,
  IDENTITY_ASSERTION_REVOKED_SCHEMA,
  agentAuthConfig,
  getAgentAudience,
} from "@/lib/agent-auth/config"
import { getTrustedProviders, isAgentVerifiedEnabled } from "@/lib/agent-auth/trust"
import { discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopes } from "@/lib/oauth-scopes"

/**
 * The `agent_auth` extension to the authorization server metadata (auth.md).
 *
 * Two ways to get a token are described here, and both of them work:
 *
 *  - **Agent Verified (ID-JAG)** — an agent whose Agent Provider is on this
 *    service's trust list presents an audience-bound ID-JAG at the identity
 *    endpoint, gets a service-signed `identity_assertion`, and exchanges it at
 *    the token endpoint (RFC 7523). This block is present only when a provider
 *    is actually configured; with an empty trust list every ID-JAG would be
 *    refused, so advertising the flow would send agents down a dead end.
 *  - **Dynamic client registration** — an agent registers as an OAuth client and
 *    runs the ordinary authorization-code + PKCE flow so a signed-in teammate
 *    approves the scopes.
 *
 * Anonymous registration and email-only (`service_auth`) registration are not
 * implemented, so neither appears: `/agent/identity` answers the corresponding
 * `*_not_enabled` error for both, and metadata that promised them would be a
 * lie an agent has to discover by being refused.
 *
 * Endpoint URLs are read off the metadata document being extended wherever the
 * authorization server owns them, so a Better Auth upgrade that moves one cannot
 * leave this block pointing at a dead URL.
 */
export function buildAgentAuthBlock(metadata: Record<string, unknown>) {
  const registrationEndpoint = readString(metadata, "registration_endpoint")
  const authorizationEndpoint = readString(metadata, "authorization_endpoint")
  const tokenEndpoint = readString(metadata, "token_endpoint")

  const agentVerified = isAgentVerifiedEnabled()
  if (!registrationEndpoint && !agentVerified) return undefined

  return {
    skill: discoveryUrl("/auth.md"),
    ...(agentVerified ? agentVerifiedFields(tokenEndpoint) : {}),
    ...(registrationEndpoint
      ? dynamicRegistrationFields({ registrationEndpoint, authorizationEndpoint, tokenEndpoint })
      : {}),
    /*
     * The one endpoint that revokes both kinds of credential: it handles the
     * self-contained JWTs this profile issues and passes anything else through
     * to the authorization server's own RFC 7009 implementation.
     */
    revocation_uri: discoveryUrl("/oauth2/revoke"),
    protected_resource_metadata_uri: discoveryUrl("/.well-known/oauth-protected-resource"),
  }
}

function agentVerifiedFields(tokenEndpoint: string | undefined) {
  return {
    identity_endpoint: discoveryUrl(AGENT_AUTH_PATHS.identity),
    claim_endpoint: discoveryUrl(AGENT_AUTH_PATHS.claim),
    events_endpoint: discoveryUrl(AGENT_AUTH_PATHS.events),
    identity_types_supported: ["identity_assertion"],
    identity_assertion: {
      assertion_types_supported: [ID_JAG_ASSERTION_TYPE],
      /*
       * The exact `aud` an ID-JAG must be minted for. It is the RFC 8707
       * resource from the protected-resource metadata, which is also the
       * audience Better Auth binds the resulting access token to.
       */
      audience: getAgentAudience(),
      /*
       * The trust list, published so an agent can check its provider before
       * minting an assertion instead of learning from a 400 — AUTH.md leaves the
       * format to the service. Only the issuer and the display name: the JWKS
       * location is ours to know and never taken from an agent's word for it.
       */
      trusted_issuers: getTrustedProviders().map((provider) => ({
        iss: provider.issuer,
        name: provider.displayName,
      })),
      /** How stale the provider's own user authentication may be. */
      max_auth_age: agentAuthConfig.idJagMaxAuthAgeSeconds,
      ...(tokenEndpoint ? { token_uri: tokenEndpoint } : {}),
      scopes_supported: [...agentAuthConfig.scopesSupported],
      resource: getMcpResource(),
    },
    events_supported: [IDENTITY_ASSERTION_REVOKED_SCHEMA],
  }
}

function dynamicRegistrationFields(input: {
  registrationEndpoint: string
  authorizationEndpoint: string | undefined
  tokenEndpoint: string | undefined
}) {
  return {
    register_uri: input.registrationEndpoint,
    credential_types_supported: ["client_id", "client_secret"],
    registration_methods_supported: [
      {
        type: "dynamic_client_registration",
        spec: "https://www.rfc-editor.org/rfc/rfc7591",
        register_uri: input.registrationEndpoint,
        // Registration itself is open; the user consent step is what gates
        // access to any team library.
        registration_authentication_required: false,
        credential_types: ["client_id", "client_secret"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
        ...(input.authorizationEndpoint ? { authorization_uri: input.authorizationEndpoint } : {}),
        ...(input.tokenEndpoint ? { token_uri: input.tokenEndpoint } : {}),
        resource: getMcpResource(),
        scopes_supported: [...oauthScopes],
      },
    ],
  }
}

function readString(source: Record<string, unknown>, key: string) {
  const value = source[key]
  return typeof value === "string" && value.length > 0 ? value : undefined
}

/**
 * Reads the JSON body Better Auth produced, merges `agent_auth` into it, and
 * returns a fresh response. A non-JSON or non-200 body is passed through
 * untouched: an error from the auth server is not ours to reshape.
 */
export async function withAgentAuthMetadata(response: Response): Promise<Response> {
  if (!response.ok) return response

  let metadata: unknown
  try {
    metadata = await response.clone().json()
  } catch {
    return response
  }

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return response
  }

  const record = metadata as Record<string, unknown>
  const agentAuth = buildAgentAuthBlock(record)
  if (!agentAuth) return response

  const headers = new Headers(response.headers)
  headers.delete("content-length")
  headers.set("Content-Type", "application/json")
  headers.set("Access-Control-Allow-Origin", "*")

  return new Response(JSON.stringify({ ...record, agent_auth: agentAuth }), {
    status: response.status,
    headers,
  })
}
