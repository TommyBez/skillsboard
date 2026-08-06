import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { transpileTsToDataUrl } from "./transpile-ts.mjs"

const source = await readFile(
  new URL("../lib/library-view-state.ts", import.meta.url),
  "utf8",
)
const libraryViewState = await import(transpileTsToDataUrl(source))
const { findRecentTeammateRecommendation } = libraryViewState

const now = new Date("2026-07-29T08:00:00.000Z")
const userId = "current-user"

function candidate(id, createdBy, createdAt) {
  return { id, createdBy, createdAt: new Date(createdAt) }
}

test("selects the first teammate skill added within the last 48 hours", () => {
  const skills = [
    candidate("own-newest", userId, "2026-07-29T07:00:00.000Z"),
    candidate("teammate-recent", "teammate", "2026-07-28T08:00:00.000Z"),
    candidate("teammate-older", "teammate", "2026-07-26T07:59:59.999Z"),
  ]

  assert.equal(
    findRecentTeammateRecommendation(skills, userId, now)?.id,
    "teammate-recent",
  )
})

test("includes a teammate skill added exactly 48 hours ago", () => {
  const skills = [
    candidate("at-cutoff", "teammate", "2026-07-27T08:00:00.000Z"),
  ]

  assert.equal(
    findRecentTeammateRecommendation(skills, userId, now)?.id,
    "at-cutoff",
  )
})

test("hides teammate skills older than 48 hours", () => {
  const skills = [
    candidate("past-cutoff", "teammate", "2026-07-27T07:59:59.999Z"),
  ]

  assert.equal(findRecentTeammateRecommendation(skills, userId, now), undefined)
})

test("ignores future timestamps", () => {
  const skills = [
    candidate("future", "teammate", "2026-07-29T08:00:00.001Z"),
  ]

  assert.equal(findRecentTeammateRecommendation(skills, userId, now), undefined)
})
