import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose"

import { agentAuthConfig } from "@/lib/agent-auth/config"

/**
 * The explicit trust list of Agent Providers whose ID-JAGs this deployment will
 * verify, and the JWKS location for each.
 *
 * Trust is configuration, never discovery: an issuer is trusted because it is on
 * this list, and its keys come from the `jwksUri` recorded here. Nothing inside
 * an incoming assertion — not `iss`, not a `jku` header, not an embedded `jwk` —
 * can add an issuer or move a key source. That is the single most important
 * property of the reference implementation's `trust.ts` and it survives here.
 */
export type TrustedProvider = {
  /** Exact `iss` value to match. */
  issuer: string
  /**
   * Service-controlled display name. Rendered on the confirmation page, so a
   * provider cannot supply its own marketing copy through the assertion.
   */
  displayName: string
  /** Where this provider publishes its signing keys. */
  jwksUri: string
  /**
   * Optional allowlist for the ID-JAG's `client_id` claim. When set, an
   * assertion naming any other client is rejected even though the issuer is
   * trusted — it scopes trust to the agent applications this provider runs.
   */
  clientIds?: string[]
}

type RawProvider = {
  issuer?: unknown
  iss?: unknown
  displayName?: unknown
  display_name?: unknown
  name?: unknown
  jwksUri?: unknown
  jwks_uri?: unknown
  clientIds?: unknown
  client_ids?: unknown
}

const DEFAULT_JWKS_PATH = "/.well-known/jwks.json"

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined
}

function readStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const entries = value.map(readString).filter((entry): entry is string => Boolean(entry))
  return entries.length ? entries : undefined
}

/**
 * An issuer must be an absolute `https:` URL. Loopback `http:` is allowed so a
 * developer can run the reference provider next to `next dev`; nothing else is,
 * because a plain-text JWKS fetch is a key-substitution away from forged
 * identities.
 */
function isAcceptableProviderUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol === "https:") return true
  if (url.protocol !== "http:") return false
  const host = url.hostname
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost")
}

/**
 * Parses the `AGENT_AUTH_TRUSTED_PROVIDERS` JSON array. A malformed entry is
 * dropped with a warning rather than throwing: a bad value in one deployment's
 * environment must not take the whole auth server down at import time, and a
 * dropped provider fails closed (its assertions stop verifying).
 */
export function parseTrustedProviders(raw: string | undefined): TrustedProvider[] {
  const trimmed = raw?.trim()
  if (!trimmed) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    console.error("AGENT_AUTH_TRUSTED_PROVIDERS is not valid JSON; no Agent Provider is trusted")
    return []
  }
  if (!Array.isArray(parsed)) {
    console.error("AGENT_AUTH_TRUSTED_PROVIDERS must be a JSON array; no Agent Provider is trusted")
    return []
  }

  const providers: TrustedProvider[] = []
  const seen = new Set<string>()

  for (const entry of parsed) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue
    const raw = entry as RawProvider

    const issuer = readString(raw.issuer) ?? readString(raw.iss)
    if (!issuer || !isAcceptableProviderUrl(issuer)) {
      console.error("Skipping a trusted Agent Provider entry with a missing or non-https issuer")
      continue
    }
    // A duplicate issuer would make `client_id` scoping depend on list order.
    if (seen.has(issuer)) {
      console.error("Skipping a duplicate trusted Agent Provider issuer")
      continue
    }

    const jwksUri =
      readString(raw.jwksUri) ??
      readString(raw.jwks_uri) ??
      `${issuer.replace(/\/$/, "")}${DEFAULT_JWKS_PATH}`
    if (!isAcceptableProviderUrl(jwksUri)) {
      console.error("Skipping a trusted Agent Provider entry with a non-https jwks_uri")
      continue
    }

    seen.add(issuer)
    providers.push({
      issuer,
      displayName:
        readString(raw.displayName) ?? readString(raw.display_name) ?? readString(raw.name) ?? issuer,
      jwksUri,
      clientIds: readStringList(raw.clientIds) ?? readStringList(raw.client_ids),
    })
  }

  return providers
}

let cachedProviders: { raw: string | undefined; providers: TrustedProvider[] } | null = null

export function getTrustedProviders(): TrustedProvider[] {
  const raw = process.env.AGENT_AUTH_TRUSTED_PROVIDERS
  if (!cachedProviders || cachedProviders.raw !== raw) {
    cachedProviders = { raw, providers: parseTrustedProviders(raw) }
  }
  return cachedProviders.providers
}

export function findTrustedProvider(issuer: string | null | undefined): TrustedProvider | undefined {
  if (!issuer) return undefined
  return getTrustedProviders().find((provider) => provider.issuer === issuer)
}

/**
 * Whether the Agent Verified flow is live on this deployment. With no provider
 * configured there is nothing an agent could successfully do, so discovery must
 * not advertise the flow — see `lib/agent-auth-metadata.ts`.
 */
export function isAgentVerifiedEnabled(): boolean {
  return getTrustedProviders().length > 0
}

/**
 * Display name for a trusted issuer, for the confirmation page. Falls back to
 * the issuer URL, which only happens if the trust list changed under a
 * ceremony that was already in flight.
 */
export function trustedProviderDisplayName(issuer: string): string {
  return findTrustedProvider(issuer)?.displayName ?? issuer
}

/**
 * Cached remote JWKS per provider.
 *
 * `createRemoteJWKSet` is the same primitive the reference uses and gives us the
 * `kid` handling the profile needs for free: it caches the document, re-fetches
 * when a token names a `kid` it has not seen (rate-limited by `cooldownDuration`
 * so an attacker cannot turn unknown `kid`s into a fetch amplifier), and ages
 * the cache out after `cacheMaxAge`. The cache is keyed by `issuer|jwksUri`, so
 * repointing a provider's `jwks_uri` in configuration takes effect without a
 * stale key set surviving under the old issuer.
 */
const jwksCache = new Map<string, JWTVerifyGetKey>()

export function getProviderJwks(provider: TrustedProvider): JWTVerifyGetKey {
  const cacheKey = `${provider.issuer}|${provider.jwksUri}`
  let jwks = jwksCache.get(cacheKey)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(provider.jwksUri), {
      cooldownDuration: 30_000,
      cacheMaxAge: 600_000,
      timeoutDuration: 5_000,
    })
    jwksCache.set(cacheKey, jwks)
  }
  return jwks
}

/** Test seam: lets a test install a key resolver without a network JWKS. */
export function setProviderJwksForTesting(
  provider: Pick<TrustedProvider, "issuer" | "jwksUri">,
  jwks: JWTVerifyGetKey,
): void {
  jwksCache.set(`${provider.issuer}|${provider.jwksUri}`, jwks)
}

export function resetTrustedProviderCache(): void {
  cachedProviders = null
  jwksCache.clear()
}

/**
 * Signature algorithms accepted on a provider JWT. Typed as the literal union
 * jose expects, so a value that is not on the list cannot reach verification
 * even through a widened `string`.
 */
export const allowedProviderAlgorithms: string[] = [...agentAuthConfig.allowedProviderAlgorithms]
