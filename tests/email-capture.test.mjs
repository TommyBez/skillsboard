import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  EMAIL_CAPTURE_ATTEMPT_RETENTION_MS,
  EMAIL_CAPTURE_MAX_LENGTH,
  EMAIL_CAPTURE_NOTICE_FOOTNOTE,
  EMAIL_CAPTURE_NOTICE_TEXT,
  EMAIL_CAPTURE_PROMISE,
  EMAIL_CAPTURE_PRUNE_SAMPLE_RATE,
  EMAIL_CAPTURE_RATE_LIMIT_MAX,
  EMAIL_CAPTURE_RATE_LIMIT_WINDOW_MS,
  UNKNOWN_EMAIL_CAPTURE_SOURCE,
  captureAttemptRetentionCutoff,
  captureRateLimitWindowStart,
  isHoneypotFilled,
  isOverCaptureRateLimit,
  normalizeCaptureSource,
  normalizeCapturedEmail,
  shouldPruneCaptureAttempts,
} = await loadTsModule(new URL("../lib/email/email-capture.ts", import.meta.url))

const {
  CAPTURE_IP_MAX_LENGTH,
  INVALID_CAPTURE_IP_BUCKET,
  normalizeCaptureIpAddress,
  resolveCaptureIpAddress,
} = await loadTsModule(new URL("../lib/email/email-capture-ip.ts", import.meta.url))

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

test("reads the client address out of a forwarded header", () => {
  assert.equal(normalizeCaptureIpAddress("203.0.113.7"), "203.0.113.7")
  assert.equal(normalizeCaptureIpAddress(" 203.0.113.7 , 70.41.3.18 "), "203.0.113.7")
  assert.equal(normalizeCaptureIpAddress("203.0.113.7:41234"), "203.0.113.7")
  assert.equal(normalizeCaptureIpAddress("2001:DB8::8A2E:370:7334"), "2001:db8::8a2e:370:7334")
  assert.equal(normalizeCaptureIpAddress("[2001:db8::1]:41234"), "2001:db8::1")
})

test("gives a mapped IPv4 client the bucket its plain address would get", () => {
  assert.equal(normalizeCaptureIpAddress("::ffff:203.0.113.7"), "203.0.113.7")
  assert.equal(normalizeCaptureIpAddress("::FFFF:203.0.113.7"), "203.0.113.7")
  assert.equal(normalizeCaptureIpAddress("[::ffff:203.0.113.7]:41234"), "203.0.113.7")
  assert.equal(normalizeCaptureIpAddress("::ffff:203.0.113.999"), null)
})

test("gives the deprecated IPv4 compatible form one bucket in every spelling", () => {
  // `::203.0.113.7` and `::cb00:7107` are the same address written two ways, so
  // reading the dotted one as the plain address it embeds handed the same
  // client a second budget it could alternate into.
  const canonical = normalizeCaptureIpAddress("::203.0.113.7")

  assert.equal(canonical, "::cb00:7107")
  assert.equal(normalizeCaptureIpAddress("::cb00:7107"), canonical)
  assert.equal(normalizeCaptureIpAddress("0:0:0:0:0:0:203.0.113.7"), canonical)
  // RFC 4291 retired this prefix and RFC 5952 keeps the dotted quad for the
  // mapped one, so it stays IPv6 rather than landing in an IPv4 client's bucket.
  assert.notEqual(canonical, normalizeCaptureIpAddress("203.0.113.7"))
})

test("refuses trailing data after a bracketed literal", () => {
  assert.equal(normalizeCaptureIpAddress("[2001:db8::1]"), "2001:db8::1")
  assert.equal(normalizeCaptureIpAddress("[2001:db8::1]:41234"), "2001:db8::1")

  // A bracket followed by anything but a port was not written by the proxy in
  // front of the app, so it shares the unreadable bucket rather than holding a
  // real client's private one.
  for (const value of [
    "[2001:db8::1]junk",
    "[2001:db8::1]:",
    "[2001:db8::1]:41234junk",
    "[2001:db8::1]]",
    "[203.0.113.7]junk",
  ]) {
    assert.equal(
      normalizeCaptureIpAddress(value),
      null,
      `expected ${value} to be unreadable`,
    )
    assert.equal(resolveCaptureIpAddress(value), INVALID_CAPTURE_IP_BUCKET)
  }
})

