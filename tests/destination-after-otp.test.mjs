import assert from "node:assert/strict"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { destinationAfterOtp } = await import("../lib/destination-after-otp.ts")
const { safeReturnTo } = await import("../lib/safe-return-to.ts")

test("sign-up is owed onboarding, not a team page", () => {
  assert.equal(destinationAfterOtp("/library", "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp("/connect", "sign-up"), "/onboarding")
})

test("an invitation stays as it was", () => {
  assert.equal(destinationAfterOtp("/invite/invite_123", "sign-up"), "/invite/invite_123")
})

test("sign-in keeps the destination it asked for", () => {
  assert.equal(destinationAfterOtp("/connect", "sign-in"), "/connect")
  assert.equal(destinationAfterOtp("/library", "sign-in"), "/library")
})

// The auth form only ever receives a sanitized returnTo, and the removed
// first-run page sanitizes to the library.
test("a stale returnTo=/start ends on onboarding or the library", () => {
  assert.equal(destinationAfterOtp(safeReturnTo("/start"), "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp(safeReturnTo("/start"), "sign-in"), "/library")
})
