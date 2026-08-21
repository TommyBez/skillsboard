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
 * The RFC 9728 §3.1 metadata URL for a resource identifier: insert
 * `/.well-known/oauth-protected-resource` between the identifier's host and its
 * path. `https://host` derives `/.well-known/oauth-protected-resource`;
 * `https://host/api/mcp` derives `/.well-known/oauth-protected-resource/api/mcp`.
 *
 * Deriving it rather than writing it out twice keeps every link to a metadata
 * document pointing at the document that actually describes that resource.
 */
export function protectedResourceMetadataUrl(resource: string): string {
  const { origin, pathname } = new URL(resource)
  const path = pathname.replace(/\/+$/, "")
  return `${origin}/.well-known/oauth-protected-resource${path}`
}

/**
 * RFC 9728 metadata for one resource identifier.
 *
 * A client builds the metadata URL from the identifier it wants to reach and
 * then MUST reject a document whose `resource` is not that identifier
 * (RFC 9728 §3.3). So the origin-level document and the MCP one cannot share a
 * `resource` value, and each is built for the identifier its own path derives.
 * Everything else — the authorization server, the scopes, the bearer method —
 * is the same, because there is one Better Auth instance behind both.
 */
function buildResourceMetadata(resource: string, resourceName: string) {
  return {
    resource,
    authorization_servers: [getAuthorizationServerIssuer()],
    scopes_supported: [...oauthScopes],
    bearer_methods_supported: ["header"],
    resource_name: resourceName,
    resource_documentation: discoveryUrl("/auth.md"),
  }
}

/**
 * Metadata for the MCP server, served at the path `<origin>/api/mcp` derives.
 *
 * This is the canonical document: `<origin>/api/mcp` is the exact audience
 * Better Auth binds tokens to (see `mcp({ resource })` in lib/auth.ts), it is
 * what the `WWW-Authenticate` challenge from `/api/mcp` points a client at, and
 * it is the identifier to send as `resource` on a token request. Asking for a
 * token for anything else fails with `invalid_target`.
 */
export function buildProtectedResourceMetadata() {
  return buildResourceMetadata(getMcpResource(), "Skills Board MCP")
}

/**
 * Metadata for the origin, served at `/.well-known/oauth-protected-resource`.
 *
 * The entry point an agent that has only a hostname can reach: it names the
 * authorization server guarding this origin's protected APIs and the scopes it
 * issues. It cannot claim `<origin>/api/mcp` as its `resource` — that document
 * lives at its own derived path, and a client validating this one per RFC 9728
 * §3.3 rejects a mismatch outright.
 *
 * That leaves a trap this document has to defuse. The origin is a discovery
 * entry point, not a token audience: Better Auth registers exactly one resource
 * (`mcp({ resource })` in lib/auth.ts, a single string, not a list) and
 * audience-binds every token to it, so a client that took this document's
 * `resource` and requested a token for it would be refused with
 * `invalid_target`. Registering the origin as a second audience would not help
 * either — it would mint tokens `/api/mcp` still refuses.
 *
 * RFC 9728 has no registered field for "the requestable resources under this
 * origin", so `protected_resources` below is a local extension, which §2
 * permits. It names the audience to ask for and where its own metadata lives,
 * so a hostname-first client reaches the working resource without having to
 * guess or to provoke a 401 first.
 */
export function buildOriginProtectedResourceMetadata() {
  const mcpResource = getMcpResource()
  return {
    ...buildResourceMetadata(getDiscoveryOrigin(), "Skills Board"),
    protected_resources: [
      {
        resource: mcpResource,
        resource_metadata: protectedResourceMetadataUrl(mcpResource),
      },
    ],
  }
}

/** Every agent-facing endpoint answers cross-origin preflight the same way. */
export const DISCOVERY_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const

export function discoveryPreflight(): Response {
  return new Response(null, { status: 204, headers: DISCOVERY_CORS_HEADERS })
}
