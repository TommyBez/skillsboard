/**
 * Marketing email capture: normalization, validation, and the rate limit
 * budget.
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
 * alternative pages each carry their own slug. This is the single definition;
 * the card prop and the analytics property in `analytics/posthog/events.ts`
 * both refer back to it, so the two cannot drift apart.
 */
export type EmailCaptureSource =
  | `alternatives_${string}`
  | `guide_${string}`
  | "landing"

const sourcePattern = /^(?:alternatives_[a-z0-9_-]{1,80}|guide_[a-z0-9_-]{1,80}|landing)$/

export const UNKNOWN_EMAIL_CAPTURE_SOURCE = "unknown"

/**
 * What the column and the analytics property can actually hold. A crafted form
 * post is folded into `unknown` rather than written through, so neither the
 * column nor PostHog can be made to hold arbitrary strings, and a submission
 * that did not come from a surface we render stays visible as such.
 */
export type StoredEmailCaptureSource =
  | EmailCaptureSource
  | typeof UNKNOWN_EMAIL_CAPTURE_SOURCE

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

/**
 * The capture budget for one client address.
 *
 * The action is a public server action: anyone can post to it directly, with
 * a fresh address every time, and fill the table. Five submissions an hour is
 * far above what a person does (the card is a single field and one visit
 * produces one address) and far below what filling a table needs.
 *
 * The window is fixed rather than sliding, so the check is one indexed count
 * instead of a moving range scan. The cost of that choice is a burst of up to
 * twice the budget across a window boundary, which is still a rounding error
 * against the abuse this exists to stop.
 */
export const EMAIL_CAPTURE_RATE_LIMIT_MAX = 5
export const EMAIL_CAPTURE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

/**
 * Attempt rows exist only to answer "how many in this window". A day is long
 * enough that pruning can never race a live window, and short enough that the
 * table stays a counter rather than a log of who submitted when.
 */
export const EMAIL_CAPTURE_ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000

/**
 * Pruning is opportunistic: a small share of accepted submissions pays for the
 * delete, so expired rows leave without a scheduled job and without adding a
 * second query to every submission.
 */
export const EMAIL_CAPTURE_PRUNE_SAMPLE_RATE = 0.02

/** An IPv6 address in its longest textual form is 45 characters. */
export const CAPTURE_IP_MAX_LENGTH = 45

const ipv4Pattern = /^\d{1,3}(?:\.\d{1,3}){3}$/
const ipv4WithPortPattern = /^(\d{1,3}(?:\.\d{1,3}){3}):\d{1,5}$/
const ipv6Pattern = /^[0-9a-f:]+$/

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
export function normalizeCaptureSource(value: unknown): StoredEmailCaptureSource {
  if (typeof value !== "string") return UNKNOWN_EMAIL_CAPTURE_SOURCE

  const normalized = value.trim().toLowerCase()
  // The pattern is the runtime spelling of `EmailCaptureSource`: a value that
  // passes it is one of the shapes, which the compiler cannot see from a regex.
  return sourcePattern.test(normalized)
    ? (normalized as EmailCaptureSource)
    : UNKNOWN_EMAIL_CAPTURE_SOURCE
}

/**
 * The client address to bucket a submission under, or `null` when the request
 * does not carry one we can read.
 *
 * `x-forwarded-for` is a list and the client sits at its head. A value that is
 * not an address is treated as no address at all: the bucket key has to be
 * something a person actually shares with themselves across submissions, and
 * an unparseable one would only create a private bucket per garbage string.
 */
export function normalizeCaptureIpAddress(value: unknown): string | null {
  if (typeof value !== "string") return null

  const [first] = value.split(",")
  let candidate = (first ?? "").trim().toLowerCase()

  // An IPv6 literal can arrive bracketed, with or without a trailing port.
  if (candidate.startsWith("[")) {
    const closing = candidate.indexOf("]")
    if (closing === -1) return null
    candidate = candidate.slice(1, closing)
  }

  // A proxy can append a port. The address alone is the bucket.
  const withoutPort = ipv4WithPortPattern.exec(candidate)
  if (withoutPort?.[1]) candidate = withoutPort[1]

  if (candidate.length === 0 || candidate.length > CAPTURE_IP_MAX_LENGTH) return null

  if (ipv4Pattern.test(candidate)) {
    return candidate.split(".").every((octet) => Number(octet) <= 255)
      ? candidate
      : null
  }

  return candidate.includes(":") && ipv6Pattern.test(candidate) ? candidate : null
}

/** The start of the fixed window `now` falls in. */
export function captureRateLimitWindowStart(now: Date): Date {
  const windowMs = EMAIL_CAPTURE_RATE_LIMIT_WINDOW_MS
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs)
}

/** Attempt rows older than this are past their purpose and can go. */
export function captureAttemptRetentionCutoff(now: Date): Date {
  return new Date(now.getTime() - EMAIL_CAPTURE_ATTEMPT_RETENTION_MS)
}

/** Whether a submission arriving after `attempts` in the window is over budget. */
export function isOverCaptureRateLimit(attempts: number): boolean {
  return attempts >= EMAIL_CAPTURE_RATE_LIMIT_MAX
}

/** Whether this submission is the one that pays for the prune. */
export function shouldPruneCaptureAttempts(sample: number): boolean {
  return sample < EMAIL_CAPTURE_PRUNE_SAMPLE_RATE
}

/**
 * The honeypot field is hidden from people and left empty by them. A filled
 * one is a bot, and the caller answers it exactly the way it answers a person
 * so the probe learns nothing.
 */
export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0
}
