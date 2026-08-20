import { discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopes } from "@/lib/oauth-scopes"

/**
 * The `agent_auth` extension to the authorization server metadata (auth.md).
 *
 * Skills Board issues user-delegated tokens only: an agent registers itself as
 * an OAuth client through RFC 7591 dynamic client registration, then runs the
 * ordinary authorization code + PKCE flow so a signed-in teammate approves the
 * scopes. There is no anonymous identity, no ID-JAG assertion exchange, and no
 * claim ceremony, so those fields are absent rather than declared empty — an
 * agent that reads this block should not attempt a flow this server rejects.
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

  return {
    skill: discoveryUrl("/auth.md"),
    register_uri: registrationEndpoint,
    // "service_auth" in the auth.md vocabulary: the agent holds credentials of
    // its own at this service. It still acts for a signed-in user.
    identity_types_supported: ["service_auth"],
    credential_types_supported: ["client_id", "client_secret"],
    registration_methods_supported: [
      {
        type: "dynamic_client_registration",
        spec: "https://www.rfc-editor.org/rfc/rfc7591",
        register_uri: registrationEndpoint,
        // Registration itself is open; the user consent step is what gates
        // access to any team library.
        registration_authentication_required: false,
        credential_types: ["client_id", "client_secret"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
        ...(authorizationEndpoint ? { authorization_uri: authorizationEndpoint } : {}),
        ...(tokenEndpoint ? { token_uri: tokenEndpoint } : {}),
        resource: getMcpResource(),
        scopes_supported: [...oauthScopes],
      },
    ],
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
