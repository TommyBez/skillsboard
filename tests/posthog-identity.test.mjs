import assert from "node:assert/strict"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { applyPostHogIdentity } = await import("../lib/posthog-client.ts")

function createPostHog(initialProperties = {}) {
  const properties = new Map(Object.entries(initialProperties))
  const operations = []

  return {
    operations,
    posthog: {
      get_property(key) {
        return properties.get(key)
      },
      identify(userId) {
        operations.push(["identify", userId])
        properties.set("$user_id", userId)
      },
      register(next) {
        operations.push(["register", next])
        for (const [key, value] of Object.entries(next)) properties.set(key, value)
      },
      reset() {
        operations.push(["reset"])
        properties.clear()
      },
      unregister(key) {
        operations.push(["unregister", key])
        properties.delete(key)
      },
    },
  }
}

test("identifies the user before registering the active team", () => {
  const { operations, posthog } = createPostHog()

  applyPostHogIdentity(posthog, { userId: "user-1", teamId: "team-1" })

  assert.deepEqual(operations, [
    ["identify", "user-1"],
    ["register", { team_id: "team-1" }],
  ])
})

test("does no identity work when user and team are already current", () => {
  const { operations, posthog } = createPostHog({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogIdentity(posthog, { userId: "user-1", teamId: "team-1" })

  assert.deepEqual(operations, [])
})

test("switches team without resetting the stable user", () => {
  const { operations, posthog } = createPostHog({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogIdentity(posthog, { userId: "user-1", teamId: "team-2" })

  assert.deepEqual(operations, [["register", { team_id: "team-2" }]])
})

test("preserves team context when a route only refreshes user identity", () => {
  const { operations, posthog } = createPostHog({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogIdentity(posthog, { userId: "user-1" })

  assert.deepEqual(operations, [])
})

test("removes team context when it is explicitly cleared", () => {
  const { operations, posthog } = createPostHog({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogIdentity(posthog, { userId: "user-1", teamId: null })

  assert.deepEqual(operations, [["unregister", "team_id"]])
})

test("resets a different persisted account before identifying it", () => {
  const { operations, posthog } = createPostHog({
    $user_id: "user-old",
    team_id: "team-old",
  })

  applyPostHogIdentity(posthog, { userId: "user-new", teamId: "team-new" })

  assert.deepEqual(operations, [
    ["reset"],
    ["identify", "user-new"],
    ["register", { team_id: "team-new" }],
  ])
})
