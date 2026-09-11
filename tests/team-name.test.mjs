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

const organizationActions = await readFile(
  new URL("../app/actions/organizations.ts", import.meta.url),
  "utf8",
)
const createOrganizationForm = await readFile(
  new URL("../components/create-organization-form.tsx", import.meta.url),
  "utf8",
)

test("only the rejected name branch marks the name field as invalid", () => {
  // The name rule is the one failure that belongs to the field. A creation that
  // fails after a valid name was accepted must not mark the field or steal focus.
  const nameBranch = organizationActions.slice(
    organizationActions.indexOf("if (nameError) {"),
    organizationActions.indexOf("const slug = await resolveUniqueOrganizationSlug"),
  )
  assert.match(nameBranch, /invalidField: "name"/)
  assert.equal(organizationActions.match(/invalidField: "name"/g).length, 1)

  const createOrganizationBody = organizationActions.slice(
    organizationActions.indexOf("export async function createOrganization"),
    organizationActions.indexOf("export async function createInvitationLink"),
  )
  const returnedStates = createOrganizationBody.match(/error: "We couldn’t create your team library[^}]*/g)
  assert.equal(returnedStates.length, 2)
  for (const returnedState of returnedStates) {
    assert.doesNotMatch(returnedState, /invalidField/)
  }
})

test("the form ties aria-invalid, aria-describedby and focus to the name field only", () => {
  assert.match(createOrganizationForm, /const nameError = state\.invalidField === "name" \? state\.error : ""/)
  assert.match(createOrganizationForm, /aria-invalid=\{nameError \? true : undefined\}/)
  assert.match(createOrganizationForm, /aria-describedby=\{nameError \? errorId : undefined\}/)
  assert.match(createOrganizationForm, /if \(nameError\) nameRef\.current\?\.focus\(\)/)
  // The alert still reports any error the action returns.
  assert.match(createOrganizationForm, /\{state\.error \? \(/)
})
