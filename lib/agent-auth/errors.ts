import { discoveryUrl } from "@/lib/agent-discovery"
import { getAgentAudience } from "@/lib/agent-auth/config"

/**
 * The errors `/agent/identity` can answer with.
 *
 * OAuth error codes (RFC 6749 §5.2 plus the OIDC `login_required` /
 * `interaction_required` pair auth.md reuses), not the RFC 9457 problem
 * documents the rest of this surface serves. An agent arriving here is running
 * an OAuth-family flow and branches on `error`; a problem document would reach
 * it as an unparseable body at the exact moment it needs to tell
 * "re-authenticate the user at your provider" from "send the user to a
 * browser".
 */
export type AgentAuthErrorCode =
  | "invalid_request"
  | "invalid_client"
  | "invalid_grant"
  | "invalid_scope"
  | "invalid_target"
  | "login_required"
  | "interaction_required"
  | "access_denied"
  | "server_error"

const STATUS: Record<AgentAuthErrorCode, number> = {
  invalid_request: 400,
  invalid_client: 401,
  invalid_grant: 400,
  invalid_scope: 400,
  invalid_target: 400,
  // 401, not 403: both mean "come back with a better credential", and an agent
  // that reads 403 as terminal would stop instead of re-authenticating.
  login_required: 401,
  interaction_required: 401,
  access_denied: 403,
  server_error: 500,
}

export class AgentAuthError extends Error {
  readonly code: AgentAuthErrorCode
  readonly description: string
  readonly extensions: Record<string, unknown>

  constructor(
    code: AgentAuthErrorCode,
    description: string,
    extensions: Record<string, unknown> = {},
  ) {
    super(`${code}: ${description}`)
    this.name = "AgentAuthError"
    this.code = code
    this.description = description
    this.extensions = extensions
  }

  get status(): number {
    return STATUS[this.code]
  }

  toResponse(): Response {
    return agentAuthErrorResponse(this)
  }
}

/**
 * The `WWW-Authenticate` challenge every refusal carries.
 *
 * It names the protected-resource metadata document (RFC 9728 §5.1), so an
 * agent that reached this endpoint by guessing — or one whose token just
 * stopped working — can rediscover the whole flow from the refusal itself
 * rather than needing to have read `/auth.md` first.
 */
export function agentAuthChallenge(error?: AgentAuthError): string {
  const parameters = [
    `resource_metadata="${discoveryUrl("/.well-known/oauth-protected-resource")}"`,
    `resource="${getAgentAudience()}"`,
  ]
  if (error) {
    parameters.push(`error="${error.code}"`, `error_description="${escapeQuoted(error.description)}"`)
  }
  return `Bearer ${parameters.join(", ")}`
}

/** RFC 9110 quoted-string: only `"` and `\` need escaping inside one. */
function escapeQuoted(value: string): string {
  return value.replace(/[\\"]/g, "\\$&")
}

export function agentAuthErrorResponse(error: AgentAuthError): Response {
  return Response.json(
    {
      error: error.code,
      error_description: error.description,
      ...error.extensions,
    },
    {
      status: error.status,
      headers: {
        "WWW-Authenticate": agentAuthChallenge(error),
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    },
  )
}

/**
 * Turns anything thrown inside the identity flow into a response.
 *
 * An unexpected error becomes a bare `server_error` with no detail: the detail
 * would describe our internals to an unauthenticated caller, and the caller
 * cannot act on it either way.
 */
export function toAgentAuthResponse(error: unknown): Response {
  if (error instanceof AgentAuthError) return error.toResponse()

  console.error("Unexpected failure in the agent identity flow", {
    name: error instanceof Error ? error.name : "UnknownError",
  })
  return agentAuthErrorResponse(
    new AgentAuthError("server_error", "The identity request could not be processed."),
  )
}
