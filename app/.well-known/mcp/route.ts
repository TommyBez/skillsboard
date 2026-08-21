import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight, discoveryUrl } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { buildMcpServerCard } from "@/lib/mcp-server-card"

/**
 * The server card again, at the bare `/.well-known/mcp` path.
 *
 * SEP-1649 puts the card at `/.well-known/mcp/server-card.json`, and that is
 * the canonical copy. Clients and scanners in the wild also probe the parent
 * path directly, and answering it costs one route: an agent that guesses gets
 * the card and the endpoint it names instead of a 404 it has to recover from.
 *
 * The card cannot be a handshake. `/api/mcp` is OAuth-protected because a team
 * library is private, so an anonymous `initialize` here would either lie about
 * what it can do or hand out an unauthenticated surface that does not exist.
 * The card says where the endpoint is and how to authenticate against it.
 */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildMcpServerCard(getMcpResource(), discoveryUrl),
    instance: "/.well-known/mcp",
    requestHeaders: await headers(),
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
