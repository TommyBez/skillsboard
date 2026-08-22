import { connection } from "next/server"

import { getAgentAudience } from "@/lib/agent-auth/config"
import { handleSecurityEvent } from "@/lib/agent-auth/events"
import { agentAuthJson, agentAuthPreflight } from "@/lib/agent-auth/http"
import { agentAuthStore } from "@/lib/agent-auth/store-db"

/**
 * RFC 8935 SET receiver. The body is a bare JWT, not JSON, so it is read as
 * text; the signature and the trust list decide whether it is acted on, and an
 * untrusted issuer never reaches the store.
 */
export async function POST(request: Request) {
  await connection()

  const contentType = request.headers.get("content-type") ?? ""
  if (contentType && !contentType.toLowerCase().startsWith("application/secevent+jwt")) {
    return agentAuthJson(
      {
        err: "invalid_request",
        description: "Content-Type must be application/secevent+jwt.",
      },
      { status: 400 },
    )
  }

  const token = await request.text()
  const result = await handleSecurityEvent(token, {
    store: agentAuthStore,
    audience: getAgentAudience(),
  })

  if (result.status === 202) {
    return new Response(null, {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    })
  }
  return agentAuthJson(result.body, { status: result.status })
}

export function OPTIONS() {
  return agentAuthPreflight()
}
