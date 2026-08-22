import { connection } from "next/server"

import { requireAgentClient } from "@/lib/agent-auth/clients"
import { ID_JAG_ASSERTION_TYPE } from "@/lib/agent-auth/config"
import { AgentAuthError, agentAuthChallenge, toAgentAuthResponse } from "@/lib/agent-auth/errors"
import { runIdentityFlow, type IdentityRequest } from "@/lib/agent-auth/identity-flow"

/**
 * `POST /agent/identity` — the auth.md Agent Verified identity endpoint.
 *
 * An agent presents the ID-JAG its own provider minted for this service, and
 * gets back a short-lived identity assertion to exchange at the token
 * endpoint. It never gets an access token here: minting credentials is the
 * OAuth provider's job, and keeping the two steps apart is what lets every
 * token this deployment issues come from one place.
 */
export async function POST(request: Request) {
  await connection()

  try {
    const body = await readJsonBody(request)

    // Only one identity type is supported, and saying so explicitly matters:
    // an agent that tried `anonymous` or `service_auth` needs to learn this
    // deployment refuses them, not to have its ID-JAG field read as absent.
    if (body.type !== undefined && body.type !== "identity_assertion") {
      throw new AgentAuthError(
        "invalid_request",
        "Skills Board supports the identity_assertion type only.",
      )
    }

    if (body.assertion_type !== undefined && body.assertion_type !== ID_JAG_ASSERTION_TYPE) {
      throw new AgentAuthError(
        "invalid_request",
        `assertion_type must be ${ID_JAG_ASSERTION_TYPE}.`,
      )
    }

    const client = await requireAgentClient(body.client_id)
    const { result } = await runIdentityFlow(body, { clientId: client.clientId })

    return Response.json(result, {
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

/**
 * A GET here is an agent that found the endpoint before it found the docs.
 * The 401 carries the same challenge every refusal does, so the discovery
 * chain is reachable from the wrong method as well as from the wrong token.
 */
export async function GET() {
  await connection()

  return Response.json(
    {
      error: "invalid_request",
      error_description: "POST an identity_assertion to this endpoint. See /auth.md.",
    },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": agentAuthChallenge(),
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  )
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

async function readJsonBody(request: Request): Promise<IdentityRequest> {
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new AgentAuthError("invalid_request", "The request body must be a JSON object.")
    }
    return parsed as IdentityRequest
  } catch (error) {
    if (error instanceof AgentAuthError) throw error
    throw new AgentAuthError("invalid_request", "The request body must be a JSON object.")
  }
}
