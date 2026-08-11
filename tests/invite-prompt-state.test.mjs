import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  INVITE_PROMPT_STORAGE_PREFIX,
  invitePromptStorageKey,
  parseInvitePromptState,
  resolveInvitePromptStateAfterStep,
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
