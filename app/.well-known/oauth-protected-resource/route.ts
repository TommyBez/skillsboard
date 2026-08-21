import { connection } from "next/server"

import {
  buildOriginProtectedResourceMetadata,
  DISCOVERY_CORS_HEADERS,
  discoveryPreflight,
} from "@/lib/agent-discovery"

/**
 * Origin-level RFC 9728 entry point.
 *
 * Agents that scan a site look here first, before they know which path holds
 * the protected API, so this document describes the origin: which
 * authorization server guards it and which scopes that server issues. The
 * document for the MCP server itself lives at the path its resource identifier
 * derives, `/.well-known/oauth-protected-resource/api/mcp`, and is the one to
 * read for the audience to request a token for. Both name the same
 * authorization server; they differ only in the `resource` each describes,
 * which RFC 9728 §3.3 requires them to.
 */
export async function GET() {
  await connection()
  return Response.json(buildOriginProtectedResourceMetadata(), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
    },
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
