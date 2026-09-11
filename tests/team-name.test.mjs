import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

async function transpiledModule(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8")
  const outputText = stripTypeScriptTypes(source, { mode: "transform" })
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
}

const { describeTeamNameError, readTeamName } = await import(
  await transpiledModule("../lib/team-name.ts")
)

test("an empty team name is reported instead of silently blocking the submit", () => {
  assert.equal(describeTeamNameError(""), "Team name must be at least 2 characters.")
  assert.equal(describeTeamNameError("   "), "Team name must be at least 2 characters.")
  assert.equal(describeTeamNameError(null), "Team name must be at least 2 characters.")
})

test("a one character team name reports the same rule the server applies", () => {
  assert.equal(describeTeamNameError("a"), "Team name must be at least 2 characters.")
})

test("an overlong team name reports the maximum", () => {
  assert.equal(describeTeamNameError("x".repeat(81)), "Team name must be 80 characters or less.")
})

test("an acceptable team name has no message", () => {
  assert.equal(describeTeamNameError("Acme"), "")
  assert.equal(describeTeamNameError("  Acme  "), "")
  assert.equal(describeTeamNameError("x".repeat(80)), "")
})

test("the posted team name is trimmed before it is judged", () => {
  const formData = new FormData()
  formData.set("name", "  Acme  ")
  assert.equal(readTeamName(formData), "Acme")

  const empty = new FormData()
  assert.equal(readTeamName(empty), "")
})
