import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  EMAIL_CAPTURE_MAX_LENGTH,
  EMAIL_CAPTURE_NOTICE_FOOTNOTE,
  EMAIL_CAPTURE_NOTICE_TEXT,
  EMAIL_CAPTURE_PROMISE,
  UNKNOWN_EMAIL_CAPTURE_SOURCE,
  isHoneypotFilled,
  normalizeCaptureSource,
  normalizeCapturedEmail,
} = await loadTsModule(new URL("../lib/email/email-capture.ts", import.meta.url))

const {
  EMAIL_CAPTURE_RATE_LIMIT_MAX,
  EMAIL_CAPTURE_RATE_LIMIT_PREFIX,
  EMAIL_CAPTURE_RATE_LIMIT_WINDOW,
  MISSING_CAPTURE_CREDENTIALS_WARNING,
  claimCaptureBudget,
} = await loadTsModule(new URL("../lib/email/email-capture-budget.ts", import.meta.url))

const cardSource = await readFile(
  new URL("../components/email-capture-card.tsx", import.meta.url),
  "utf8",
)
const actionSource = await readFile(
  new URL("../app/actions/email-capture.ts", import.meta.url),
  "utf8",
)
const rateLimitSource = await readFile(
  new URL("../lib/email/email-capture-rate-limit.ts", import.meta.url),
  "utf8",
)
const budgetSource = await readFile(
  new URL("../lib/email/email-capture-budget.ts", import.meta.url),
  "utf8",
)

/** The bucket key a client address is counted under, in the tests' spelling. */
const hashAddress = (ipAddress) => `hash(${ipAddress})`

/**
 * A limiter with the same budget as the real one, counting in memory. Standing
 * in for Upstash keeps the claim under test rather than the network under it.
 */
function countingLimiter(max = EMAIL_CAPTURE_RATE_LIMIT_MAX) {
  const spent = new Map()
  const asked = []

  return {
    asked,
    async limit(identifier) {
      asked.push(identifier)
      const used = spent.get(identifier) ?? 0
      spent.set(identifier, used + 1)

      return { success: used < max }
    },
  }
}

test("trims and lowercases a submitted address", () => {
  assert.equal(normalizeCapturedEmail("  Person@Example.COM  "), "person@example.com")
})

test("rejects input that cannot be an address", () => {
  for (const value of [
    "",
    "   ",
    "person",
    "person@example",
    "person@@example.com",
    "person example@test.com",
    "person@exa mple.com",
    "@example.com",
    "person@.com",
    null,
    undefined,
    42,
  ]) {
    assert.equal(normalizeCapturedEmail(value), null, `expected ${String(value)} to be rejected`)
  }
})

test("rejects an address longer than the SMTP limit", () => {
  const domain = "@example.com"
  const local = "a".repeat(EMAIL_CAPTURE_MAX_LENGTH - domain.length)

  assert.equal(normalizeCapturedEmail(`${local}${domain}`), `${local}${domain}`)
  assert.equal(normalizeCapturedEmail(`a${local}${domain}`), null)
})

test("keeps the capture surfaces the pages actually render", () => {
  assert.equal(normalizeCaptureSource("landing"), "landing")
  assert.equal(
    normalizeCaptureSource("guide_shared-mcp-skill-library-for-teams"),
    "guide_shared-mcp-skill-library-for-teams",
  )
  assert.equal(normalizeCaptureSource("alternatives_github_repo"), "alternatives_github_repo")
  assert.equal(normalizeCaptureSource("  LANDING  "), "landing")
})

test("folds an unrecognized or crafted source into a single bucket", () => {
  for (const value of [
    "",
    "library",
    "guide_",
    "guide_with spaces",
    "alternatives_<script>",
    `guide_${"a".repeat(81)}`,
    null,
    undefined,
    { source: "landing" },
  ]) {
    assert.equal(normalizeCaptureSource(value), UNKNOWN_EMAIL_CAPTURE_SOURCE)
  }
})

test("treats a filled honeypot as a bot and an empty one as a person", () => {
  assert.equal(isHoneypotFilled("Acme"), true)
  assert.equal(isHoneypotFilled(""), false)
  assert.equal(isHoneypotFilled("   "), false)
  assert.equal(isHoneypotFilled(null), false)
  assert.equal(isHoneypotFilled(undefined), false)
})

test("records the notice the card renders rather than a second copy of it", () => {
  assert.equal(
    EMAIL_CAPTURE_NOTICE_TEXT,
    `${EMAIL_CAPTURE_PROMISE} ${EMAIL_CAPTURE_NOTICE_FOOTNOTE}`,
  )
  assert.match(cardSource, /\{EMAIL_CAPTURE_PROMISE\}/)
  assert.match(cardSource, /\{EMAIL_CAPTURE_NOTICE_FOOTNOTE\}/)

  for (const line of [EMAIL_CAPTURE_PROMISE, EMAIL_CAPTURE_NOTICE_FOOTNOTE]) {
    assert.ok(
      !cardSource.includes(line),
      "the card must render the shared constant, not a literal that can drift",
    )
  }
})

