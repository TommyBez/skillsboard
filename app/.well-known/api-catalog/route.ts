import { connection } from "next/server"

import { DISCOVERY_CORS_HEADERS, discoveryPreflight } from "@/lib/agent-discovery"
import { API_CATALOG_MEDIA_TYPE, buildApiCatalog } from "@/lib/api-catalog"

/** RFC 9727 API catalog. Served as a linkset, not as plain JSON. */
export async function GET() {
  await connection()

  return new Response(`${JSON.stringify(buildApiCatalog(), null, 2)}\n`, {
    headers: {
      "Content-Type": API_CATALOG_MEDIA_TYPE,
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
    },
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
