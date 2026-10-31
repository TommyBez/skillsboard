import assert from "node:assert/strict"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { destinationAfterOtp } = await import("../lib/destination-after-otp.ts")
const { safeReturnTo } = await import("../lib/safe-return-to.ts")

test("sign-up is owed onboarding, not a team page", () => {
  assert.equal(destinationAfterOtp("/library", "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp("/connect", "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp("/settings/members?tab=pending", "sign-up"), "/onboarding")
})

test("an invitation stays as it was", () => {
  assert.equal(destinationAfterOtp("/invite/invite_123", "sign-up"), "/invite/invite_123")
})

test("sign-in keeps the destination it asked for", () => {
  assert.equal(destinationAfterOtp("/connect", "sign-in"), "/connect")
  assert.equal(destinationAfterOtp("/library", "sign-in"), "/library")
  assert.equal(destinationAfterOtp("/settings/members?tab=pending", "sign-in"), "/settings/members?tab=pending")
  assert.equal(destinationAfterOtp("/discover?x=1", "sign-in"), "/discover?x=1")
})

// The auth form only ever receives a sanitized returnTo. The removed first-run
// page is an ordinary same-origin path now, and next.config.ts sends it to the
// library permanently.
test("a stale returnTo=/start ends on onboarding or the redirect to the library", () => {
  assert.equal(destinationAfterOtp(safeReturnTo("/start"), "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp(safeReturnTo("/start"), "sign-in"), "/start")
})
