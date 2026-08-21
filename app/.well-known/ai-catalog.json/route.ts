import { connection } from "next/server"

import { DISCOVERY_CORS_HEADERS, discoveryPreflight } from "@/lib/agent-discovery"
import { buildArdCatalog } from "@/lib/ard-catalog"

/** ARD (Agentic Resource Discovery) capability manifest for this origin. */
export async function GET() {
  await connection()

  return Response.json(buildArdCatalog(), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
    },
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
