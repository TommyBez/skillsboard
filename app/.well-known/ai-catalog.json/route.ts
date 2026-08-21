import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight } from "@/lib/agent-discovery"
import { buildArdCatalog } from "@/lib/ard-catalog"

/** ARD (Agentic Resource Discovery) capability manifest for this origin. */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildArdCatalog(),
    instance: "/.well-known/ai-catalog.json",
    requestHeaders: await headers(),
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
