import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

const source = await readFile(new URL("../lib/safe-return-to.ts", import.meta.url), "utf8")
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const { safeReturnTo } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
)

test("allows the protected destinations used by auth", () => {
  assert.equal(safeReturnTo("/library"), "/library")
  assert.equal(safeReturnTo("/connect"), "/connect")
  assert.equal(safeReturnTo("/invite/invite_123"), "/invite/invite_123")
})

// The proxy hands every protected page its own URL, so any same-origin path
// comes back, query string included.
test("allows any same-origin page with its query string", () => {
  assert.equal(safeReturnTo("/settings/members?tab=pending"), "/settings/members?tab=pending")
  assert.equal(safeReturnTo("/discover?x=1"), "/discover?x=1")
  assert.equal(safeReturnTo("/library/skill_123"), "/library/skill_123")
  assert.equal(safeReturnTo("/connect?next=https://example.com"), "/connect?next=https://example.com")
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

test("rejects external and protocol-relative destinations", () => {
  assert.equal(safeReturnTo("https://example.com"), "/library")
  assert.equal(safeReturnTo("https://evil.com/settings/members"), "/library")
  assert.equal(safeReturnTo("//example.com"), "/library")
  assert.equal(safeReturnTo("//evil.com/library"), "/library")
  assert.equal(safeReturnTo("/\\evil.com"), "/library")
  assert.equal(safeReturnTo("javascript:alert(1)"), "/library")
  assert.equal(safeReturnTo("library"), "/library")
})

// Dot segments normalise away, and what is left can start with "//": a
// protocol-relative URL the proxy would resolve to another host.
test("rejects dot segments that collapse into a protocol-relative path", () => {
  assert.equal(safeReturnTo("/library/..//evil.com"), "/library")
  assert.equal(safeReturnTo("/a/..//evil.com/path"), "/library")
  assert.equal(safeReturnTo("/a/.././/evil.com"), "/library")
  assert.equal(safeReturnTo("/%2e%2e//evil.com"), "/library")
  assert.equal(safeReturnTo("/library/%2e%2e//evil.com?x=1"), "/library")
})

test("rejects control characters and oversized values", () => {
  assert.equal(safeReturnTo("/library\n//evil.com"), "/library")
  assert.equal(safeReturnTo("/library\t"), "/library")
  assert.equal(safeReturnTo(`/library?q=${"a".repeat(2048)}`), "/library")
})

// Sign-in pages would loop back into sign-in, and `/api/*` acts on the
// session (OAuth authorize, sign-out) instead of showing a page.
test("rejects auth pages and API routes, even after dot segments", () => {
  assert.equal(safeReturnTo("/sign-in"), "/library")
  assert.equal(safeReturnTo("/sign-up?returnTo=/library"), "/library")
  assert.equal(safeReturnTo("/api/auth/oauth2/authorize?client_id=x"), "/library")
  assert.equal(safeReturnTo("/library/../api/auth/sign-out"), "/library")
  assert.equal(safeReturnTo("/sign-instructions"), "/sign-instructions")
})

test("uses the caller's fallback", () => {
  assert.equal(safeReturnTo("//evil.com", "/"), "/")
})
