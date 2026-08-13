import "server-only"

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { ipAddress } from "@vercel/functions"
import { headers } from "next/headers"

import {
  type CaptureRateLimiter,
  claimCaptureBudget,
  EMAIL_CAPTURE_RATE_LIMIT_MAX,
  EMAIL_CAPTURE_RATE_LIMIT_PREFIX,
  EMAIL_CAPTURE_RATE_LIMIT_WINDOW,
  MISSING_CAPTURE_CREDENTIALS_WARNING,
} from "@/lib/email/email-capture-budget"
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
 * Which variables the credentials are read from is `Redis.fromEnv()`'s
 * business: it takes the canonical Upstash names, and falls back to the pair
 * the Vercel integration writes into the project under the older Vercel KV
 * spelling. Whether they are there is this function's business, and it is
 * asked first, because `fromEnv` does not throw on a missing one. It warns in
 * its own words and returns a client built around `undefined` that fails on
 * the first call, which is a limiter that refuses every submission rather than
 * the honestly missing one the fail-open needs.
 */
function getCaptureRateLimiter(): CaptureRateLimiter | null {
  if (captureRateLimiter !== undefined) return captureRateLimiter

  // The same two reads `fromEnv` makes, in the same order, so this decides on
  // the value it would build the client from. Blank counts as absent: a
  // variable that is defined and empty is ordinary in a Vercel project and in
  // a shell, and an empty token builds a client that fails every call.
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)?.trim()
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)?.trim()

  if (!(url && token)) {
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
    redis: Redis.fromEnv(),
    timeout: CAPTURE_RATE_LIMIT_TIMEOUT_MS,
  })

  return captureRateLimiter
}

/**
 * The client address this request is bucketed under, or `null` when it does
 * not carry one.
 *
 * Whatever the platform put on the request, taken as it comes. On Vercel that
 * is the proxy's own reading of the connection rather than anything the client
 * said about itself: "we currently overwrite the X-Forwarded-For header and do
 * not forward external IPs. This restriction is in place to prevent IP
 * spoofing" (https://vercel.com/docs/headers/request-headers), and `x-real-ip`,
 * which `ipAddress` reads, is that same value under a second name. One request
 * carries one address, in one spelling, and the client does not choose it.
 *
 * So nothing is validated or canonicalized here, because there is nothing left
 * for either to defend. Where the proxy in front of the app is not Vercel's,
 * the header is forgeable outright: a script puts a fresh and perfectly well
 * formed address on every submission, and agreeing with it on how to spell an
 * address it invented buys nothing. This is a budget rather than a boundary,
 * which is what an unauthenticated header is worth in both places.
 *
 * A request with no address carries nothing to bucket under. It is left
 * unbucketed and the submission goes through: refusing it would turn a missing
 * header into a way to lock the form.
 */
async function readCaptureIpAddress(): Promise<string | null> {
  // A header that is present and empty says as little as one that is absent,
  // and neither is a bucket, so this is `||` rather than `??`.
  return ipAddress(await headers()) || null
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
