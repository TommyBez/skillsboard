/**
 * The verification URL an agent hands a user during an auth.md first-link
 * ceremony. The token is opaque and single-purpose, so the shape is pinned
 * exactly: a wider match here would turn `returnTo` back into an open redirect.
 */
const AGENT_CLAIM_RETURN_TO = /^\/agent\/claim\?claim_attempt_token=cvt_[A-Za-z0-9_-]{1,200}$/

export function safeReturnTo(value: unknown, fallback = "/library") {
  if (value === "/library" || value === "/settings/email") return value
  if (typeof value === "string" && /^\/invite\/[A-Za-z0-9_-]{1,200}$/.test(value)) return value
  if (typeof value === "string" && AGENT_CLAIM_RETURN_TO.test(value)) return value
  return fallback
}

/** Whether a `returnTo` points at the agent confirmation page. */
export function isAgentClaimReturnTo(value: string): boolean {
  return AGENT_CLAIM_RETURN_TO.test(value)
}
