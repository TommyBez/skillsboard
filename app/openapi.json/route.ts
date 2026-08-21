import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight } from "@/lib/agent-discovery"
import { buildOpenApiDocument } from "@/lib/openapi"

/**
 * The OpenAPI description linked as `service-desc` from `/.well-known/api-catalog`.
 *
 * A route rather than a file in `public` so the document describes the
 * deployment serving it. See `lib/openapi.ts`.
 */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildOpenApiDocument(),
    instance: "/openapi.json",
    requestHeaders: await headers(),
    contentType: "application/openapi+json; charset=utf-8",
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
