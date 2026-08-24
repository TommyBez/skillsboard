import { getOAuthAuthorizeContinuePath } from "@/lib/oauth-continue"
import { isImmediateSignedInDestination, safeReturnTo } from "@/lib/safe-return-to"

/**
 * Marks a `/sign-in` URL that a *validated* session check just produced.
 *
 * `requireSession` sets it on every redirect it issues, which is exactly the
 * moment the server resolved the real session and found nothing. The proxy
 * reads it and stands down.
 *
 * Without it the optimistic check eats itself. A cookie that is present but no
 * longer valid — signed out elsewhere, revoked, secret rotated — passes the
 * proxy and fails the page, so `/onboarding` (which calls `requireSession()`
 * with no `returnTo`, landing on a bare `/sign-in`) would bounce to /library,
 * fail there, bounce back, forever. The marker is the one bit the edge cannot
 * derive on its own: *the authority has already spoken for this request.*
 *
 * Forging it costs nothing — the worst it buys is the sign-in page a visitor
 * asked for, and `AuthEntry` still redirects a genuinely signed-in one.
 */
export const SESSION_CHECKED_PARAM = "sessionChecked"

/**
 * The `/sign-in` path `requireSession` redirects to. Lives here, beside the
 * rule that reads it, so the producer and the consumer cannot drift: the
 * round-trip is asserted in `tests/auth-entry-redirect.test.mjs`.
 */
export function buildSessionCheckedSignInPath(returnTo?: string) {
  const query = new URLSearchParams()
  if (returnTo) query.set("returnTo", returnTo)
  query.set(SESSION_CHECKED_PARAM, "1")
  return `/sign-in?${query.toString()}`
}

function toParamRecord(searchParams: URLSearchParams) {
  const record: Record<string, string | string[]> = {}
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key)
    record[key] = values.length > 1 ? values : values[0]
  }
  return record
}

/**
 * Where the edge should send a `/sign-in` or `/sign-up` request that carries a
 * session cookie, or `null` to let the page decide.
 *
 * Only the immediate destinations are claimed — no `sessionChecked` marker, no
 * OAuth authorize params, and a `returnTo` that is absent or already `/library`,
 * `/connect`, or `/start`. The marketing CTA and the "Sign in" beside it both
 * link to a plain route, and a signed-in visitor following either only ever
 * wanted their library. `/connect` and `/start` are the same kind of page:
 * authenticated, and the place the visitor asked for.
 *
 * Everything else deliberately falls through to `AuthEntry`, because a
 * redirect would destroy it:
 *
 *   - `?client_id=…&response_type=…` resumes an MCP/OAuth authorize request,
 *     which is also how `app/consent` and Better Auth's `loginPage` arrive.
 *   - `?returnTo=/invite/…` is an invitation — `app/invite/[invitationId]` and
 *     the accept action both send unauthenticated users through here, and a
 *     signed-in one is owed the invitation, not their library.
 *   - `?returnTo=/settings/email` is the email-preferences hand-off.
 *
 * `AuthEntry` answers those with a "Continue to …" button rather than a
 * redirect, and it stays the authority for all of them.
 */
export function resolveSignedInAuthRedirect(
  searchParams: URLSearchParams,
): "/library" | "/connect" | "/start" | null {
  if (searchParams.has(SESSION_CHECKED_PARAM)) return null

  const params = toParamRecord(searchParams)
  if (getOAuthAuthorizeContinuePath(params)) return null

  const returnTo = safeReturnTo(
    typeof params.returnTo === "string" ? params.returnTo : undefined,
  )
  return isImmediateSignedInDestination(returnTo) ? returnTo : null
}
