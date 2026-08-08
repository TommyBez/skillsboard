interface ArchiveSizes {
  artifactBytes: number
  sourceBytes: number
}

interface CollectionArchiveBudgetLimits {
  artifactBytes: number
  sourceBytes: number
}

export type CollectionArchiveBudgetResult =
  | { ok: true }
  | { limit: "artifact" | "source"; ok: false }

/** Tracks collection-wide archive limits as individual skills finish packaging. */
export function createCollectionArchiveBudget(limits: CollectionArchiveBudgetLimits) {
  let artifactBytes = 0
  let sourceBytes = 0

  return {
    add(archive: ArchiveSizes): CollectionArchiveBudgetResult {
      const nextArtifactBytes = artifactBytes + archive.artifactBytes
      if (nextArtifactBytes > limits.artifactBytes) {
        return { limit: "artifact", ok: false }
      }

      const nextSourceBytes = sourceBytes + archive.sourceBytes
      if (nextSourceBytes > limits.sourceBytes) {
        return { limit: "source", ok: false }
      }

      artifactBytes = nextArtifactBytes
      sourceBytes = nextSourceBytes
      return { ok: true }
    },
  }
}
