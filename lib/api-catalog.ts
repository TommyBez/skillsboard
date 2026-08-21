import { discoveryUrl, protectedResourceMetadataUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"

export const API_CATALOG_MEDIA_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'

/**
 * RFC 9727 API catalog.
 *
 * One anchor, because Skills Board exposes one API: the MCP server. The rest of
 * `/api` backs the web UI on a session cookie and is not an integration point,
 * so listing it here would advertise a contract that does not exist.
 */
export function buildApiCatalog() {
  return {
    linkset: [
      {
        anchor: getMcpResource(),
        "service-desc": [
          {
            href: discoveryUrl("/openapi.json"),
            type: "application/openapi+json",
            title: "Skills Board public HTTP API (OpenAPI 3.1)",
          },
          {
            href: discoveryUrl("/.well-known/mcp/server-card.json"),
            type: "application/json",
            title: "MCP Server Card (SEP-1649)",
          },
        ],
        "service-doc": [
          {
            href: discoveryUrl("/auth.md"),
            type: "text/markdown",
            title: "Registering an agent and getting a token",
          },
          {
            href: discoveryUrl("/llms.txt"),
            type: "text/markdown",
            title: "What Skills Board is, and what its tools can and cannot do",
          },
        ],
        status: [
          {
            href: discoveryUrl("/api/health"),
            type: "application/health+json",
            title: "Deployment liveness",
          },
        ],
        "service-meta": [
          {
            // The document for the anchor, not the origin-level entry point:
            // a client validates the metadata it fetches against the resource
            // it asked about, and the anchor here is the MCP resource.
            href: protectedResourceMetadataUrl(getMcpResource()),
            type: "application/json",
            title: "OAuth Protected Resource Metadata (RFC 9728)",
          },
        ],
        author: [{ href: discoveryUrl("/about"), type: "text/html" }],
        license: [{ href: "https://opensource.org/license/mit", title: "MIT" }],
      },
    ],
  }
}
