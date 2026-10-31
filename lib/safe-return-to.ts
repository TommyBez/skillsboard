/**
 * Destinations a signed-in visitor is owed immediately, the same way the
 * marketing `/sign-in` CTA owes them `/library`. Invitation hand-offs stay
 * off this list so `AuthEntry` can show Continue.
 */
export const immediateSignedInDestinations = ["/library", "/connect"] as const

export function isImmediateSignedInDestination(
  path: string,
): path is (typeof immediateSignedInDestinations)[number] {
  return (immediateSignedInDestinations as readonly string[]).includes(path)
}

/** An invitation hand-off, which `AuthEntry` answers with Continue. */
export function isInvitationPath(path: string) {
  return /^\/invite\/[A-Za-z0-9_-]{1,200}$/.test(path)
}

// Parsing against a fixed origin is how "same origin" is decided: anything
// that resolves elsewhere (`https://…`, `//host`, `/\host`) changes it.
const PARSE_ORIGIN = "https://return-to.invalid"

// Never a destination: the auth pages would loop back into sign-in, and
// `/api/*` (OAuth authorize, sign-out, …) acts on the session rather than
// showing a page.
const excludedRoots = ["/api", "/sign-in", "/sign-up"]

/**
 * The path, plus query, to send a visitor to after auth, or `fallback`.
 *
 * Any same-origin page qualifies, so every protected route the proxy gates can
 * hand its own URL through sign-in. External URLs, protocol-relative `//host`,
 * backslash tricks and control characters are rejected.
 */
export function safeReturnTo(value: unknown, fallback = "/library") {
  if (typeof value !== "string" || !value.startsWith("/") || value.length > 2048) return fallback
  if (value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback

  let url: URL
  try {
    url = new URL(value, PARSE_ORIGIN)
  } catch {
    return fallback
  }
  if (url.origin !== PARSE_ORIGIN) return fallback

  const path = url.pathname
  if (excludedRoots.some((root) => path === root || path.startsWith(`${root}/`))) return fallback
  return `${path}${url.search}`
}
