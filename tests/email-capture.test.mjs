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

const cardSource = await readFile(
  new URL("../components/email-capture-card.tsx", import.meta.url),
  "utf8",
)
const actionSource = await readFile(
  new URL("../app/actions/email-capture.ts", import.meta.url),
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
  assert.match(actionSource, /emailHash: hashEmailAddress\(email\)/)
  assert.match(actionSource, /noticeVersion: EMAIL_CAPTURE_NOTICE_VERSION/)
  assert.match(actionSource, /noticeText: EMAIL_CAPTURE_NOTICE_TEXT/)
})
