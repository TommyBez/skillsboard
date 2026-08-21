/**
 * The request budget the public HTTP endpoints publish, and the counter that
 * enforces it.
 *
 * Why a counter in the process rather than the Upstash limiter the email
 * capture form uses: this budget exists so an agent can pace itself, and the
 * headers that tell it how are only honest if the limit is real on every
 * deployment. A Redis round trip on a liveness probe would also be a strange
 * thing to make callers pay for, and an origin that has to reach a second
 * service before it can answer "am I up" answers a different question.
 *
 * The cost of that choice is stated in the headers' own terms: the budget is
 * per serving instance, so a client spread across instances gets at least this
 * much, which is what an agent reading `RateLimit` needs to know. It is a
 * self-throttling signal and a backstop against a runaway loop, not a boundary.
 */

export interface RateLimitPolicy {
  /** Quoted in the `RateLimit-Policy` header, so it names the budget. */
  name: string
  limit: number
  windowSeconds: number
}

/**
 * Two requests a second, sustained, from one client to one endpoint. Far above
 * anything a crawler, a monitor, or an agent reading discovery documents does,
 * and low enough that a loop with no backoff is stopped rather than served.
 */
export const PUBLIC_API_RATE_LIMIT: RateLimitPolicy = {
  name: "public",
  limit: 120,
  windowSeconds: 60,
}

/**
 * The MCP endpoint's own budget, five times the public one.
 *
 * A single agent session opens with `initialize`, `tools/list`, and then a
 * call per tool it decides to use, and a client bucketed by address may be a
 * whole team behind one egress. The number is set where a runaway loop is
 * still stopped and ordinary use never comes close, because a refusal here
 * costs a user their session rather than a scraper its next page.
 */
export const MCP_RATE_LIMIT: RateLimitPolicy = {
  name: "mcp",
  limit: 600,
  windowSeconds: 60,
}

export interface RateLimitDecision {
  allowed: boolean
  limit: number
  /** Requests left in the current window, never negative. */
  remaining: number
  /** Seconds until the window this request was counted in rolls over. */
  resetSeconds: number
  policy: RateLimitPolicy
}

interface WindowCounter {
  /** Index of the fixed window, in whole windows since the epoch. */
  window: number
  count: number
  previous: number
}

/**
 * How many keys one instance tracks before the oldest are dropped.
 *
 * A counter is two numbers, so this is small in memory and large in clients: an
 * instance seeing more distinct addresses than this inside one window is being
 * crawled from a pool, and dropping the coldest keys degrades to "no limit for
 * that client" rather than to unbounded memory.
 */
const MAX_TRACKED_KEYS = 20_000

const counters = new Map<string, WindowCounter>()

/**
 * Counts one request and reports what the client has left.
 *
 * A sliding window rather than a fixed one: a fixed window lets a client spend
 * a full budget at the end of one window and another at the start of the next,
 * which is twice the published rate at the moment the rate matters. The
 * previous window's count is weighted by how much of it still overlaps the
 * trailing window, the same approximation Upstash's `slidingWindow` uses, and
 * it needs two numbers per key instead of a list of timestamps.
 *
 * `now` and `store` are parameters so the behaviour is testable without waiting
 * for real time to pass; callers in the app pass neither.
 */
export function claimApiRequest(
  key: string,
  {
    policy = PUBLIC_API_RATE_LIMIT,
    now = Date.now(),
    store = counters,
  }: { policy?: RateLimitPolicy; now?: number; store?: Map<string, WindowCounter> } = {},
): RateLimitDecision {
  const windowMs = policy.windowSeconds * 1000
  const window = Math.floor(now / windowMs)
  const elapsed = (now % windowMs) / windowMs
  const resetSeconds = Math.max(1, Math.ceil((windowMs - (now % windowMs)) / 1000))

  const tracked = store.get(key)
  const counter: WindowCounter =
    !tracked || tracked.window < window - 1
      ? { window, count: 0, previous: 0 }
      : tracked.window === window
        ? tracked
        : { window, count: 0, previous: tracked.count }

  const weighted = counter.previous * (1 - elapsed) + counter.count
  const allowed = weighted < policy.limit

  // A refused request is not counted: charging for the refusal would extend the
  // penalty every time a client retried, which is the opposite of what
  // `Retry-After` tells it to do.
  if (allowed) counter.count += 1

  // Re-inserting moves the key to the end of the map's insertion order, which
  // is what makes the eviction below drop the least recently seen client.
  store.delete(key)
  store.set(key, counter)

  if (store.size > MAX_TRACKED_KEYS) {
    for (const stale of [...store.keys()].slice(0, store.size - MAX_TRACKED_KEYS)) {
      store.delete(stale)
    }
  }

  return {
    allowed,
    limit: policy.limit,
    remaining: Math.max(0, Math.floor(policy.limit - (counter.previous * (1 - elapsed) + counter.count))),
    resetSeconds,
    policy,
  }
}

/**
 * The response headers that publish the decision.
 *
 * Both spellings are sent on purpose. `RateLimit` and `RateLimit-Policy` are
 * the structured fields of the IETF draft the RFC-track work settled on, and
 * the `RateLimit-Limit` / `-Remaining` / `-Reset` triplet is the older shape
 * most existing clients and SDKs already parse. They carry the same numbers.
 */
export function rateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  const { policy } = decision

  return {
    "RateLimit-Policy": `"${policy.name}";q=${policy.limit};w=${policy.windowSeconds}`,
    RateLimit: `"${policy.name}";r=${decision.remaining};t=${decision.resetSeconds}`,
    "RateLimit-Limit": String(decision.limit),
    "RateLimit-Remaining": String(decision.remaining),
    "RateLimit-Reset": String(decision.resetSeconds),
  }
}
