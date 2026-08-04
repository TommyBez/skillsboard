import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./load-ts-module.mjs"

const { withTeamAnalyticsScope } = await loadTsModule("../lib/team-analytics-properties.ts")

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
