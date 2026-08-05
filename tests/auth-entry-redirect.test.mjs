import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import typescript from "typescript"

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
  const { outputText } = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.ES2022,
      target: typescript.ScriptTarget.ES2022,
    },
  })

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

const { resolveSignedInSignUpRedirect } = await import(
  await loadModule("lib/auth-entry-redirect")
)

const resolve = (query) => resolveSignedInSignUpRedirect(new URLSearchParams(query))

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
