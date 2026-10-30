import assert from "node:assert/strict"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { destinationAfterOtp } = await import("../lib/destination-after-otp.ts")

test("sign-up is owed onboarding, not a team page", () => {
  assert.equal(destinationAfterOtp("/library", "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp("/connect", "sign-up"), "/onboarding")
  assert.equal(destinationAfterOtp("/start", "sign-up"), "/onboarding")
})

test("an invitation stays as it was", () => {
  assert.equal(destinationAfterOtp("/invite/invite_123", "sign-up"), "/invite/invite_123")
})

test("sign-in keeps the destination it asked for", () => {
  assert.equal(destinationAfterOtp("/start", "sign-in"), "/start")
  assert.equal(destinationAfterOtp("/connect", "sign-in"), "/connect")
  assert.equal(destinationAfterOtp("/library", "sign-in"), "/library")
})
