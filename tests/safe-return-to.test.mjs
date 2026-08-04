import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./load-ts-module.mjs"

const { safeReturnTo } = await loadTsModule("../lib/safe-return-to.ts")

test("allows the exact protected destinations used by auth and email preferences", () => {
  assert.equal(safeReturnTo("/library"), "/library")
  assert.equal(safeReturnTo("/settings/email"), "/settings/email")
  assert.equal(safeReturnTo("/invite/invite_123"), "/invite/invite_123")
})

test("rejects lookalikes, query injection, and external destinations", () => {
  assert.equal(safeReturnTo("/settings/email/other"), "/library")
  assert.equal(safeReturnTo("/settings/email?next=https://example.com"), "/library")
  assert.equal(safeReturnTo("https://example.com"), "/library")
  assert.equal(safeReturnTo("//example.com"), "/library")
})
