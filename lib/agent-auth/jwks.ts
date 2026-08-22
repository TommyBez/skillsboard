import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose"

import type { TrustedAgentProvider } from "@/lib/agent-auth/config"

/**
 * One `createRemoteJWKSet` per trusted issuer, kept for the life of the
 * process.
 *
 * `jose` already implements exactly the caching policy this needs, and reusing
 * its instance is what makes the cache work: the set is only refetched when
 * the cache goes cold (`cacheMaxAge`) or when a `kid` arrives that the cached
 * keys do not cover, and `cooldownDuration` keeps an unknown `kid` from
 * turning into a request per verification. Building a new set per request —
 * the obvious-looking mistake — would fetch the provider's JWKS on every
 * single authentication.
 *
 * Keyed by `issuer` rather than by URL because the issuer is what the trust
 * list is keyed on: if an operator repoints an issuer at a different
 * `jwksUri`, the entry must not keep serving keys fetched from the old one.
 */
interface CacheEntry {
  jwksUri: string
  getKey: JWTVerifyGetKey
}

const jwksByIssuer = new Map<string, CacheEntry>()

/** Keys are considered fresh for this long before the next request refetches. */
const CACHE_MAX_AGE_MS = 10 * 60 * 1000

/** Floor between two refetches triggered by an unrecognized `kid`. */
const COOLDOWN_MS = 30 * 1000

export function getProviderKeySource(provider: TrustedAgentProvider): JWTVerifyGetKey {
  const cached = jwksByIssuer.get(provider.issuer)
  if (cached && cached.jwksUri === provider.jwksUri) return cached.getKey

  const getKey = createRemoteJWKSet(new URL(provider.jwksUri), {
    cacheMaxAge: CACHE_MAX_AGE_MS,
    cooldownDuration: COOLDOWN_MS,
    timeoutDuration: 5000,
  })

  jwksByIssuer.set(provider.issuer, { jwksUri: provider.jwksUri, getKey })
  return getKey
}
