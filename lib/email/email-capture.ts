/**
 * Marketing email capture: normalization and validation.
 *
 * Deliberately dependency-free so the rules can be exercised by the unit
 * suite, which loads modules through `stripTypeScriptTypes` and cannot resolve
 * bare specifiers from a data: URL. Everything here runs on untrusted form
 * input, so each helper returns a normalized value or rejects it rather than
 * trusting the caller.
 */

/** RFC 5321 caps an address at 254 characters; anything longer is not one. */
export const EMAIL_CAPTURE_MAX_LENGTH = 254

/**
 * Deliberately permissive: the address is stored and never delivered to in
 * this change, so the only job here is to reject input that cannot be an
 * address (no "@", no dot in the domain, whitespace, absurd length) without
 * becoming a second, private spelling of the email grammar.
 */
const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

/**
 * The capture surfaces, as a shape rather than an enumeration: guides and
 * alternative pages each carry their own slug, and the analytics property in
 * `analytics/posthog/events.ts` is typed the same way. Anything else is folded
 * into `unknown`, so a crafted form post cannot write arbitrary strings into
 * the column or into PostHog.
 */
const sourcePattern = /^(?:alternatives_[a-z0-9_-]{1,80}|guide_[a-z0-9_-]{1,80}|landing)$/

export const UNKNOWN_EMAIL_CAPTURE_SOURCE = "unknown"

/**
 * The consent notice, kept beside the rules so the card renders exactly what
 * the ledger stores. `EMAIL_CAPTURE_NOTICE_TEXT` is the two lines a visitor
 * reads, in the order the card stacks them. Bump the version whenever either
 * line changes, so a row written today keeps the promise that was actually on
 * screen when it was written.
 */
export const EMAIL_CAPTURE_NOTICE_VERSION = "email-capture-v1"

/** The supporting line under the card heading. */
export const EMAIL_CAPTURE_PROMISE =
  "An occasional email when Skills Board ships a new feature or publishes a new guide."

/** The footnote under the card form. */
export const EMAIL_CAPTURE_NOTICE_FOOTNOTE =
  "Only Skills Board updates. Unsubscribe anytime."

/** What the visitor read before submitting, stored on the consent event. */
export const EMAIL_CAPTURE_NOTICE_TEXT =
  `${EMAIL_CAPTURE_PROMISE} ${EMAIL_CAPTURE_NOTICE_FOOTNOTE}`

/** Lowercased, trimmed address, or `null` when the input cannot be one. */
export function normalizeCapturedEmail(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  if (normalized.length === 0 || normalized.length > EMAIL_CAPTURE_MAX_LENGTH) {
    return null
  }

  return emailPattern.test(normalized) ? normalized : null
}

/** The submitting surface, or `unknown` when it is not one we render. */
export function normalizeCaptureSource(value: unknown): string {
  if (typeof value !== "string") return UNKNOWN_EMAIL_CAPTURE_SOURCE

  const normalized = value.trim().toLowerCase()
  return sourcePattern.test(normalized) ? normalized : UNKNOWN_EMAIL_CAPTURE_SOURCE
}

/**
 * The honeypot field is hidden from people and left empty by them. A filled
 * one is a bot, and the caller answers it exactly the way it answers a person
 * so the probe learns nothing.
 */
export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0
}
