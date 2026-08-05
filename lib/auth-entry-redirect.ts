import { getOAuthAuthorizeContinuePath } from "@/lib/oauth-continue"
import { safeReturnTo } from "@/lib/safe-return-to"

function toParamRecord(searchParams: URLSearchParams) {
  const record: Record<string, string | string[]> = {}
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key)
    record[key] = values.length > 1 ? values : values[0]
  }
  return record
}

/**
 * Where the edge should send a `/sign-up` request that carries a session
 * cookie, or `null` to let the page decide.
 *
 * Only the bare shape is claimed here — no OAuth authorize params, and a
 * `returnTo` that is absent or already `/library`. That is the marketing CTA:
 * every landing, guide, and resource button links to a plain `/sign-up`, and a
 * signed-in visitor following one only ever wanted their library.
 *
 * Everything else deliberately falls through to `AuthEntry`, because a
 * redirect would destroy it:
 *
 *   - `?client_id=…&response_type=…` resumes an MCP/OAuth authorize request.
 *   - `?returnTo=/invite/…` is an invitation — `app/invite/[invitationId]` and
 *     the accept action both send unauthenticated users here, and a signed-in
 *     one is owed the invitation, not their library.
 *   - `?returnTo=/settings/email` is the email-preferences hand-off.
 *
 * `AuthEntry` answers those with a "Continue to …" button rather than a
 * redirect, and it stays the authority for all of them.
 */
export function resolveSignedInSignUpRedirect(
  searchParams: URLSearchParams,
): "/library" | null {
  const params = toParamRecord(searchParams)
  if (getOAuthAuthorizeContinuePath(params)) return null

  const returnTo = safeReturnTo(
    typeof params.returnTo === "string" ? params.returnTo : undefined,
  )
  return returnTo === "/library" ? "/library" : null
}
