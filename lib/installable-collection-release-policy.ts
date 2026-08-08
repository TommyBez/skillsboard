export const SUPERSEDED_RELEASE_RETENTION_MS = 24 * 60 * 60 * 1000

export function supersededReleaseCutoff(now: Date) {
  return new Date(now.getTime() - SUPERSEDED_RELEASE_RETENTION_MS)
}

export function shouldRetainSupersededReleaseGrace(wasRevoked: boolean) {
  return !wasRevoked
}
