import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight, discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { buildMcpServerCard } from "@/lib/mcp-server-card"

/**
 * MCP Server Card (SEP-1649), the document an agent reads to learn this server
 * exists, where to connect, and what it can do before it runs an OAuth flow.
 */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildMcpServerCard(getMcpResource(), discoveryUrl),
    instance: "/.well-known/mcp/server-card.json",
    requestHeaders: await headers(),
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
