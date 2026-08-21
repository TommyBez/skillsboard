import { API_VERSION_HEADER } from "@/lib/api-version"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopes } from "@/lib/oauth-scopes"

/**
 * Origin this deployment actually answers on.
 *
 * Derived from the one canonical MCP resource identifier rather than from
 * `siteConfig.url`, so a preview deployment advertises its own origin instead
 * of pointing agents at production. The request host is deliberately not used:
 * these documents name OAuth resources and authorization servers, and a
 * host-derived origin would let a proxied Host header advertise an issuer this
 * deployment cannot mint tokens for.
 */
export function getDiscoveryOrigin(): string {
  return new URL(getMcpResource()).origin
}

export function discoveryUrl(path: string): string {
  return `${getDiscoveryOrigin()}${path.startsWith("/") ? path : `/${path}`}`
}

/** Better Auth serves the whole OAuth surface under this base path. */
export function getAuthorizationServerIssuer(): string {
  return discoveryUrl("/api/auth")
}

/**
 * RFC 9728 metadata for the single protected resource this deployment exposes.
 *
 * Shared by the origin-level document and the path-derived one at
 * `/.well-known/oauth-protected-resource/api/mcp` so the two cannot drift. Both
 * name `<origin>/api/mcp` as the resource identifier because that is the exact
 * audience Better Auth binds tokens to (see `mcp({ resource })` in lib/auth.ts);
 * advertising the bare origin here would read well but make every token request
 * fail with `invalid_target`.
 */
export function buildProtectedResourceMetadata() {
  const resource = getMcpResource()
  return {
    resource,
    authorization_servers: [getAuthorizationServerIssuer()],
    scopes_supported: [...oauthScopes],
    bearer_methods_supported: ["header"],
    resource_name: "Skills Board MCP",
    resource_documentation: discoveryUrl("/auth.md"),
  }
}

/**
 * Every agent-facing endpoint answers cross-origin preflight the same way.
 *
 * The version header is in the allow list because a browser client that pins a
 * version sends a non-simple header, which makes the request preflight. Left
 * out, the browser refuses the request before the endpoint can honour, or
 * refuse, the pin.
 */
export const DISCOVERY_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": `Content-Type, ${API_VERSION_HEADER}`,
} as const

export function discoveryPreflight(): Response {
  return new Response(null, { status: 204, headers: DISCOVERY_CORS_HEADERS })
}
