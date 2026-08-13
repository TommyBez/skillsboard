/**
 * The capture budget: how much one client may spend on the form, and whether
 * the submission in hand still fits inside it.
 *
 * The counting happens in Upstash Redis, which takes a network call and a REST
 * token, so the limiter and the hash are handed in rather than reached for
 * here: this module is the decision and `email-capture-rate-limit.ts` is the
 * wiring. Keeping the two apart also keeps the decision loadable by the unit
 * suite, which reads modules through `stripTypeScriptTypes` and cannot resolve
 * a bare specifier, so every path below is exercised by a test rather than by
 * a regex over its own source.
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
