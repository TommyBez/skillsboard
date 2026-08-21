import { connection } from "next/server"

import {
  DISCOVERY_CORS_HEADERS,
  discoveryPreflight,
  discoveryUrl,
} from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { mcpServerCapabilities, mcpServerInfo, mcpToolSummaries } from "@/lib/mcp-server-card"
import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"

/**
 * MCP Server Card (SEP-1649), the document an agent reads to learn this server
 * exists, where to connect, and what it can do before it runs an OAuth flow.
 */
export async function GET() {
  await connection()

  return Response.json(
    {
      serverInfo: mcpServerInfo,
      transport: {
        type: "streamable-http",
        endpoint: getMcpResource(),
      },
      // Some readers expect the transport list rather than the single object.
      transports: [
        {
          type: "streamable-http",
          endpoint: getMcpResource(),
        },
      ],
      capabilities: mcpServerCapabilities,
      tools: mcpToolSummaries,
      authentication: {
        type: "oauth2",
        resource: getMcpResource(),
        authorization_servers: [discoveryUrl("/api/auth")],
        protected_resource_metadata: discoveryUrl("/.well-known/oauth-protected-resource"),
        scopes_supported: oauthScopes.map((scope) => ({
          scope,
          description: oauthScopeDescriptions[scope],
        })),
        documentation: discoveryUrl("/auth.md"),
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600",
        "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
      },
    },
  )
}

export function OPTIONS() {
  return discoveryPreflight()
}