test("writes the consent event with the address, and only for a new one", () => {
  assert.match(actionSource, /db\.transaction\(/)
  assert.match(actionSource, /\.returning\(/)
  assert.match(actionSource, /if \(inserted\.length === 0\) return/)
  assert.match(actionSource, /insert\(emailConsentEvent\)/)
  assert.match(actionSource, /userId: null/)
  assert.match(actionSource, /const emailHash = hashEmailAddress\(email\)/)
  assert.match(actionSource, /^\s+emailHash,$/m)
  assert.match(actionSource, /noticeVersion: EMAIL_CAPTURE_NOTICE_VERSION/)
  assert.match(actionSource, /noticeText: EMAIL_CAPTURE_NOTICE_TEXT/)
})

test("counts five submissions an hour, under one readable key prefix", () => {
  assert.equal(EMAIL_CAPTURE_RATE_LIMIT_MAX, 5)
  assert.equal(EMAIL_CAPTURE_RATE_LIMIT_WINDOW, "1 h")
  assert.equal(EMAIL_CAPTURE_RATE_LIMIT_PREFIX, "email-capture")
  // The limiter is built from the constants rather than from a second copy of
  // them, so the budget the tests describe is the budget Redis enforces.
  assert.match(
    rateLimitSource,
    /Ratelimit\.slidingWindow\(\s*EMAIL_CAPTURE_RATE_LIMIT_MAX,\s*EMAIL_CAPTURE_RATE_LIMIT_WINDOW,\s*\)/,
  )
  assert.match(rateLimitSource, /prefix: EMAIL_CAPTURE_RATE_LIMIT_PREFIX/)
})

test("spends the budget and refuses the submission after it", async () => {
  const limiter = countingLimiter()
  const claim = (ipAddress) => claimCaptureBudget({ hashAddress, ipAddress, limiter })

  for (let attempt = 0; attempt < EMAIL_CAPTURE_RATE_LIMIT_MAX; attempt += 1) {
    assert.equal(await claim("203.0.113.7"), true)
  }

  assert.equal(await claim("203.0.113.7"), false)
  // One client out of budget says nothing about the next one.
  assert.equal(await claim("198.51.100.9"), true)
})

test("counts a client address only as a salted hash", async () => {
  const limiter = countingLimiter()

  await claimCaptureBudget({ hashAddress, ipAddress: "203.0.113.7", limiter })
  await claimCaptureBudget({ hashAddress, ipAddress: "2001:db8::1", limiter })

  // The identifier reaches someone else's database, so it is the hash and
  // never the address.
  assert.deepEqual(limiter.asked, ["hash(203.0.113.7)", "hash(2001:db8::1)"])
  // And it is the same hash the counter in the database used.
  assert.match(rateLimitSource, /hashAddress: hashCaptureIpAddress/)
})

test("takes the client address from the platform, and reads no header itself", () => {
  // The proxy in front of the app calculates the client address and overwrites
  // the forwarding headers with it, so `ipAddress` is asked for the answer
  // rather than a header being pulled out here and parsed into one of our own.
  assert.match(rateLimitSource, /import \{ ipAddress \} from "@vercel\/functions"/)
  assert.match(rateLimitSource, /return ipAddress\(await headers\(\)\) \|\| null/)

  // Not one header is read by name any more, and the parser that used to
  // decide which spellings were the same address is gone with them: whatever
  // the platform wrote is what gets hashed.
  assert.ok(
    !/\.get\(/.test(rateLimitSource),
    "the wiring must not read a header of its own",
  )
  for (const gone of ["email-capture-ip", "node:net", "isIP", "invalid-client-address"]) {
    assert.ok(
      !rateLimitSource.includes(gone),
      `the wiring must not reach for ${gone}`,
    )
  }
})

test("leaves a request with no client address unbucketed", async () => {
  const limiter = countingLimiter()

  assert.equal(await claimCaptureBudget({ hashAddress, ipAddress: null, limiter }), true)
  // Nothing to bucket it under, so nothing is spent and nothing is asked.
  assert.deepEqual(limiter.asked, [])
})

test("lets a submission through when the environment has no counter", async () => {
  let hashed = 0
  const allowed = await claimCaptureBudget({
    hashAddress: (ipAddress) => {
      hashed += 1

      return hashAddress(ipAddress)
    },
    ipAddress: "203.0.113.7",
    limiter: null,
  })

  assert.equal(allowed, true)
  assert.equal(hashed, 0)
  // Missing credentials are a real gap, so the wiring says so, and the memo
  // makes it one line per process rather than one per visitor.
  assert.match(rateLimitSource, /console\.warn\(MISSING_CAPTURE_CREDENTIALS_WARNING\)/)
  assert.match(
    rateLimitSource,
    /if \(captureRateLimiter !== undefined\) return captureRateLimiter/,
  )
})

test("names both credential pairs in the warning about the missing counter", () => {
  // Whoever reads that line is either on Vercel, where the integration writes
  // the KV names, or self-hosting an Upstash database under the canonical
  // ones, and the warning has to be actionable in both places.
  for (const name of [
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ]) {
    assert.ok(
      MISSING_CAPTURE_CREDENTIALS_WARNING.includes(name),
      `the warning must name ${name}`,
    )
  }
})

test("never counts with the read-only token the integration also writes", () => {
  // A claim increments a counter, and that is a write, so the third variable
  // the Vercel integration writes is named in neither half of the limiter.
  // `Redis.fromEnv()` cannot reach for it either: it reads the token under
  // `UPSTASH_REDIS_REST_TOKEN` and `KV_REST_API_TOKEN`, and nothing else.
  assert.ok(!budgetSource.includes("READ_ONLY"))
  assert.ok(!rateLimitSource.includes("READ_ONLY"))
})

test("asks the SDK for the credentials, and only after deciding they are there", () => {
  // `Redis.fromEnv()` already reads both spellings, so the wiring does not
  // resolve them a second time.
  assert.match(rateLimitSource, /redis: Redis\.fromEnv\(\)/)
  assert.ok(!rateLimitSource.includes("new Redis("))

  // What it does keep is the presence check, because `fromEnv` does not throw
  // on a missing variable: it warns in its own words and builds a client that
  // fails on the first call, and the fail-open has to be decided before that.
  for (const name of [
    "UPSTASH_REDIS_REST_URL",
    "KV_REST_API_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "KV_REST_API_TOKEN",
  ]) {
    assert.ok(
      rateLimitSource.includes(`process.env.${name}`),
      `the presence check must read ${name}, as fromEnv does`,
    )
  }

  const warnIndex = rateLimitSource.indexOf("console.warn(MISSING_CAPTURE_CREDENTIALS_WARNING)")
  const buildIndex = rateLimitSource.indexOf("redis: Redis.fromEnv()")

  assert.ok(warnIndex > -1 && buildIndex > -1)
  assert.ok(warnIndex < buildIndex, "the missing credential path returns before the client")
})

test("lets a submission through when the counter cannot be reached", async () => {
  const logged = []
  const originalError = console.error
  console.error = (...entry) => logged.push(entry)

  try {
    const allowed = await claimCaptureBudget({
      hashAddress,
      ipAddress: "203.0.113.7",
      limiter: {
        async limit() {
          throw new Error("fetch failed")
        },
      },
    })

    assert.equal(allowed, true)
  } finally {
    console.error = originalError
  }

  // Redis being unreachable is an outage of the counter and not of the form,
  // and the address never reaches the log that records it.
  assert.equal(logged.length, 1)
  assert.deepEqual(logged[0][1], { errorName: "Error" })
  assert.ok(!JSON.stringify(logged).includes("203.0.113.7"))
})

test("keeps the counter in Upstash, and out of the database", () => {
  for (const gone of ["@/lib/db", "emailCaptureAttempt", "pg_advisory_xact_lock", "db.transaction("]) {
    assert.ok(
      !rateLimitSource.includes(gone),
      `the rate limit must not reach for ${gone}`,
    )
  }

  // Built once per process: the instance carries the cache that refuses a
  // client already over budget without paying for a round trip, and a fresh
  // one per invocation would throw that away.
  assert.match(rateLimitSource, /ephemeralCache: new Map\(\)/)
  assert.match(rateLimitSource, /timeout: CAPTURE_RATE_LIMIT_TIMEOUT_MS/)
})

test("spends the budget before writing, and answers the refusal like a success", () => {
  const claimIndex = actionSource.indexOf("claimEmailCaptureAttempt()")
  const insertIndex = actionSource.indexOf("insert(emailSubscriber)")

  assert.ok(claimIndex > -1 && insertIndex > -1)
  assert.ok(claimIndex < insertIndex, "the budget is spent before the insert")
  assert.match(actionSource, /if \(!\(await claimEmailCaptureAttempt\(\)\)\) \{/)
  // The refusal is indistinguishable to the caller, so the log is the only
  // place a dropped subscription can be counted.
  assert.match(
    actionSource,
    /console\.warn\("Email capture refused by the rate limit", \{ source \}\)/,
  )
})

test("counts the capture on the server, only when a row was created", () => {
  assert.match(actionSource, /const stored = await db\.transaction\(/)
  assert.match(
    actionSource,
    /if \(stored\) \{\s*capturePostHogEvent\(\{\s*distinctId: emailHash,\s*event: "email_capture_submitted",/,
  )
  // The card answers success on every path, so it cannot tell a stored address
  // from a duplicate, a bot, or a refused post, and it counts nothing.
  assert.ok(!cardSource.includes("captureAnalyticsEvent"))
  assert.ok(!cardSource.includes("@/lib/analytics-client"))
  assert.ok(!/captureAnalyticsEvent\(|posthog\.capture\(/.test(cardSource))
})
