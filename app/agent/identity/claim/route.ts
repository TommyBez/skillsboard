import { connection } from "next/server"

import { pollClaim } from "@/lib/agent-auth/claim-flow"
import { AgentAuthError, toAgentAuthResponse } from "@/lib/agent-auth/errors"

/**
 * `POST /agent/identity/claim` — where an agent waits out a first-link
 * ceremony.
 *
 * Polled with the `claim_token` the `interaction_required` refusal handed
 * back. While the human has not decided it answers `authorization_pending`
 * with the interval to respect; once they approve it returns exactly the body
 * `/agent/identity` would have returned had the delegation already existed.
 */
export async function POST(request: Request) {
  await connection()

  try {
    const body = await readJsonBody(request)
    const outcome = await pollClaim({
      registrationId: body.registration_id,
      claimToken: body.claim_token,
    })

    if (outcome.status !== "complete") {
      throw new AgentAuthError("interaction_required", "The account holder has not approved this agent yet.")
    }

    return Response.json(outcome.result, {
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    return toAgentAuthResponse(error)
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new AgentAuthError("invalid_request", "The request body must be a JSON object.")
    }
    return parsed as Record<string, unknown>
  } catch (error) {
    if (error instanceof AgentAuthError) throw error
    throw new AgentAuthError("invalid_request", "The request body must be a JSON object.")
  }
}
