import { connection } from "next/server"

import { agentAuthPreflight, forwardToAuthHandler } from "@/lib/agent-auth/http"
import { revokeAgentCredential } from "@/lib/agent-auth/revocation"
import { agentAuthStore } from "@/lib/agent-auth/store-db"

/**
 * `POST /oauth2/revoke` — the revocation endpoint auth.md discovery advertises.
 *
 * Agent credentials are revoked here directly; anything else is passed through
 * to Better Auth's own RFC 7009 endpoint, so one URL serves both kinds of client
 * and this deployment still has a single revocation implementation per token
 * type.
 *
 * RFC 7009 §2.2: an unknown, malformed, or already-revoked token is still a
 * `200`. Only a malformed *request* is an error, so revocation cannot be used to
 * probe which tokens exist.
 */
export async function POST(request: Request) {
  await connection()

  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.toLowerCase().includes("application/x-www-form-urlencoded")) {
    return Response.json(
      {
        error: "invalid_request",
        error_description: "Content-Type must be application/x-www-form-urlencoded.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  // Read the body once, then rebuild the request for the pass-through path:
  // a consumed stream cannot be forwarded.
  const raw = await request.text()
  const form = new URLSearchParams(raw)
  const token = form.get("token")

  if (!token) {
    return Response.json(
      { error: "invalid_request", error_description: "token is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  const outcome = await revokeAgentCredential(token, agentAuthStore)
  if (outcome.handled) {
    return new Response(null, {
      status: 200,
      headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
    })
  }

  return forwardToAuthHandler(
    new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: raw,
    }),
    "/api/auth/oauth2/revoke",
  )
}

export function OPTIONS() {
  return agentAuthPreflight()
}
