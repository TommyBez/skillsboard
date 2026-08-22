import { getAuthorizationServerIssuer, getDiscoveryOrigin } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopes } from "@/lib/oauth-scopes"

/**
 * An agent provider this deployment is willing to believe.
 *
 * `issuer` is the primary key of the trust list and the only field an incoming
 * ID-JAG gets to select on. Everything else — above all `jwksUri` — comes from
 * here, never from the token: a `jwks_uri` read out of an unverified assertion
 * would let the assertion nominate the key that verifies it.
 */
export interface TrustedAgentProvider {
  issuer: string
  jwksUri: string
  displayName: string
  allowedAlgorithms: string[]
}

/**
 * Asymmetric algorithms only. An ID-JAG is verified against a public JWKS, so
 * an HMAC alg in a header can only be an attempt to have us verify a token
 * with a public key as the shared secret.
 */
const SUPPORTED_ALGORITHMS = new Set([
  "ES256", "ES384", "ES512",
  "RS256", "RS384", "RS512",
  "PS256", "PS384", "PS512",
  "EdDSA",
])

const DEFAULT_ALGORITHMS = ["ES256"]

/**
 * The trust list, read from `AGENT_AUTH_TRUSTED_PROVIDERS`.
 *
 * A JSON array of `{ issuer, jwksUri, displayName, allowedAlgorithms }`. It is
 * configuration rather than code because the set of providers a deployment
 * trusts is a deployment decision — production may trust one provider that a
 * preview must not — and because adding one must not require a release.
 *
 * The list is empty by default. An empty list is not a failure state: it means
 * this deployment accepts no ID-JAG at all, which is the correct posture until
 * an operator has named a provider on purpose.
 */
export function getTrustedAgentProviders(): Map<string, TrustedAgentProvider> {
  const raw = process.env.AGENT_AUTH_TRUSTED_PROVIDERS?.trim()
  if (!raw) return new Map()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.error("AGENT_AUTH_TRUSTED_PROVIDERS is not valid JSON; no agent provider is trusted")
    return new Map()
  }

  const entries = Array.isArray(parsed) ? parsed : [parsed]
  const providers = new Map<string, TrustedAgentProvider>()

  for (const entry of entries) {
    const provider = normalizeProvider(entry)
    if (!provider) continue
    // First declaration of an issuer wins, so a duplicated entry cannot
    // silently redirect an already-configured issuer at another JWKS.
    if (providers.has(provider.issuer)) {
      console.error("Duplicate agent provider issuer ignored", { issuer: provider.issuer })
      continue
    }
    providers.set(provider.issuer, provider)
  }

  return providers
}

function normalizeProvider(entry: unknown): TrustedAgentProvider | undefined {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return undefined
  const record = entry as Record<string, unknown>

  const issuer = httpsUrl(record.issuer)
  const jwksUri = httpsUrl(record.jwksUri ?? record.jwks_uri)
  if (!issuer || !jwksUri) {
    console.error("Agent provider entry is missing a usable issuer or jwksUri")
    return undefined
  }

  const declared = Array.isArray(record.allowedAlgorithms)
    ? record.allowedAlgorithms.filter((value): value is string => typeof value === "string")
    : DEFAULT_ALGORITHMS
  const allowedAlgorithms = declared.filter((alg) => SUPPORTED_ALGORITHMS.has(alg))
  if (allowedAlgorithms.length === 0) {
    console.error("Agent provider entry declares no supported signature algorithm", { issuer })
    return undefined
  }

  const displayName = typeof record.displayName === "string" && record.displayName.trim()
    ? record.displayName.trim()
    : new URL(issuer).hostname

  return { issuer, jwksUri, displayName, allowedAlgorithms }
}

/**
 * An issuer is compared as an exact string, so it has to be stored in one
 * shape. `new URL().toString()` would append a trailing slash to a bare origin
 * and stop it matching the `iss` a provider actually stamps, so the trailing
 * slash is stripped instead of normalized in.
 *
 * http is accepted on loopback only, which is what makes a local provider
 * stub testable without opening the door in production.
 */
function httpsUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined
  try {
    const url = new URL(value.trim())
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) return undefined
    return url.toString().replace(/\/$/, "")
  } catch {
    return undefined
  }
}

export function findTrustedAgentProvider(issuer: unknown): TrustedAgentProvider | undefined {
  if (typeof issuer !== "string") return undefined
  return getTrustedAgentProviders().get(issuer.replace(/\/$/, ""))
}

/**
 * The one audience value this deployment stores on a delegation.
 *
 * The protected-resource identifier, not the issuer, because it is the exact
 * value Better Auth binds an access token's `aud` to (see `mcp({ resource })`
 * in `lib/auth.ts`). A delegation keyed on anything else would name an
 * audience no token is ever minted for.
 */
