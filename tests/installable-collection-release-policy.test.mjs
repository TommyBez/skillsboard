import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { stripTypeScriptTypes } from "node:module"
import { test } from "node:test"

const source = await readFile(
  new URL("../lib/installable-collection-release-policy.ts", import.meta.url),
  "utf8",
)
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const {
  SUPERSEDED_RELEASE_RETENTION_MS,
  shouldRetainSupersededReleaseGrace,
  supersededReleaseCutoff,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)

test("keeps superseded releases available for a full 24-hour install grace period", () => {
  const now = new Date("2026-08-08T12:00:00.000Z")

  assert.equal(SUPERSEDED_RELEASE_RETENTION_MS, 86_400_000)
  assert.equal(
    supersededReleaseCutoff(now).toISOString(),
    "2026-08-07T12:00:00.000Z",
  )
})

test("does not retain artifacts across a revoked share generation", () => {
  assert.equal(shouldRetainSupersededReleaseGrace(false), true)
  assert.equal(shouldRetainSupersededReleaseGrace(true), false)
})
