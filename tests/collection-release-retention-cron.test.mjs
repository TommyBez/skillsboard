import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  collectionReleaseCleanupOutcome,
  hasValidCronAuthorization,
} = await loadTsModule(
  new URL("../lib/collection-release-retention-cron.ts", import.meta.url),
)

test("accepts only an exact bearer CRON_SECRET using the cron authorization helper", () => {
  assert.equal(hasValidCronAuthorization("Bearer expected-secret", "expected-secret"), true)
  assert.equal(hasValidCronAuthorization("Bearer wrong-secret", "expected-secret"), false)
  assert.equal(hasValidCronAuthorization("bearer expected-secret", "expected-secret"), false)
})

test("cron authorization fails closed when either credential is absent", () => {
  assert.equal(hasValidCronAuthorization(null, "expected-secret"), false)
  assert.equal(hasValidCronAuthorization("Bearer expected-secret", undefined), false)
  assert.equal(hasValidCronAuthorization("Bearer ", ""), false)
})

test("marks a bounded cleanup backlog as a failed cron invocation", () => {
  assert.deepEqual(collectionReleaseCleanupOutcome(false), { ok: true, status: 200 })
  assert.deepEqual(collectionReleaseCleanupOutcome(true), { ok: false, status: 503 })
})