export function getAgentAudience(): string {
  return getMcpResource()
}

/**
 * Audience values an ID-JAG may carry, all normalized to `getAgentAudience()`.
 *
 * Three spellings of the same service are accepted because the ID-JAG draft
 * and RFC 8707 pull in different directions: a provider may address the
 * authorization server by its issuer, the protected resource by its RFC 8707
 * identifier, or the deployment by its bare origin. All three are strings this
 * deployment controls, so accepting them costs nothing; accepting an arbitrary
 * `aud` would let a token minted for another service be replayed here.
 */
export function acceptedAgentAudiences(): string[] {
  return [getAgentAudience(), getAuthorizationServerIssuer(), getDiscoveryOrigin()]
}

export function normalizeAgentAudience(audience: unknown): string | undefined {
  const values = Array.isArray(audience) ? audience : [audience]
  const accepted = new Set(acceptedAgentAudiences())
  for (const value of values) {
    if (typeof value !== "string") continue
    if (accepted.has(value.replace(/\/$/, ""))) return getAgentAudience()
  }
  return undefined
}

/**
 * How stale the user's authentication at the provider may be, in seconds.
 *
 * This is the provider's responsibility, not ours: an ID-JAG whose `auth_time`
 * is older than this earns `login_required`, which tells the agent to have its
 * own provider re-authenticate the user. Answering it with our OTP instead
 * would be re-authenticating the wrong session on the wrong domain.
 */
export function getAgentAuthMaxAge(): number {
  const configured = Number(process.env.AGENT_AUTH_MAX_AGE_SECONDS)
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 3600
}

/** Tolerance for provider clock skew when checking `exp`, `iat`, and `auth_time`. */
export const AGENT_AUTH_CLOCK_TOLERANCE_SECONDS = 60

/** How long a minted identity assertion is good for, in seconds. */
export const IDENTITY_ASSERTION_TTL_SECONDS = 120

/** How long a first-link claim ceremony stays open, in seconds. */
export const CLAIM_TTL_SECONDS = 600

/** The poll interval an agent is told to respect while a claim is pending. */
export const CLAIM_POLL_INTERVAL_SECONDS = 5

/**
 * Scopes an agent-verified token may ever carry.
 *
 * Deliberately a subset of `oauthScopes`: an agent acting for a user is not
 * the user's browser session, and the identity scopes it omits say so. There
 * is no `openid`, `profile`, or `email`, because this flow already proved the
 * identity out of band and an agent has no business reading the profile back;
 * and no `offline_access`, because the ID-JAG *is* the refresh mechanism —
 * the agent returns to its provider for a new one, which re-checks that the
 * user is still authenticated there. Handing out a refresh token would
 * outlive the very check that makes this flow safe.
 */
export const agentVerifiedScopes = ["skills:read", "skills:write"] as const

export type AgentVerifiedScope = (typeof agentVerifiedScopes)[number]

/** The scopes granted when an agent asks for none. Least privilege: read only. */
export const defaultAgentVerifiedScopes: AgentVerifiedScope[] = ["skills:read"]

/**
 * Narrows a requested scope string to what this flow will actually issue.
 * Unknown and out-of-band scopes are dropped rather than refused, per RFC 6749
 * §3.3, and the granted set is echoed back so an agent can see the difference.
 */
export function resolveAgentVerifiedScopes(requested: readonly string[] | undefined): AgentVerifiedScope[] {
  if (!requested || requested.length === 0) return [...defaultAgentVerifiedScopes]
  const allowed = new Set<string>(agentVerifiedScopes)
  const granted = [...new Set(requested.filter((scope) => allowed.has(scope)))] as AgentVerifiedScope[]
  return granted.length > 0 ? granted : [...defaultAgentVerifiedScopes]
}

/** Every scope named here also exists in the provider's own scope list. */
export function agentVerifiedScopesAreRegistered(): boolean {
  return agentVerifiedScopes.every((scope) => (oauthScopes as readonly string[]).includes(scope))
}

/**
 * Whether an ID-JAG for an email no Skills Board account uses may create one.
 *
 * Off unless an operator turns it on. A Skills Board user is only useful
 * inside a team library, and a silently provisioned account has none — so the
 * default answer to "this verified email is a stranger" is to refuse, not to
 * manufacture an empty account an agent can then act through.
 */
export function allowsJitProvisioning(): boolean {
  return process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING?.trim() === "true"
}

/** The `urn:` assertion type an ID-JAG is presented under. */
export const ID_JAG_ASSERTION_TYPE = "urn:ietf:params:oauth:token-type:id-jag"

/** RFC 7523 grant type the identity assertion is exchanged under. */
export const JWT_BEARER_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer"

/** The `typ` header that marks a token as our own identity assertion. */
export const IDENTITY_ASSERTION_TYP = "application/at+jwt-identity-assertion"
