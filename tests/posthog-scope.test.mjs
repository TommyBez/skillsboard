import assert from "node:assert/strict"
import { test } from "node:test"

const { applyPostHogScope } = await import("../lib/posthog-scope-state.ts")

function createPostHogScopeClient(initialProperties = {}) {
  const properties = new Map(Object.entries(initialProperties))
  const operations = []

  return {
    operations,
    client: {
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
      setPersonProperties(next) {
        operations.push(["setPersonProperties", next])
      },
      unregister(key) {
        operations.push(["unregister", key])
        properties.delete(key)
      },
    },
  }
}

test("identifies the user before registering the event-time team scope", () => {
  const { client, operations } = createPostHogScopeClient()

  applyPostHogScope(client, { userId: "user-1", teamId: "team-1" })

  assert.deepEqual(operations, [
    ["identify", "user-1"],
    ["register", { team_id: "team-1" }],
    ["setPersonProperties", { active_team_id: "team-1" }],
  ])
})

test("does not emit identity work when the requested scope is already active", () => {
  const { client, operations } = createPostHogScopeClient({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogScope(client, { userId: "user-1", teamId: "team-1" })

  assert.deepEqual(operations, [])
})

test("switches the team without resetting the stable user identity", () => {
  const { client, operations } = createPostHogScopeClient({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogScope(client, { userId: "user-1", teamId: "team-2" })

  assert.deepEqual(operations, [
    ["register", { team_id: "team-2" }],
    ["setPersonProperties", { active_team_id: "team-2" }],
  ])
})

test("removes team context outside team routes while retaining the known user", () => {
  const { client, operations } = createPostHogScopeClient({
    $user_id: "user-1",
    team_id: "team-1",
  })

  applyPostHogScope(client, { userId: "user-1", teamId: null })

  assert.deepEqual(operations, [["unregister", "team_id"]])
})

test("resets a restored different account before applying its identity and team", () => {
  const { client, operations } = createPostHogScopeClient({
    $user_id: "user-old",
    team_id: "team-old",
  })

  applyPostHogScope(client, { userId: "user-new", teamId: "team-new" })

  assert.deepEqual(operations, [
    ["reset"],
    ["identify", "user-new"],
    ["register", { team_id: "team-new" }],
    ["setPersonProperties", { active_team_id: "team-new" }],
  ])
})
