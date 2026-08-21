import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight } from "@/lib/agent-discovery"
import { API_CATALOG_MEDIA_TYPE, buildApiCatalog } from "@/lib/api-catalog"

/** RFC 9727 API catalog. Served as a linkset, not as plain JSON. */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildApiCatalog(),
    instance: "/.well-known/api-catalog",
    requestHeaders: await headers(),
    contentType: API_CATALOG_MEDIA_TYPE,
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
