/**
 * The version of the public HTTP surface, and how a client pins it.
 *
 * The endpoints are not versioned in their paths, and moving them under `/v1`
 * would break the one thing that must not break: `/api/mcp` is the audience
 * every issued token is bound to, and the well-known documents are at the paths
 * their own specifications fix. So the version travels in a header instead. A
 * request may state the version it was written against; the response always
 * states the version that answered.
 *
 * The contract that makes the header worth sending: within a major version,
 * members are added but never removed or retyped. A breaking change ships as
 * the next version, and until the previous one is withdrawn, both answer. A
 * version being withdrawn is announced on its own responses with `Deprecation`
 * and `Sunset` (RFC 9745 and RFC 8594) at least 90 days ahead, and `/developers`
 * carries the timeline in prose.
 */
export const API_VERSION = "1"

/** Every version this deployment still answers, current one first. */
export const SUPPORTED_API_VERSIONS = [API_VERSION] as const

export const API_VERSION_HEADER = "Skills-Board-Api-Version"

/**
 * Whether a request's pinned version is one this deployment serves.
 *
 * An absent header is not a version mismatch: it means the client did not pin,
 * and it gets the current version, which is what an agent that has never heard
 * of the header should get.
 */
export function isSupportedApiVersion(requested: string | null | undefined): boolean {
  if (requested === null || requested === undefined) return true

  const trimmed = requested.trim()
  if (!trimmed) return true

  return (SUPPORTED_API_VERSIONS as readonly string[]).includes(trimmed)
}

/** The header every public HTTP response carries, whatever the status. */
export const apiVersionHeaders = { [API_VERSION_HEADER]: API_VERSION } as const

/**
 * `Vary`, so a shared cache cannot hand one client's version-pinned answer to a
 * client that pinned a different one.
 */
export const API_VERSION_VARY = API_VERSION_HEADER
