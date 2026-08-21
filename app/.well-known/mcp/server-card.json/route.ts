import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight, discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { mcpServerCapabilities, mcpServerInfo, mcpToolSummaries } from "@/lib/mcp-server-card"
import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"

/**
 * MCP Server Card (SEP-1649), the document an agent reads to learn this server
 * exists, where to connect, and what it can do before it runs an OAuth flow.
 */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    instance: "/.well-known/mcp/server-card.json",
    requestHeaders: await headers(),
    document: {
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
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
