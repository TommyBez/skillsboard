import { connection } from "next/server"

import { AgentAuthError, toAgentAuthResponse } from "@/lib/agent-auth/errors"
import { applySecurityEventToken } from "@/lib/agent-auth/security-events"

/**
 * `POST /agent/events` — the Security Event Token receiver (RFC 8935).
 *
 * This is the second, coarser level of revocation. `/oauth2/revoke` kills one
 * credential; an event here kills the *delegation*, so no future ID-JAG for
 * that `(iss, sub, aud)` resolves to a user again until a human re-approves
 * the link. A provider that decides a user's agent access is over has to be
 * able to say so without waiting for tokens to expire.
 *
 * Answers 202 with an empty body per RFC 8935 §2.3.
 */
export async function POST(request: Request) {
  await connection()

  try {
    const contentType = request.headers.get("content-type") ?? ""
    const mediaType = contentType.split(";", 1)[0].trim().toLowerCase()
    if (mediaType !== "application/secevent+jwt" && mediaType !== "text/plain") {
      throw new AgentAuthError(
        "invalid_request",
        "Send the Security Event Token as application/secevent+jwt.",
      )
    }

    const outcome = await applySecurityEventToken((await request.text()).trim())

    console.info("Applied an agent provider security event", outcome)

    return new Response(null, {
      status: 202,
      headers: { "Cache-Control": "no-store" },
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
