import "server-only"

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

import {
  type CaptureRateLimiter,
  claimCaptureBudget,
  EMAIL_CAPTURE_RATE_LIMIT_MAX,
  EMAIL_CAPTURE_RATE_LIMIT_PREFIX,
  EMAIL_CAPTURE_RATE_LIMIT_WINDOW,
  MISSING_CAPTURE_CREDENTIALS_WARNING,
  resolveCaptureRedisCredentials,
} from "@/lib/email/email-capture-budget"
import { resolveCaptureIpAddress } from "@/lib/email/email-capture-ip"
import { hashCaptureIpAddress } from "@/lib/email/email-privacy"

/**
 * How long a submission waits on Redis before it is let through.
 *
 * Well under the five seconds `Ratelimit` allows by default: the visitor is
 * holding a form open, and a counter that has stopped answering must not be
 * what they wait on.
 */
const CAPTURE_RATE_LIMIT_TIMEOUT_MS = 1_000

/**
 * `undefined` until the first submission this process handles: `null` once it
 * is known there are no credentials to build a limiter from.
 */
let captureRateLimiter: CaptureRateLimiter | null | undefined

/**
 * The limiter every submission is counted against, built once per process.
 *
 * Serverless is why it is memoized rather than constructed per request: the
 * instance carries the cache that lets a client already over its budget be
 * refused without a round trip, and a fresh instance per invocation would
 * throw that away and pay Redis for every submission.
 *
 * A missing credential is not fatal. It is announced once, on the first
 * submission, and then the memo answers `null` without saying it again, so the
 * warning names a real gap in the logs instead of one line per visitor.
 *
 * Which variables the credentials are read from lives in the budget module,
 * because two spellings reach this: the pair the Vercel integration writes and
 * the pair a self-hosted deployment sets by hand.
 */
function getCaptureRateLimiter(): CaptureRateLimiter | null {
  if (captureRateLimiter !== undefined) return captureRateLimiter

  const credentials = resolveCaptureRedisCredentials(process.env)

  if (!credentials) {
    console.warn(MISSING_CAPTURE_CREDENTIALS_WARNING)
    captureRateLimiter = null

    return captureRateLimiter
  }

  captureRateLimiter = new Ratelimit({
    // Analytics writes a second key per request to fill a dashboard nobody
    // here reads. The budget is the whole point of this limiter.
    analytics: false,
    ephemeralCache: new Map(),
    limiter: Ratelimit.slidingWindow(
      EMAIL_CAPTURE_RATE_LIMIT_MAX,
      EMAIL_CAPTURE_RATE_LIMIT_WINDOW,
    ),
    prefix: EMAIL_CAPTURE_RATE_LIMIT_PREFIX,
    redis: new Redis(credentials),
    timeout: CAPTURE_RATE_LIMIT_TIMEOUT_MS,
  })

  return captureRateLimiter
}

/**
 * The client address this request is bucketed under, or `null` when it does
 * not carry one.
 *
 * On Vercel the client address arrives in `x-forwarded-for`, with `x-real-ip`
 * as the second spelling of the same value. Neither is authenticated, so this
 * is a budget rather than a boundary: it stops an unattended script from
 * filling the table, not a determined attacker with addresses to spend.
 *
 * A header that is present and unreadable is bucketed too, in the one bucket
 * every unreadable value shares, so it cannot buy a fresh budget per spelling.
 * A header that is absent or empty carries no address at all: it is left
 * unbucketed, and the submission goes through.
 */
async function readCaptureIpAddress(): Promise<string | null> {
  const requestHeaders = await headers()

  return resolveCaptureIpAddress(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  )
}

/**
 * Takes one submission out of this client's budget, and reports whether there
 * was one to take.
 *
 * The counting lives in Upstash rather than in a table of our own: a sliding
 * window in Redis is one round trip on a store built for it, where the same
 * budget in Postgres was a row per submission, an advisory lock to make the
 * count and the insert one claim, and a pruning job to keep the rows from
 * outliving their purpose.
 *
 * The limiter is a parameter so a test can hand in one that counts in memory.
 * Callers in the app take the default, which is the process-wide Upstash one.
 */
export async function claimEmailCaptureAttempt(
  limiter: CaptureRateLimiter | null = getCaptureRateLimiter(),
): Promise<boolean> {
  return claimCaptureBudget({
    hashAddress: hashCaptureIpAddress,
    ipAddress: await readCaptureIpAddress(),
    limiter,
  })
}
