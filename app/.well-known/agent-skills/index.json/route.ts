import { connection } from "next/server"

import { DISCOVERY_CORS_HEADERS, discoveryPreflight } from "@/lib/agent-discovery"
import { buildAgentSkillsIndex } from "@/lib/published-agent-skills"

/** Agent Skills Discovery index (RFC v0.2.0) for the skills this site publishes. */
export async function GET() {
  await connection()

  return Response.json(buildAgentSkillsIndex(), {
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
