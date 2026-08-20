/**
 * Temporary Cursor MCP DCR compatibility for Better Auth 1.7.
 *
 * Cursor still omits `application_type` and registers
 * `cursor://anysphere.cursor-mcp/oauth/callback`. OIDC defaults the omission
 * to `web`, and even `native` rejects that URI because it has a naming
 * authority (RFC 8252 wants `com.example.app:/callback`). Remove this once
 * Cursor sends `application_type: "native"` and a conformant redirect.
 *
 * Does not skip consent or PKCE.
 */

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"])
const CURSOR_CLIENT_NAME = "Cursor"
const CURSOR_CUSTOM_SCHEME = /^cursor:\/\/anysphere\.cursor-mcp\/oauth(?:\/[^/]+)?\/callback$/
const CURSOR_CLAIMED_HTTPS = "https://www.cursor.com/agents/mcp/oauth/callback"
const CURSOR_LOOPBACK_FALLBACK = "http://localhost:8787/callback"

export function isCursorCustomSchemeRedirect(uri: string): boolean {
  return CURSOR_CUSTOM_SCHEME.test(uri)
}

export function isKnownCursorRedirect(uri: string): boolean {
  if (isCursorCustomSchemeRedirect(uri)) return true
  if (uri === CURSOR_CLAIMED_HTTPS) return true
  try {
    const parsed = new URL(uri)
    return (
      parsed.protocol === "http:" &&
      LOOPBACK_HOSTS.has(parsed.hostname) &&
      parsed.port === "8787" &&
      parsed.pathname === "/callback"
    )
  } catch {
    return false
  }
}

export function isCursorDcrRequest(body: Record<string, unknown>): boolean {
  const uris = stringList(body.redirect_uris)
  if (uris.some(isCursorCustomSchemeRedirect)) return true
  const name = typeof body.client_name === "string" ? body.client_name.trim() : ""
  return name === CURSOR_CLIENT_NAME && uris.some(isKnownCursorRedirect)
}

/** Redirects Better Auth 1.7 will accept on a native DCR request. */
export function isBetterAuthAcceptedNativeRedirect(uri: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(uri)
  } catch {
    return false
  }
  if (parsed.username || parsed.password || parsed.hash) return false
  if (parsed.protocol === "http:") return LOOPBACK_HOSTS.has(parsed.hostname)
  if (parsed.protocol === "https:") return Boolean(parsed.hostname)
  const scheme = parsed.protocol.slice(0, -1)
  return scheme.includes(".") && parsed.host === ""
}

export function prepareCursorDcrRegistration(body: Record<string, unknown>): {
  registrationBody: Record<string, unknown>
  storedRedirectUris: string[]
} {
  const requested = unique(stringList(body.redirect_uris).filter(isKnownCursorRedirect))
  const storedRedirectUris = requested.length > 0 ? requested : stringList(body.redirect_uris)
  const accepted = storedRedirectUris.filter(isBetterAuthAcceptedNativeRedirect)
  const redirectUris = accepted.length > 0 ? accepted : [CURSOR_LOOPBACK_FALLBACK]

  return {
    registrationBody: {
      ...body,
      application_type: body.application_type || "native",
      redirect_uris: redirectUris,
    },
    storedRedirectUris: unique([...storedRedirectUris, ...redirectUris]),
  }
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.length > 0)
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
