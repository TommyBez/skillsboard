import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  COLLECTION_RELEASE_CLEANUP_BATCH_SIZE,
  COLLECTION_RELEASE_CLEANUP_MAX_BATCHES,
  SUPERSEDED_RELEASE_RETENTION_MS,
  resolveCollectionReleaseCleanupOptions,
  shouldRetainSupersededReleaseGrace,
  supersededReleaseCutoff,
} = await loadTsModule(
  new URL("../lib/installable-collection-release-policy.ts", import.meta.url),
)

test("keeps superseded releases available for a full 24-hour install grace period", () => {
  const now = new Date("2026-08-08T12:00:00.000Z")

  assert.equal(SUPERSEDED_RELEASE_RETENTION_MS, 86_400_000)
  assert.equal(
    supersededReleaseCutoff(now).toISOString(),
    "2026-08-07T12:00:00.000Z",
  )
})

test("does not retain artifacts across a revoked share generation", () => {
  assert.equal(shouldRetainSupersededReleaseGrace(false), true)
  assert.equal(shouldRetainSupersededReleaseGrace(true), false)
})

test("resolves bounded cleanup defaults from the same retention cutoff", () => {
  const now = new Date("2026-08-08T12:00:00.000Z")
  const resolved = resolveCollectionReleaseCleanupOptions({ now })

  assert.equal(resolved.batchSize, COLLECTION_RELEASE_CLEANUP_BATCH_SIZE)
  assert.equal(resolved.maxBatches, COLLECTION_RELEASE_CLEANUP_MAX_BATCHES)
  assert.equal(resolved.cutoff.toISOString(), "2026-08-07T12:00:00.000Z")
})

test("rejects invalid cleanup bounds and dates before querying", () => {
  assert.throws(
    () => resolveCollectionReleaseCleanupOptions({ batchSize: 0 }),
    /batchSize must be a positive integer/,
  )
  assert.throws(
    () => resolveCollectionReleaseCleanupOptions({ maxBatches: 1.5 }),
    /maxBatches must be a positive integer/,
  )
  assert.throws(
    () => resolveCollectionReleaseCleanupOptions({ now: new Date(Number.NaN) }),
    /now must be a valid date/,
  )
})
