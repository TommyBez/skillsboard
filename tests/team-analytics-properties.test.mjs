import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

const source = await readFile(
  new URL("../lib/team-analytics-properties.ts", import.meta.url),
  "utf8",
)
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const { withTeamAnalyticsScope } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
)

test("attaches the authoritative team_id to every team-scoped event payload", () => {
  assert.deepEqual(withTeamAnalyticsScope({ skill_name: "analytics" }, "team-123"), {
    skill_name: "analytics",
    team_id: "team-123",
  })
})

test("does not let a property bag override the authoritative team_id", () => {
  assert.deepEqual(withTeamAnalyticsScope({ team_id: "wrong" }, "team-123"), {
    team_id: "team-123",
  })
})
