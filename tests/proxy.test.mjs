import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { proxy } = await import("../proxy.ts")
const { safeReturnTo } = await import("../lib/safe-return-to.ts")
const { NextRequest } = await import("next/server")

const ORIGIN = "https://app.test"
const SESSION_COOKIE = "better-auth.session_token=token.signature"

async function visit(pathAndQuery, { signedIn = false } = {}) {
  const headers = signedIn ? { cookie: SESSION_COOKIE } : {}
  return proxy(new NextRequest(`${ORIGIN}${pathAndQuery}`, { headers }))
}

function locationOf(response) {
  const location = response.headers.get("location")
  assert.ok(location, `expected a redirect, got ${response.status}`)
  return new URL(location)
}

/** What the sign-in page does with the `returnTo` the proxy handed it. */
function landingAfterSignIn(location) {
  return safeReturnTo(location.searchParams.get("returnTo") ?? undefined)
}

const protectedPages = [
  "/library",
  "/library/skill_123",
  "/library/skill_123?tab=files",
  "/connect",
  "/discover",
  "/discover?x=1",
  "/discover/anthropics/skills?q=pdf&page=2",
  "/settings/members",
  "/settings/members?tab=pending",
  "/settings/team?name=a%20b&next=%2Flibrary",
  "/onboarding",
]

for (const page of protectedPages) {
  test(`signed out, ${page} goes to sign-in and back to the same URL`, async () => {
    const response = await visit(page)
    assert.equal(response.status, 307)

    const location = locationOf(response)
    assert.equal(location.origin, ORIGIN)
    assert.equal(location.pathname, "/sign-in")
    assert.equal(location.searchParams.get("returnTo"), page)
    assert.equal(landingAfterSignIn(location), page)
  })
}

test("the returnTo is encoded into the Location header", async () => {
  const response = await visit("/discover?x=1")
  assert.equal(
    response.headers.get("location"),
    `${ORIGIN}/sign-in?returnTo=%2Fdiscover%3Fx%3D1`,
  )
})

test("repeated query keys survive the round trip in order", async () => {
  const location = locationOf(await visit("/discover?tag=a&tag=b&sort=new"))
  assert.equal(landingAfterSignIn(location), "/discover?tag=a&tag=b&sort=new")
})

test("the consent page still forwards its OAuth params instead of a returnTo", async () => {
  const location = locationOf(await visit("/consent?client_id=abc&response_type=code&scope=openid"))
  assert.equal(location.pathname, "/sign-in")
  assert.equal(location.searchParams.get("returnTo"), null)
  assert.equal(location.searchParams.get("client_id"), "abc")
  assert.equal(location.searchParams.get("response_type"), "code")
  assert.equal(location.searchParams.get("scope"), "openid")
})

test("a signed-in visitor reaches protected pages untouched", async () => {
  for (const page of protectedPages) {
    const response = await visit(page, { signedIn: true })
    assert.equal(response.headers.get("location"), null, page)
    assert.equal(response.headers.get("x-middleware-next"), "1", page)
  }
})

test("no hard-coded list decides which routes get a returnTo", async () => {
  const source = await readFile(new URL("../proxy.ts", import.meta.url), "utf8")
  assert.doesNotMatch(source, /searchParams\.set\("returnTo", pathname\)/)
  assert.match(source, /safeReturnTo\(`\$\{pathname\}\$\{search\}`/)
})

const hostileReturnTos = [
  "https://evil.com/library",
  "http://evil.com",
  "//evil.com",
  "//evil.com/settings/members",
  "/\\evil.com",
  "\\\\evil.com",
  "javascript:alert(1)",
  "/library\n//evil.com",
]

for (const returnTo of hostileReturnTos) {
  test(`sign-in falls back to the library for returnTo=${JSON.stringify(returnTo)}`, () => {
    assert.equal(safeReturnTo(returnTo), "/library")
  })

  test(`a signed-in visit to /sign-in?returnTo=${JSON.stringify(returnTo)} stays on this origin`, async () => {
    const response = await visit(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`, { signedIn: true })
    const location = locationOf(response)
    assert.equal(location.origin, ORIGIN)
    assert.equal(location.pathname, "/library")
  })
}
