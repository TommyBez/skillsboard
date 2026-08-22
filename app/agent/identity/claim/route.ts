import { connection } from "next/server"

import { handleClaimInitiation } from "@/lib/agent-auth/identity"
import { agentAuthJson, agentAuthPreflight, readJsonBody } from "@/lib/agent-auth/http"
import { agentAuthStore } from "@/lib/agent-auth/store-db"

/**
 * `POST /agent/identity/claim` — re-mints a confirmation ceremony.
 *
 * Reached when the `user_code` window closed before the human finished but the
 * registration is still live, so the agent can hand out a fresh code without
 * starting over at `/agent/identity`. It never creates a delegation and never
 * issues a credential; only the confirmation page can do that.
 */
export async function POST(request: Request) {
  await connection()

  const body = await readJsonBody(request)
  if (!body) {
    return agentAuthJson(
      { error: "invalid_request", message: "Body must be a JSON object." },
      { status: 400 },
    )
  }

  const result = await handleClaimInitiation(body, { store: agentAuthStore })
  return agentAuthJson(result.body, { status: result.status, headers: result.headers })
}

export function OPTIONS() {
  return agentAuthPreflight()
}
