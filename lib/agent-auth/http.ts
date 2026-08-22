import { auth } from "@/lib/auth"
import { API_VERSION_HEADER } from "@/lib/api-version"

/**
 * Shared HTTP shims for the agent-facing auth.md endpoints.
 *
 * These endpoints are called by agents and by provider backends, not by
 * browsers, but they answer preflight anyway so a browser-hosted agent can
 * reach them. Every response is `no-store`: each one carries a claim token, an
 * assertion, or an error that names the state of somebody's account.
 */

export const AGENT_AUTH_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": `Content-Type, Authorization, ${API_VERSION_HEADER}`,
  "Access-Control-Max-Age": "600",
} as const

export function agentAuthPreflight(): Response {
  return new Response(null, { status: 204, headers: AGENT_AUTH_CORS_HEADERS })
}

export function agentAuthJson(
  body: Record<string, unknown>,
  init?: { status?: number; headers?: Record<string, string> },
): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": AGENT_AUTH_CORS_HEADERS["Access-Control-Allow-Origin"],
      ...(init?.headers ?? {}),
    },
  })
}

/**
 * Re-issues a request against Better Auth's router at `targetPath`.
 *
 * The body and headers are carried across verbatim so the Better Auth endpoint
 * sees exactly what the agent sent; only the path changes. Building a fresh
 * `Request` (rather than mutating) keeps the original stream untouched, which
 * Next.js requires.
 */
export async function forwardToAuthHandler(
  request: Request,
  targetPath: string,
): Promise<Response> {
  const url = new URL(request.url)
  url.pathname = targetPath

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()
  const response = await auth.handler(
    new Request(url, { method: request.method, headers: request.headers, body }),
  )

  const headers = new Headers(response.headers)
  headers.set(
    "Access-Control-Allow-Origin",
    AGENT_AUTH_CORS_HEADERS["Access-Control-Allow-Origin"],
  )
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** Parses a JSON body, tolerating an empty one, without throwing. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text()
    if (!text.trim()) return {}
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}