test("treats an address it cannot read as no address at all", () => {
  for (const value of [
    "",
    "   ",
    ",",
    "not-an-address",
    "203.0.113.999",
    "203.0.113",
    "203.0.113.7.9",
    "[2001:db8::1",
    "g001:db8::1",
    "f".repeat(CAPTURE_IP_MAX_LENGTH + 1),
    null,
    undefined,
    42,
  ]) {
    assert.equal(
      normalizeCaptureIpAddress(value),
      null,
      `expected ${String(value)} to be unreadable`,
    )
  }
})

test("rejects a spelling that only looks like an address", () => {
  // Every accepted value is a bucket key of its own, so a pattern loose enough
  // to take these hands out a fresh budget per string.
  for (const value of [
    ":::",
    "::::::::",
    "a:b",
    "cafe:",
    ":cafe",
    "1:2:3:4:5:6:7:8:9",
    "2001:db8:::1",
    "001.002.003.004",
    "01.2.3.4",
    "::ffff:001.002.003.004",
    "fe80::1%eth0",
  ]) {
    assert.equal(
      normalizeCaptureIpAddress(value),
      null,
      `expected ${value} to be rejected`,
    )
  }
})

test("gives one client one bucket across the spellings of its address", () => {
  const equivalents = [
    ["2001:db8::1", "2001:0db8::1", "2001:db8:0:0:0:0:0:1", "2001:0DB8:0000:0000:0000:0000:0000:0001"],
    ["::1", "0:0:0:0:0:0:0:1", "0000:0000:0000:0000:0000:0000:0000:0001", "::0.0.0.1"],
    ["203.0.113.7", "::ffff:203.0.113.7", "::ffff:cb00:7107", "0:0:0:0:0:ffff:203.0.113.7"],
    ["::", "0:0:0:0:0:0:0:0"],
  ]

  for (const [canonical, ...spellings] of equivalents) {
    const expected = normalizeCaptureIpAddress(canonical)
    assert.ok(expected, `expected ${canonical} to be readable`)

    for (const spelling of spellings) {
      assert.equal(
        normalizeCaptureIpAddress(spelling),
        expected,
        `expected ${spelling} to share the bucket of ${canonical}`,
      )
    }
  }
})

test("folds every unreadable header into one shared bucket", () => {
  const unreadable = [":::", "not-an-address", "203.0.113.999", "<script>", "a".repeat(40)]

  for (const value of unreadable) {
    assert.equal(
      resolveCaptureIpAddress(value),
      INVALID_CAPTURE_IP_BUCKET,
      `expected ${value} to share the unreadable bucket`,
    )
  }

  assert.equal(new Set(unreadable.map((value) => resolveCaptureIpAddress(value))).size, 1)
  // The shared bucket is not a spelling of any address, so it cannot be reached
  // by a client and taken from a real budget.
  assert.equal(normalizeCaptureIpAddress(INVALID_CAPTURE_IP_BUCKET), null)
})

test("leaves a request with no address header unbucketed", () => {
  assert.equal(resolveCaptureIpAddress(null, null), null)
  assert.equal(resolveCaptureIpAddress("", "   "), null)
  assert.equal(resolveCaptureIpAddress(undefined, ""), null)
})

test("reads the headers in order, and prefers an address to garbage", () => {
  assert.equal(resolveCaptureIpAddress("203.0.113.7", "70.41.3.18"), "203.0.113.7")
  assert.equal(resolveCaptureIpAddress(null, "70.41.3.18"), "70.41.3.18")
  assert.equal(resolveCaptureIpAddress(":::", "70.41.3.18"), "70.41.3.18")
  assert.equal(resolveCaptureIpAddress(":::", ":::"), INVALID_CAPTURE_IP_BUCKET)
})

