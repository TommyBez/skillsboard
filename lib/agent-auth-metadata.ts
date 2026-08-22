import {
  agentVerifiedScopes,
  getAgentAudience,
  ID_JAG_ASSERTION_TYPE,
  JWT_BEARER_GRANT_TYPE,
} from "@/lib/agent-auth/config"
import { getTrustedAgentProviders } from "@/lib/agent-auth/config"
import { discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopes } from "@/lib/oauth-scopes"

/**
 * The `agent_auth` extension to the authorization server metadata (auth.md).
 *
 * Skills Board runs two flows, and this block declares exactly the two:
 *
 * - `service_auth` — the agent registers as an OAuth client (RFC 7591) and a
 *   signed-in teammate approves it in a browser. This is the original flow and
 *   the only one available to an agent whose provider we do not trust.
 * - `identity_assertion` — auth.md Agent Verified. The agent's own provider
 *   attests, with an ID-JAG, that a user is authenticated there; Skills Board
 *   verifies it, resolves it to the same Better Auth user the OTP flow would
 *   have produced, and issues a scoped token. After the first link this needs
 *   no browser and no OTP.
 *
 * `identity_assertion` is only advertised when at least one agent provider is
 * actually configured. Declaring a flow that would answer `invalid_grant` for
 * every issuer on earth is worse than not declaring it: an agent would try it,
 * fail, and have no way to tell a misconfiguration from a refusal.
 *
 * The endpoints are read off the metadata document being extended instead of
 * being written out again here, so a Better Auth upgrade that moves one cannot
 * leave this block pointing at a dead URL.
 */
export function buildAgentAuthBlock(metadata: Record<string, unknown>) {
  const registrationEndpoint = readString(metadata, "registration_endpoint")
  const authorizationEndpoint = readString(metadata, "authorization_endpoint")
  const tokenEndpoint = readString(metadata, "token_endpoint")
  const revocationEndpoint = readString(metadata, "revocation_endpoint")

  if (!registrationEndpoint) return undefined

  const agentVerified = getTrustedAgentProviders().size > 0

  const registrationMethods: Record<string, unknown>[] = [
    {
      type: "dynamic_client_registration",
      spec: "https://www.rfc-editor.org/rfc/rfc7591",
      register_uri: registrationEndpoint,
      // Registration itself is open; the user consent step is what gates
      // access to any team library.
      registration_authentication_required: false,
      credential_types: ["client_id", "client_secret"],
      grant_types_supported: agentVerified
        ? ["authorization_code", "refresh_token", JWT_BEARER_GRANT_TYPE]
        : ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      ...(authorizationEndpoint ? { authorization_uri: authorizationEndpoint } : {}),
      ...(tokenEndpoint ? { token_uri: tokenEndpoint } : {}),
      resource: getMcpResource(),
      scopes_supported: [...oauthScopes],
    },
  ]

  return {
    skill: discoveryUrl("/auth.md"),
    register_uri: registrationEndpoint,
    // "service_auth" in the auth.md vocabulary: the agent holds credentials of
    // its own at this service. It still acts for a signed-in user.
    identity_types_supported: agentVerified
      ? ["identity_assertion", "service_auth"]
      : ["service_auth"],
    credential_types_supported: ["client_id", "client_secret"],
    registration_methods_supported: registrationMethods,
    ...(agentVerified
      ? {
          identity_endpoint: discoveryUrl("/agent/identity"),
          // The one assertion type accepted, named by the URI an agent puts in
          // `assertion_type`. `anonymous` is absent because an agent with no
          // human behind it has no team library to read.
          assertion_types_supported: [ID_JAG_ASSERTION_TYPE],
          claim_endpoint: discoveryUrl("/agent/identity/claim"),
          events_endpoint: discoveryUrl("/agent/events"),
          agent_scopes_supported: [...agentVerifiedScopes],
          resource: getAgentAudience(),
          trusted_providers: [...getTrustedAgentProviders().values()].map((provider) => ({
            issuer: provider.issuer,
            display_name: provider.displayName,
          })),
        }
      : {}),
    ...(revocationEndpoint ? { revocation_uri: revocationEndpoint } : {}),
    protected_resource_metadata_uri: discoveryUrl("/.well-known/oauth-protected-resource"),
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
