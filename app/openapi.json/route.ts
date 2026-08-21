import { connection } from "next/server"

import { DISCOVERY_CORS_HEADERS, discoveryPreflight } from "@/lib/agent-discovery"
import { buildOpenApiDocument } from "@/lib/openapi"

/**
 * The OpenAPI description linked as `service-desc` from `/.well-known/api-catalog`.
 *
 * A route rather than a file in `public` so the document describes the
 * deployment serving it. See `lib/openapi.ts`.
 */
export async function GET() {
  await connection()

  return new Response(`${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`, {
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
    },
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
