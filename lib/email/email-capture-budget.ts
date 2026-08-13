/**
 * The capture budget: how much one client may spend on the form, and whether
 * the submission in hand still fits inside it.
 *
 * The counting happens in Upstash Redis, which takes a network call and a REST
 * token, so the limiter and the hash are handed in rather than reached for
 * here: this module is the decision and `email-capture-rate-limit.ts` is the
 * wiring. Which names the credentials arrive under is a decision too, and it
 * is taken here as a function over a plain environment record, leaving
 * `process.env` and the client it builds to the wiring.
 *
 * Keeping the two apart also keeps the decision loadable by the unit suite,
 * which reads modules through `stripTypeScriptTypes` and cannot resolve a bare
 * specifier, so every path below is exercised by a test rather than by a regex
 * over its own source.
 */

/**
 * The capture budget for one client address.
 *
 * The action is a public server action: anyone can post to it directly, with a
 * fresh address every time, and fill the table. Five submissions an hour is
 * far above what a person does (the card is a single field and one visit
 * produces one address) and far below what filling a table needs.
 *
 * The window slides. Upstash weighs the previous window into the current one,
 * so the budget cannot be spent twice across a boundary the way it could
 * against the fixed window this replaces.
 */
export const EMAIL_CAPTURE_RATE_LIMIT_MAX = 5
export const EMAIL_CAPTURE_RATE_LIMIT_WINDOW = "1 h"

/**
 * What every capture counter is keyed under in Redis.
 *
 * A named prefix keeps the keys readable in the Upstash console and keeps them
 * from colliding with a second limiter that ends up sharing the database.
 */
export const EMAIL_CAPTURE_RATE_LIMIT_PREFIX = "email-capture"

/**
 * The two spellings the Redis REST credentials arrive under, in the order they
 * are tried.
 *
 * The hosted database is provisioned through the Vercel Marketplace, and that
 * integration writes the pair into the project as `KV_REST_API_URL` and
 * `KV_REST_API_TOKEN`, the names the older Vercel KV product used. Nothing
 * fills in the canonical Upstash spelling there, so it is the fallback: a
 * self-hosted deployment pointing at a database created in the Upstash console
 * has no integration writing anything and sets those two by hand.
 *
 * A pair is taken whole. Reading each half on its own would let the URL of one
 * database meet the token of another, which authenticates against neither.
 *
 * The read-only token the integration also writes is not on the list: a claim
 * increments a counter, and that is a write.
 */
export const CAPTURE_REDIS_CREDENTIAL_NAMES = [
  { token: "KV_REST_API_TOKEN", url: "KV_REST_API_URL" },
  { token: "UPSTASH_REDIS_REST_TOKEN", url: "UPSTASH_REDIS_REST_URL" },
] as const

const [VERCEL_CREDENTIAL_NAMES, UPSTASH_CREDENTIAL_NAMES] = CAPTURE_REDIS_CREDENTIAL_NAMES

/**
 * What the wiring logs, once per process, when neither pair is set.
 *
 * It is built from the names above so the two cannot drift apart, and it names
 * both pairs because which one a reader should set depends on where they are:
 * on Vercel the integration writes the first, and everywhere else the second
 * is what an Upstash database of your own is reached with.
 */
export const MISSING_CAPTURE_CREDENTIALS_WARNING =
  "Email capture is not rate limited: set " +
  `${VERCEL_CREDENTIAL_NAMES.url} and ${VERCEL_CREDENTIAL_NAMES.token} ` +
  "(written by the Vercel Upstash integration), or " +
  `${UPSTASH_CREDENTIAL_NAMES.url} and ${UPSTASH_CREDENTIAL_NAMES.token} ` +
  "for an Upstash database configured by hand"

export interface CaptureRedisCredentials {
  token: string
  url: string
}

/**
 * The first credential pair this environment has both halves of, or `null`
 * when it has neither.
 *
 * Blank counts as absent. A variable that is defined and empty is ordinary in
 * a Vercel project and in a shell, and an empty token would build a client
 * that fails every call at runtime instead of a limiter that is honestly
 * missing here.
 */
export function resolveCaptureRedisCredentials(
  env: Record<string, string | undefined>,
): CaptureRedisCredentials | null {
  for (const names of CAPTURE_REDIS_CREDENTIAL_NAMES) {
    const url = env[names.url]?.trim()
    const token = env[names.token]?.trim()

    if (url && token) return { token, url }
  }

  return null
}

/**
 * As much of a rate limiter as a claim uses.
 *
 * Narrow on purpose: production hands in an Upstash `Ratelimit`, a test hands
 * in something that counts in memory, and neither has to know about the other.
 */
export interface CaptureRateLimiter {
  limit(identifier: string): Promise<{ success: boolean }>
}

export interface CaptureBudgetClaim {
  /** Turns a client address into the key its counter lives under. */
  hashAddress(ipAddress: string): string
  /** The canonical client address, or `null` when the request carries none. */
  ipAddress: string | null
  /** The limiter, or `null` when this environment has no Upstash credentials. */
  limiter: CaptureRateLimiter | null
}

/**
 * Takes one submission out of this client's budget, and reports whether there
 * was one to take.
 *
 * Three ways out say yes without counting anything, and all three are
 * deliberate.
 *
 * A request with no readable client address has nothing to bucket under, and
 * refusing it would turn a missing header into a way to lock the form.
 *
 * An environment with no Upstash credentials has nowhere to count, so the form
 * keeps working without a rate limit rather than refusing every visitor. That
 * is a real gap and not a silent one: the wiring logs it once on the first
 * submission a process handles.
 *
 * A limiter that throws or times out is the same trade taken at runtime. Redis
 * being unreachable is an outage of the counter, not of the product, and an
 * unreachable counter must not take the form down with it. The address never
 * reaches the log; only the error name does.
 */
export async function claimCaptureBudget({
  hashAddress,
  ipAddress,
  limiter,
}: CaptureBudgetClaim): Promise<boolean> {
  if (!ipAddress || !limiter) return true

  try {
    // The identifier is the hashed address, never the address: a bucket key
    // lives in someone else's database, and this one cannot be read back into
    // the client it belongs to.
    const { success } = await limiter.limit(hashAddress(ipAddress))

    return success
  } catch (error) {
    console.error("Unable to reach the email capture rate limit", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    })

    return true
  }
}
