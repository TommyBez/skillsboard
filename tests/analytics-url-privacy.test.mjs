import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { stripTypeScriptTypes } from "node:module"
import { test } from "node:test"

const source = await readFile(
  new URL("../lib/analytics-url-privacy.ts", import.meta.url),
  "utf8",
)
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const {
  initialPostHogRoutePrivacyState,
  isInstallableCollectionPathname,
  sanitizeAnalyticsUrl,
  transitionPostHogRoutePrivacy,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
)

test("recognizes only root installable collection bearer paths", () => {
  for (const pathname of [
    "/p/abc_DEF-123",
    "/p/abc_DEF-123/",
    "/P/abc_DEF-123/.well-known/agent-skills/index.json",
  ]) {
    assert.equal(isInstallableCollectionPathname(pathname), true, pathname)
  }

  for (const pathname of ["/p", "/p/", "/pricing", "/docs/p/abc_DEF-123"]) {
    assert.equal(isInstallableCollectionPathname(pathname), false, pathname)
  }
})

test("suspends before a normal-to-bearer navigation commits", () => {
  const pending = transitionPostHogRoutePrivacy(
    initialPostHogRoutePrivacyState("/collections"),
    {
      type: "navigation-start",
      currentPathname: "/collections",
      destinationPathname: "/p/bearer-id",
    },
  )
  assert.deepEqual(pending, { effect: "suspend", state: "pending-bearer" })
  assert.deepEqual(
    transitionPostHogRoutePrivacy(pending.state, {
      type: "navigation-commit",
      pathname: "/p/bearer-id",
    }),
    { effect: "none", state: "bearer" },
  )
})

test("resumes with one pageview only after bearer-to-normal commit", () => {
  const state = initialPostHogRoutePrivacyState("/p/bearer-id")
  assert.deepEqual(
    transitionPostHogRoutePrivacy(state, {
      type: "navigation-start",
      currentPathname: "/p/bearer-id",
      destinationPathname: "/",
    }),
    { effect: "none", state: "bearer" },
  )
  assert.deepEqual(
    transitionPostHogRoutePrivacy(state, {
      type: "navigation-commit",
      pathname: "/",
    }),
    { effect: "resume-with-pageview", state: "active" },
  )
})

test("restores analytics without a duplicate pageview after a superseded bearer navigation", () => {
  const pending = transitionPostHogRoutePrivacy("active", {
    type: "navigation-start",
    currentPathname: "/collections",
    destinationPathname: "/p/bearer-id",
  })
  assert.deepEqual(
    transitionPostHogRoutePrivacy(pending.state, {
      type: "navigation-start",
      currentPathname: "/collections",
      destinationPathname: "/library",
    }),
    { effect: "resume", state: "active" },
  )
})

test("redacts installable collection bearer identifiers from paths", () => {
  assert.equal(
    sanitizeAnalyticsUrl("/p/abc_DEF-123/.well-known/agent-skills/index.json"),
    "/p/[redacted]/.well-known/agent-skills/index.json",
  )
})

test("redacts installable collection identifiers from absolute URLs and referrers", () => {
  assert.equal(
    sanitizeAnalyticsUrl("https://skillsboard.ai/p/abc_DEF-123?secret=1&utm_source=test"),
    "https://skillsboard.ai/p/[redacted]?utm_source=test",
  )
})
