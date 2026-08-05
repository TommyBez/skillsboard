import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./load-ts-module.mjs"

const { safeReturnTo } = await loadTsModule("../lib/safe-return-to.ts")

test("allows the exact protected destinations used by auth and email preferences", () => {
  assert.equal(safeReturnTo("/library"), "/library")
  assert.equal(safeReturnTo("/settings/email"), "/settings/email")
  assert.equal(safeReturnTo("/invite/invite_123"), "/invite/invite_123")
})

// Every marketing CTA points at a bare `/sign-up` with no `returnTo`, so this
// is the value `AuthEntry` compares against before redirecting a signed-in
// visitor. If the fallback ever stops being "/library", those CTAs start
// showing the signup form to people who already have an account.
test("defaults to the library when no destination is supplied", () => {
  assert.equal(safeReturnTo(undefined), "/library")
  assert.equal(safeReturnTo(null), "/library")
  assert.equal(safeReturnTo(""), "/library")
})

test("rejects lookalikes, query injection, and external destinations", () => {
  assert.equal(safeReturnTo("/settings/email/other"), "/library")
  assert.equal(safeReturnTo("/settings/email?next=https://example.com"), "/library")
  assert.equal(safeReturnTo("https://example.com"), "/library")
  assert.equal(safeReturnTo("//example.com"), "/library")
})
