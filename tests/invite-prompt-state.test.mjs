import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  INVITE_PROMPT_STORAGE_PREFIX,
  invitePromptStorageKey,
  parseInvitePromptState,
  readInvitePromptState,
  resolveInvitePromptStateAfterStep,
  subscribeToInvitePromptState,
  writeInvitePromptState,
} = await loadTsModule(new URL("../lib/invite-prompt-state.ts", import.meta.url))

test("keys the dismissal record per team on the shipped storage prefix", () => {
  assert.equal(INVITE_PROMPT_STORAGE_PREFIX, "sb.invite-prompt.")
  assert.equal(invitePromptStorageKey("team-123"), "sb.invite-prompt.team-123")
  assert.notEqual(invitePromptStorageKey("team-123"), invitePromptStorageKey("team-456"))
})

test("reads only the two states that were actually persisted", () => {
  assert.equal(parseInvitePromptState("collapsed"), "collapsed")
  assert.equal(parseInvitePromptState("dismissed"), "dismissed")
  assert.equal(parseInvitePromptState("expanded"), "expanded")
})

test("treats missing or corrupted storage as never dismissed", () => {
  assert.equal(parseInvitePromptState(null), "expanded")
  assert.equal(parseInvitePromptState(""), "expanded")
  assert.equal(parseInvitePromptState("DISMISSED"), "expanded")
})

test("closing the first-skill step folds the library banner instead of removing it", () => {
  assert.equal(resolveInvitePromptStateAfterStep("expanded"), "collapsed")
  assert.equal(resolveInvitePromptStateAfterStep("collapsed"), "collapsed")
})

test("closing the first-skill step never revives an already dismissed banner", () => {
  assert.equal(resolveInvitePromptStateAfterStep("dismissed"), "dismissed")
})

/* No window here, so localStorage always throws: the same shape as a browser
   with storage blocked. The record still has to hold for the rest of the
   session, and every mounted surface still has to hear about it. */
test("a write reaches surfaces that are already on screen", () => {
  const seen = []
  const unsubscribe = subscribeToInvitePromptState(() => seen.push(readInvitePromptState("team-live")))

  assert.equal(readInvitePromptState("team-live"), "expanded")
  writeInvitePromptState("team-live", "collapsed")
  assert.deepEqual(seen, ["collapsed"])

  unsubscribe()
  writeInvitePromptState("team-live", "dismissed")
  assert.deepEqual(seen, ["collapsed"])
})

test("remembers the choice per team even when storage cannot hold it", () => {
  writeInvitePromptState("team-a", "dismissed")

  assert.equal(readInvitePromptState("team-a"), "dismissed")
  assert.equal(readInvitePromptState("team-b"), "expanded")
})