test("buckets a submission into the fixed window it arrived in", () => {
  const windowMs = EMAIL_CAPTURE_RATE_LIMIT_WINDOW_MS
  const start = captureRateLimitWindowStart(new Date("2026-08-11T13:37:42.500Z"))

  assert.equal(start.toISOString(), "2026-08-11T13:00:00.000Z")
  assert.equal(start.getTime() % windowMs, 0)
  assert.equal(
    captureRateLimitWindowStart(new Date(start.getTime() + windowMs - 1)).getTime(),
    start.getTime(),
  )
  assert.equal(
    captureRateLimitWindowStart(new Date(start.getTime() + windowMs)).getTime(),
    start.getTime() + windowMs,
  )
})

test("spends the budget and refuses the submission after it", () => {
  for (let attempts = 0; attempts < EMAIL_CAPTURE_RATE_LIMIT_MAX; attempts += 1) {
    assert.equal(isOverCaptureRateLimit(attempts), false)
  }

  assert.equal(isOverCaptureRateLimit(EMAIL_CAPTURE_RATE_LIMIT_MAX), true)
  assert.equal(isOverCaptureRateLimit(EMAIL_CAPTURE_RATE_LIMIT_MAX + 1), true)
})

test("keeps attempt rows for a day, well past any live window", () => {
  const now = new Date("2026-08-11T13:37:42.500Z")
  const cutoff = captureAttemptRetentionCutoff(now)

  assert.equal(now.getTime() - cutoff.getTime(), EMAIL_CAPTURE_ATTEMPT_RETENTION_MS)
  assert.ok(
    EMAIL_CAPTURE_ATTEMPT_RETENTION_MS > EMAIL_CAPTURE_RATE_LIMIT_WINDOW_MS,
    "pruning must never reach a window that is still being counted",
  )
  assert.ok(cutoff < captureRateLimitWindowStart(now))
})

test("prunes on a small share of submissions rather than all of them", () => {
  assert.ok(EMAIL_CAPTURE_PRUNE_SAMPLE_RATE > 0 && EMAIL_CAPTURE_PRUNE_SAMPLE_RATE < 1)
  assert.equal(shouldPruneCaptureAttempts(0), true)
  assert.equal(shouldPruneCaptureAttempts(EMAIL_CAPTURE_PRUNE_SAMPLE_RATE), false)
  assert.equal(shouldPruneCaptureAttempts(0.99), false)
})

test("counts a client address only as a salted hash", () => {
  assert.match(rateLimitSource, /hashCaptureIpAddress\(ipAddress\)/)
  assert.match(rateLimitSource, /x-forwarded-for/)
  assert.match(rateLimitSource, /x-real-ip/)
  // A request with no readable address is allowed rather than refused.
  assert.match(rateLimitSource, /if \(!ipHash\) return true/)
  assert.ok(
    !/values\(\{\s*ipAddress/.test(rateLimitSource),
    "the attempt row must never hold a client address",
  )
})

test("claims the budget atomically, behind a lock on the bucket", () => {
  const transactionIndex = rateLimitSource.indexOf("db.transaction(")
  // From the transaction on: the prose above the function names the lock too.
  const lockIndex = rateLimitSource.indexOf("pg_advisory_xact_lock", transactionIndex)
  const countIndex = rateLimitSource.indexOf("select({ attempts: count() })")
  const insertIndex = rateLimitSource.indexOf("insert(emailCaptureAttempt)")
  const pruneIndex = rateLimitSource.indexOf("await pruneExpiredCaptureAttempts(now)")

  assert.ok(transactionIndex > -1, "the claim is one transaction")
  assert.ok(transactionIndex < lockIndex, "the lock is taken inside the transaction")
  assert.ok(
    lockIndex < countIndex && countIndex < insertIndex && insertIndex < pruneIndex,
    "the lock is held across the count and the insert, and released before the prune",
  )
  // Keyed on the bucket, so two clients never queue behind each other, and
  // released by the commit rather than by a call on every path out.
  assert.match(
    rateLimitSource,
    /pg_advisory_xact_lock\(hashtextextended\(\$\{ipHash\}, 0\)\)/,
  )
  // Both statements run on the transaction handle. One of them on `db` would
  // sit outside the lock, and a burst could still count rows the others are
  // about to write.
  assert.ok(
    !/\bdb\s*\n?\s*\.(select|insert)\(/.test(rateLimitSource),
    "the count and the insert must not bypass the transaction",
  )
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
