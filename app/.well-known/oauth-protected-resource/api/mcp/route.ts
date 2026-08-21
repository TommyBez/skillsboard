import { connection } from "next/server"

import {
  buildProtectedResourceMetadata,
  DISCOVERY_CORS_HEADERS,
  discoveryPreflight,
} from "@/lib/agent-discovery"

/**
 * RFC 9728 metadata for `<origin>/api/mcp`, at the path that resource
 * identifier derives, and so the document a client validates when it wants a
 * token for the MCP server. The `WWW-Authenticate` challenge from `/api/mcp`
 * points here. The origin-level document in
 * `app/.well-known/oauth-protected-resource/route.ts` describes the origin
 * instead; both are built from `buildResourceMetadata` in lib/agent-discovery.ts,
 * so they cannot disagree about the authorization server or the scopes.
 */
export async function GET() {
  await connection()
  return Response.json(buildProtectedResourceMetadata(), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
    },
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
