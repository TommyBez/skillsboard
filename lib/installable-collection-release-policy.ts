export const SUPERSEDED_RELEASE_RETENTION_MS = 24 * 60 * 60 * 1000
export const COLLECTION_RELEASE_CLEANUP_BATCH_SIZE = 10
export const COLLECTION_RELEASE_CLEANUP_MAX_BATCHES = 10

export interface CollectionReleaseCleanupOptions {
  batchSize?: number
  maxBatches?: number
  now?: Date
}

export function supersededReleaseCutoff(now: Date) {
  return new Date(now.getTime() - SUPERSEDED_RELEASE_RETENTION_MS)
}

export function resolveCollectionReleaseCleanupOptions(
  options?: CollectionReleaseCleanupOptions,
) {
  const batchSize = options?.batchSize ?? COLLECTION_RELEASE_CLEANUP_BATCH_SIZE
  const maxBatches = options?.maxBatches ?? COLLECTION_RELEASE_CLEANUP_MAX_BATCHES
  const now = options?.now ?? new Date()
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
    throw new Error("Collection release cleanup batchSize must be a positive integer")
  }
  if (!Number.isSafeInteger(maxBatches) || maxBatches < 1) {
    throw new Error("Collection release cleanup maxBatches must be a positive integer")
  }
  if (Number.isNaN(now.getTime())) {
    throw new Error("Collection release cleanup now must be a valid date")
  }

  return {
    batchSize,
    cutoff: supersededReleaseCutoff(now),
    maxBatches,
  }
}

export function shouldRetainSupersededReleaseGrace(wasRevoked: boolean) {
  return !wasRevoked
}
