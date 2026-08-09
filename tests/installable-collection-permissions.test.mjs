import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

const source = await readFile(
  new URL("../lib/installable-collection-permissions.ts", import.meta.url),
  "utf8",
)
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const { canChangeCollectionMembership } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
)

const base = {
  collectionCreatedBy: "creator",
  hasDistribution: true,
  role: "member",
  userId: "member",
}

test("keeps normal collections collaborative", () => {
  assert.equal(canChangeCollectionMembership({ ...base, hasDistribution: false }), true)
})

test("restricts installable collection membership for ordinary members", () => {
  assert.equal(canChangeCollectionMembership(base), false)
})

test("allows the creator and organization admins", () => {
  assert.equal(canChangeCollectionMembership({ ...base, userId: "creator" }), true)
  assert.equal(canChangeCollectionMembership({ ...base, role: "admin" }), true)
  assert.equal(canChangeCollectionMembership({ ...base, role: "owner" }), true)
})

test("denies missing or unrecognized roles for another user's installable collection", () => {
  assert.equal(canChangeCollectionMembership({ ...base, role: null }), false)
  assert.equal(canChangeCollectionMembership({ ...base, role: undefined }), false)
  assert.equal(canChangeCollectionMembership({ ...base, role: "billing" }), false)
})
