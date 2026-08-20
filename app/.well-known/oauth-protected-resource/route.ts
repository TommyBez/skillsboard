import { connection } from "next/server"

import {
  buildProtectedResourceMetadata,
  DISCOVERY_CORS_HEADERS,
  discoveryPreflight,
} from "@/lib/agent-discovery"

/**
 * Origin-level RFC 9728 entry point.
 *
 * Agents that scan a site look here first, before they know which path holds
 * the protected API. The path-derived document at
 * `/.well-known/oauth-protected-resource/api/mcp` stays the canonical one for a
 * client that already has the resource identifier; both are built from the same
 * function, so they always describe the same resource.
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
