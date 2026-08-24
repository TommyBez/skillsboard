import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

const source = await readFile(new URL("../lib/github-url.ts", import.meta.url), "utf8")
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const { parseGitHubUrl, readGitHubUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
)

test("canonicalises a repository URL", () => {
  assert.deepEqual(parseGitHubUrl("https://github.com/vercel-labs/skills"), {
    githubUrl: "https://github.com/vercel-labs/skills",
    repoOwner: "vercel-labs",
    repoName: "skills",
  })
})

test("keeps a deep skill link pointing at its repository", () => {
  assert.equal(
    parseGitHubUrl("https://github.com/vercel-labs/skills/tree/main/skills/next-cache").githubUrl,
    "https://github.com/vercel-labs/skills",
  )
})

test("drops a trailing .git suffix", () => {
  assert.equal(parseGitHubUrl("https://github.com/owner/repo.git").repoName, "repo")
})

test("rejects hosts that are not github.com", () => {
  assert.throws(() => parseGitHubUrl("https://gitlab.com/owner/repo"))
})

test("rejects a URL with no repository", () => {
  assert.throws(() => parseGitHubUrl("https://github.com/owner"))
})

test("readGitHubUrl answers null instead of throwing", () => {
  // The browser calls this on every paste, so every rejection has to be quiet.
  for (const value of ["", "   ", "not a url", "github.com/owner/repo", "https://github.com/owner"]) {
    assert.equal(readGitHubUrl(value), null, `expected ${JSON.stringify(value)} to be unusable`)
  }
})

test("readGitHubUrl accepts a pasted URL with surrounding whitespace", () => {
  assert.equal(
    readGitHubUrl("  https://github.com/owner/repo  ")?.githubUrl,
    "https://github.com/owner/repo",
  )
})
