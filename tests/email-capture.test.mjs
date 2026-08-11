import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  EMAIL_CAPTURE_MAX_LENGTH,
  UNKNOWN_EMAIL_CAPTURE_SOURCE,
  isHoneypotFilled,
  normalizeCaptureSource,
  normalizeCapturedEmail,
} = await loadTsModule(new URL("../lib/email/email-capture.ts", import.meta.url))

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
