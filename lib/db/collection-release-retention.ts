import "server-only"

import { sql } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  type CollectionReleaseCleanupOptions,
  resolveCollectionReleaseCleanupOptions,
} from "@/lib/installable-collection-release-policy"

interface CleanupBatchRow extends Record<string, unknown> {
  deletedArtifactBytes: number | string
  deletedArtifacts: number | string
  deletedReleases: number | string
}

export interface CollectionReleaseCleanupResult {
  batches: number
  cutoff: Date
  deletedArtifactBytes: number
  deletedArtifacts: number
  deletedReleases: number
  mayHaveMore: boolean
}

function parseNonNegativeSafeInteger(value: number | string, field: string) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Collection release cleanup returned an invalid ${field}`)
  }
  return parsed
}

async function deleteExpiredCollectionReleaseBatch(cutoff: Date, batchSize: number) {
  const result = await db.execute<CleanupBatchRow>(sql`
    WITH "candidates" AS MATERIALIZED (
      SELECT
        "release"."id",
        (
          SELECT COUNT(*)::integer
          FROM "collectionReleaseSkill" AS "artifact"
          WHERE "artifact"."releaseId" = "release"."id"
        ) AS "artifactCount",
        (
          SELECT COALESCE(SUM("artifact"."artifactBytes"), 0)::bigint
          FROM "collectionReleaseSkill" AS "artifact"
          WHERE "artifact"."releaseId" = "release"."id"
        ) AS "artifactBytes"
      FROM "collectionRelease" AS "release"
      WHERE "release"."supersededAt" < ${cutoff}
        AND NOT EXISTS (
          SELECT 1
          FROM "collectionDistribution" AS "distribution"
          WHERE "distribution"."collectionId" = "release"."collectionId"
            AND "distribution"."activeReleaseId" = "release"."id"
        )
      ORDER BY "release"."supersededAt", "release"."id"
      LIMIT ${batchSize}
      FOR UPDATE OF "release" SKIP LOCKED
    ),
    "deleted" AS (
      DELETE FROM "collectionRelease" AS "release"
      USING "candidates"
      WHERE "release"."id" = "candidates"."id"
      RETURNING "release"."id"
    )
    SELECT
      COUNT("deleted"."id")::integer AS "deletedReleases",
      COALESCE(SUM("candidates"."artifactCount"), 0)::integer AS "deletedArtifacts",
      COALESCE(SUM("candidates"."artifactBytes"), 0)::bigint AS "deletedArtifactBytes"
    FROM "deleted"
    INNER JOIN "candidates" ON "candidates"."id" = "deleted"."id"
  `)
  const row = result.rows[0]
  if (!row) throw new Error("Collection release cleanup did not return a result")

  return {
    deletedArtifactBytes: parseNonNegativeSafeInteger(
      row.deletedArtifactBytes,
      "artifact byte count",
    ),
    deletedArtifacts: parseNonNegativeSafeInteger(row.deletedArtifacts, "artifact count"),
    deletedReleases: parseNonNegativeSafeInteger(row.deletedReleases, "release count"),
  }
}

/**
 * Deletes expired superseded releases in bounded, concurrency-safe batches.
 * The active-release exclusion is defense in depth in addition to its FK.
 */
export async function purgeExpiredCollectionReleases(
  options?: CollectionReleaseCleanupOptions,
): Promise<CollectionReleaseCleanupResult> {
  const { batchSize, cutoff, maxBatches } = resolveCollectionReleaseCleanupOptions(options)
  let batches = 0
  let deletedArtifactBytes = 0
  let deletedArtifacts = 0
  let deletedReleases = 0
  let lastBatchDeleted = 0

  while (batches < maxBatches) {
    const batch = await deleteExpiredCollectionReleaseBatch(cutoff, batchSize)
    batches += 1
    lastBatchDeleted = batch.deletedReleases
    deletedArtifactBytes += batch.deletedArtifactBytes
    deletedArtifacts += batch.deletedArtifacts
    deletedReleases += batch.deletedReleases

    if (batch.deletedReleases < batchSize) break
  }

  return {
    batches,
    cutoff,
    deletedArtifactBytes,
    deletedArtifacts,
    deletedReleases,
    mayHaveMore: batches === maxBatches && lastBatchDeleted === batchSize,
  }
}
