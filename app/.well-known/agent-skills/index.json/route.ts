import { headers } from "next/headers"
import { connection } from "next/server"

import { agentDocumentResponse } from "@/lib/agent-document"
import { discoveryPreflight } from "@/lib/agent-discovery"
import { buildAgentSkillsIndex } from "@/lib/published-agent-skills"

/** Agent Skills Discovery index (RFC v0.2.0) for the skills this site publishes. */
export async function GET() {
  await connection()

  return agentDocumentResponse({
    document: buildAgentSkillsIndex(),
    instance: "/.well-known/agent-skills/index.json",
    requestHeaders: await headers(),
  })
}

export function OPTIONS() {
  return discoveryPreflight()
}
