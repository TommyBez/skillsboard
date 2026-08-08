import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { stripTypeScriptTypes } from "node:module"
import { test } from "node:test"

const source = await readFile(
  new URL("../lib/analytics-url-privacy.ts", import.meta.url),
  "utf8",
)
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const { sanitizeAnalyticsUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
)

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
