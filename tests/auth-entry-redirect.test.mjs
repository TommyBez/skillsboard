import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

/**
 * The other unit tests transpile one self-contained file. This module composes
 * `safe-return-to` and `oauth-continue`, and the point of the test is that the
 * composition matches what `AuthEntry` does — so the real dependencies are
 * loaded rather than stubbed. Resolve `@/…` specifiers to data URLs, depth
 * first, and hand Node the stitched graph.
 */
const loaded = new Map()

async function loadModule(repoPath) {
  const cached = loaded.get(repoPath)
  if (cached) return cached

  const source = await readFile(new URL(`../${repoPath}.ts`, import.meta.url), "utf8")
  const outputText = stripTypeScriptTypes(source, { mode: "transform" })

  let resolved = outputText
  for (const [, specifier] of outputText.matchAll(/from ["']@\/([^"']+)["']/g)) {
    const dependency = await loadModule(specifier)
    resolved = resolved.replaceAll(`"@/${specifier}"`, `"${dependency}"`)
    resolved = resolved.replaceAll(`'@/${specifier}'`, `"${dependency}"`)
  }

  const url = `data:text/javascript;base64,${Buffer.from(resolved).toString("base64")}`
  loaded.set(repoPath, url)
  return url
}

const { resolveSignedInAuthRedirect, buildSessionCheckedSignInPath, SESSION_CHECKED_PARAM } =
  await import(await loadModule("lib/auth-entry-redirect"))

const resolve = (query) => resolveSignedInAuthRedirect(new URLSearchParams(query))

test("claims the bare marketing CTA, which is what every landing button links to", () => {
  assert.equal(resolve(""), "/library")
  assert.equal(resolve("returnTo=/library"), "/library")
})

test("claims a returnTo the sanitizer would have discarded anyway", () => {
  // safeReturnTo collapses these to "/library", so the page would redirect
  // there too — the edge just gets there first.
  assert.equal(resolve("returnTo=https://example.com"), "/library")
  assert.equal(resolve("returnTo=//example.com"), "/library")
})

test("leaves the invitation hand-off to the page", () => {
  // app/invite/[invitationId] and the accept action both send unauthenticated
  // users to /sign-up?returnTo=/invite/…. A signed-in one is owed the
  // invitation, not their library.
  assert.equal(resolve("returnTo=/invite/invite_123"), null)
})

test("leaves the email-preferences hand-off to the page", () => {
  assert.equal(resolve("returnTo=/settings/email"), null)
})

test("leaves an OAuth authorize request to the page", () => {
  // Redirecting these would strand an MCP client mid-handshake.
  assert.equal(resolve("client_id=abc&response_type=code"), null)
  assert.equal(resolve("client_id=abc&response_type=code&returnTo=/library"), null)
})

test("ignores a partial OAuth query, which cannot resume anything", () => {
  assert.equal(resolve("client_id=abc"), "/library")
  assert.equal(resolve("response_type=code"), "/library")
})

test("ignores a repeated returnTo rather than trusting the first value", () => {
  // getAll returns an array, AuthEntry only honours a string, and both fall
  // back to "/library" — so the edge and the page still agree.
  assert.equal(resolve("returnTo=/invite/a&returnTo=/invite/b"), "/library")
})

test("ignores query keys AuthEntry itself ignores, marketing params included", () => {
  // AuthEntry reads exactly two things from the query — the OAuth keys and
  // returnTo — so for a signed-in visitor every one of these resolves to
  // "/library" there too. Matching that is the point: the edge and the page
  // must not disagree about where a request lands.
  //
  // Deliberate, not accidental. An allowlist of "recognised" keys would send
  // /sign-in?utm_source=newsletter to the page while AuthEntry redirects it
  // anyway — a divergence, and one that would skip the edge for most real
  // campaign traffic.
  assert.equal(resolve("foo=bar"), "/library")
  assert.equal(resolve("utm_source=newsletter&utm_medium=email"), "/library")
  assert.equal(resolve("gclid=abc123"), "/library")
  assert.equal(resolve("returnTo=/library&utm_campaign=launch"), "/library")
})

test("stands down once a real session check has already run", () => {
  // The loop this prevents: a present-but-invalid cookie passes the proxy,
  // /onboarding calls requireSession() with no returnTo and lands on a bare
  // /sign-in, the proxy bounces it to /library, /library fails the same check
  // and bounces back. The marker is what breaks it.
  assert.equal(resolve(`${SESSION_CHECKED_PARAM}=1`), null)
  assert.equal(resolve(`returnTo=/library&${SESSION_CHECKED_PARAM}=1`), null)
})

test("never bounces back a URL that requireSession itself produced", () => {
  // The invariant that makes /sign-in safe to claim at the edge, asserted end
  // to end rather than by inspection: whatever requireSession redirects to,
  // the proxy stands down on. Every returnTo it is called with in the app,
  // plus the bare case that /onboarding and the server actions hit.
  for (const returnTo of [undefined, "/library", "/settings/email", "/invite/invite_1"]) {
    const path = buildSessionCheckedSignInPath(returnTo)
    const { searchParams } = new URL(path, "https://skillsboard.sh")
    assert.equal(resolveSignedInAuthRedirect(searchParams), null, `looped on ${path}`)
  }
})

test("keeps returnTo intact so the page can still honour it", () => {
  assert.equal(
    buildSessionCheckedSignInPath("/settings/email"),
    `/sign-in?returnTo=%2Fsettings%2Femail&${SESSION_CHECKED_PARAM}=1`,
  )
  assert.equal(buildSessionCheckedSignInPath(), `/sign-in?${SESSION_CHECKED_PARAM}=1`)
})
