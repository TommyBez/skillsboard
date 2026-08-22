import { connection } from "next/server"

import { AGENT_AUTH_PATHS } from "@/lib/agent-auth/config"
import { agentAuthPreflight, forwardToAuthHandler } from "@/lib/agent-auth/http"

/**
 * `POST /agent/identity` — the path auth.md discovery advertises.
 *
 * The handler itself is a Better Auth endpoint (it needs the authorization
 * server's signing key and adapter), so this route forwards to it rather than
 * re-implementing it. `/api/auth/agent/identity` answers identically for a
 * client that found the endpoint through Better Auth's own routing.
 */
export async function POST(request: Request) {
  await connection()
  return forwardToAuthHandler(request, `/api/auth${AGENT_AUTH_PATHS.identity}`)
}

export function OPTIONS() {
  return agentAuthPreflight()
}
