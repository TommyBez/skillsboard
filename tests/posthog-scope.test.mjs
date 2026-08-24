import assert from "node:assert/strict"
import { readdir } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const {
  applyPostHogScope,
  withPostHogEventScope,
} = await import("../lib/posthog-scope-state.ts")
const {
  registerPostHogIdentity,
  registerPostHogScopeRequirement,
  snapshotPostHogEventScope,
} = await import("../lib/posthog-scope.ts")
const { postHogPageViewRequirement } = await import(
  "../lib/posthog-route-scope.ts"
)

async function routeSamples(routeGroup) {
  const files = await readdir(new URL(`../app/${routeGroup}/`, import.meta.url), {
    recursive: true,
  })

  return files
    .filter((file) => file.endsWith("page.tsx"))
    .map((file) =>
      `/${file
        .split("/")
        .slice(0, -1)
        .map((segment) => (segment.startsWith("[") ? "sample" : segment))
        .join("/")}`,
    )
}

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

test("keeps the team active when an event was triggered", async () => {
  const releaseRequirement = registerPostHogScopeRequirement("team")
  const releaseFirstIdentity = registerPostHogIdentity({
    teamId: "team-1",
    userId: "user-1",
  })

  const eventScope = snapshotPostHogEventScope()
  releaseFirstIdentity()
  const releaseSecondIdentity = registerPostHogIdentity({
    teamId: "team-2",
    userId: "user-1",
  })

  assert.deepEqual(
    withPostHogEventScope({ source: "library" }, await eventScope),
    { source: "library", team_id: "team-1" },
  )

  releaseSecondIdentity()
  releaseRequirement()
})

test("an optional user scope resolves without a server user lookup", async () => {
  const releaseRequirement = registerPostHogScopeRequirement("optional-user")
  const eventScope = snapshotPostHogEventScope()
  const releaseIdentity = registerPostHogIdentity({ userId: null })

  assert.deepEqual(await eventScope, { teamId: null, userId: null })
  assert.deepEqual(withPostHogEventScope(undefined, await eventScope), {
    team_id: null,
  })

  releaseIdentity()
  releaseRequirement()
})

test("pageviews wait for the scope required by the destination route", async () => {
  for (const pathname of await routeSamples("(app)")) {
    assert.equal(postHogPageViewRequirement(pathname), "team")
  }

  for (const pathname of await routeSamples("(account)")) {
    assert.equal(postHogPageViewRequirement(pathname), "user")
  }

  assert.equal(postHogPageViewRequirement("/onboarding"), "user")
  assert.equal(postHogPageViewRequirement("/consent"), "optional-user")
  assert.equal(postHogPageViewRequirement("/pricing"), "anonymous")
})

test("a scope wait survives intermediate registry changes", async () => {
  const eventScope = snapshotPostHogEventScope("team")
  const releaseRequirement = registerPostHogScopeRequirement("team")
  const releaseIdentity = registerPostHogIdentity({
    teamId: "team-after-stream",
    userId: "user-after-stream",
  })

  assert.deepEqual(await eventScope, {
    teamId: "team-after-stream",
    userId: "user-after-stream",
  })

  releaseIdentity()
  releaseRequirement()
})
