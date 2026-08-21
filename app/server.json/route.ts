import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { buildMcpRegistryManifest } from "@/lib/mcp-server-card"

/**
 * The MCP registry manifest, served from the origin it describes.
 *
 * `server.json` at the repository root is the copy the registry is published
 * from; this is the copy an agent finds. Both spellings of "where is your MCP
 * server" are in use — a client that knows SEP-1649 reads
 * /.well-known/mcp/server-card.json, and a client that knows the registry looks
 * for /server.json at the root — and answering only one of them leaves the
 * other guessing.
 *
 * The remote URL is this deployment's, not the one in the committed file: a
 * preview that advertised the production endpoint would send an agent, and
 * whatever it writes, to the production database.
 */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildMcpRegistryManifest(getMcpResource()),
    instance: "/server.json",
    requestHeaders: await headers(),
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
