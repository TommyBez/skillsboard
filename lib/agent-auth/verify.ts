import { decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose"

import {
  ID_JAG_TYP,
  SECEVENT_TYP,
  agentAuthConfig,
  getAgentAudience,
} from "@/lib/agent-auth/config"
import type { AgentAuthStore } from "@/lib/agent-auth/store"
import {
  type TrustedProvider,
  allowedProviderAlgorithms,
  findTrustedProvider,
  getProviderJwks,
} from "@/lib/agent-auth/trust"

/**
 * ID-JAG verification, ported from the WorkOS reference
 * (`agent-services/src/verify.ts`).
 *
 * The order of checks matters and is kept: trust the issuer before touching the
 * token's key material, verify the signature before believing any claim, then
 * burn the `jti`, then apply the identity and freshness gates. Nothing below
 * reads a key location out of the assertion.
 */

export type VerifyErrorCode =
  | "invalid_issuer"
  | "invalid_signature"
  | "expired"
  | "replay_detected"
  | "invalid_audience"
  | "invalid_client_id"
  | "missing_verified_email"
  | "auth_time_missing"
  | "auth_time_too_old"
  | "invalid_request"

export type VerifyError = { code: VerifyErrorCode; message: string }

export type IdJagClaims = JWTPayload & {
  iss: string
  sub: string
  aud: string
  jti: string
  exp: number
  iat: number
  client_id?: string
  email?: string
  email_verified?: boolean
  phone_number?: string
  phone_number_verified?: boolean
  name?: string
  amr?: string[]
  /**
   * Epoch seconds of the end-user's authentication at the provider. Required:
   * an assertion without it says nothing about when a human was last present.
   */
  auth_time?: number
  agent_platform?: string
  agent_context_id?: string
}

export type VerifiedIdJag = {
  claims: IdJagClaims
  provider: TrustedProvider
}

/**
 * Reads `iss` out of the unverified payload purely to pick a trust-list entry.
 * Nothing else is taken from the token before the signature is checked, and an
 * `iss` that is not on the list ends the request here.
 */
function peekIssuer(jwt: string): string | null {
  const parts = jwt.split(".")
  if (parts.length !== 3 || !parts[1]) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      iss?: unknown
    }
    return typeof payload.iss === "string" ? payload.iss : null
  } catch {
    return null
  }
}

function classifyJoseError(error: unknown): VerifyError {
  const message = error instanceof Error ? error.message : String(error)
  const code = (error as { code?: string } | undefined)?.code
  if (code === "ERR_JWT_EXPIRED" || /"exp" claim timestamp check failed|expired/i.test(message)) {
    return { code: "expired", message }
  }
  if (/"aud" claim|audience/i.test(message)) return { code: "invalid_audience", message }
  if (/"iss" claim|issuer/i.test(message)) return { code: "invalid_issuer", message }
  if (/"typ"|missing required|claim is missing/i.test(message)) {
    return { code: "invalid_request", message }
  }
  return { code: "invalid_signature", message }
}

export async function verifyIdJag(
  jwt: string,
  store: AgentAuthStore,
  options?: { now?: Date; audience?: string },
): Promise<{ ok: true; value: VerifiedIdJag } | { ok: false; error: VerifyError }> {
  const issuer = peekIssuer(jwt)
  const provider = findTrustedProvider(issuer)
  if (!provider) {
    return {
      ok: false,
      error: {
        code: "invalid_issuer",
        message: `Issuer ${issuer ?? "<missing>"} is not in this service's trusted Agent Provider list.`,
      },
    }
  }

  let header
  try {
    header = decodeProtectedHeader(jwt)
  } catch {
    return { ok: false, error: { code: "invalid_request", message: "Malformed JWT header." } }
  }
  if (header.typ && header.typ !== ID_JAG_TYP) {
    return {
      ok: false,
      error: {
        code: "invalid_request",
        message: `Unexpected typ ${String(header.typ)}; wanted ${ID_JAG_TYP}.`,
      },
    }
  }
  // An unsigned or symmetric-algorithm token must never reach key resolution:
  // `alg: none` and HMAC "verification" against a public key are the two
  // classic JWT forgeries, so the allow list is enforced before and during
  // verification.
  if (!header.alg || !allowedProviderAlgorithms.includes(header.alg)) {
    return {
      ok: false,
      error: {
        code: "invalid_signature",
        message: `Unsupported signing algorithm ${String(header.alg)}.`,
      },
    }
  }
  if (!header.kid) {
    return {
      ok: false,
      error: { code: "invalid_signature", message: "ID-JAG must name a kid in its header." },
    }
  }

  const audience = options?.audience ?? getAgentAudience()
  let claims: IdJagClaims
  try {
    const result = await jwtVerify(jwt, getProviderJwks(provider), {
      issuer: provider.issuer,
      audience,
      typ: ID_JAG_TYP,
      algorithms: allowedProviderAlgorithms,
      clockTolerance: agentAuthConfig.clockSkewSeconds,
      requiredClaims: ["iss", "sub", "aud", "exp", "iat", "jti"],
    })
    claims = result.payload as IdJagClaims
  } catch (error) {
    return { ok: false, error: classifyJoseError(error) }
  }

  if (!claims.jti || !claims.sub) {
    return {
      ok: false,
      error: { code: "invalid_request", message: "Missing required claim (jti or sub)." },
    }
  }

  /*
   * `client_id` scoping. The trust list may name the agent applications a
   * provider is allowed to mint for; when it does, a trusted issuer asserting
   * some other client is refused. Left unset, every client of a trusted issuer
   * is accepted — the reference's behavior.
   */
  if (provider.clientIds?.length) {
    if (!claims.client_id || !provider.clientIds.includes(claims.client_id)) {
      return {
        ok: false,
        error: {
          code: "invalid_client_id",
          message: `client_id ${claims.client_id ?? "<missing>"} is not allowed for this Agent Provider.`,
        },
      }
    }
  }

  const now = options?.now ?? new Date()
  const nowSeconds = Math.floor(now.getTime() / 1000)

  /*
   * Burn the `jti` before any further gate. Every rejection past this point is
   * about the assertion's contents, and an agent that could retry the same
   * assertion after a rejection would get unlimited attempts at the checks
   * below. Recorded until the assertion's own expiry plus skew, so the
   * tombstone outlives the token it protects.
   */
  const replay = await store.recordJti(
    claims.jti,
    "id_jag",
    new Date((claims.exp + agentAuthConfig.clockSkewSeconds) * 1000),
  )
  if (replay === "replay") {
    return {
      ok: false,
      error: { code: "replay_detected", message: `ID-JAG jti ${claims.jti} has already been used.` },
    }
  }

  if (!claims.email_verified && !claims.phone_number_verified) {
    return {
      ok: false,
      error: {
        code: "missing_verified_email",
        message: "ID-JAG must assert a verified email address or phone number.",
      },
    }
  }

  /*
   * Freshness of the *provider's* authentication. A recently minted assertion
   * can still describe a login from months ago; this is the check that stops an
   * agent riding a stale upstream session. It is applied to known delegations
   * too — a delegation says who, not how recently.
   */
  if (typeof claims.auth_time !== "number") {
    return {
      ok: false,
      error: { code: "auth_time_missing", message: "ID-JAG must include an auth_time claim." },
    }
  }
  const authAge = nowSeconds - claims.auth_time
  if (authAge > agentAuthConfig.idJagMaxAuthAgeSeconds + agentAuthConfig.clockSkewSeconds) {
    return {
      ok: false,
      error: {
        code: "auth_time_too_old",
        message: `auth_time is ${authAge}s old; max allowed is ${agentAuthConfig.idJagMaxAuthAgeSeconds}s. Re-authenticate at the provider and request a fresh ID-JAG.`,
      },
    }
  }
  /*
   * A future `auth_time` is refused for the same reason the reference refuses
   * it: without this, one bad assertion could claim a login years ahead and
   * sidestep the freshness gate indefinitely.
   */
  if (authAge < -agentAuthConfig.clockSkewSeconds) {
    return {
      ok: false,
      error: {
        code: "auth_time_too_old",
        message: `auth_time is ${-authAge}s in the future; clock skew tolerance is ${agentAuthConfig.clockSkewSeconds}s. Re-mint the ID-JAG with a current auth_time.`,
      },
    }
  }

  return { ok: true, value: { claims, provider } }
}

export type SecEventClaims = JWTPayload & {
  iss: string
  sub: string
  aud: string
  jti: string
  exp?: number
  events: Record<string, unknown>
}

/**
 * RFC 8417 Security Event Token from a trusted provider. Same trust and replay
 * rules as an ID-JAG; the only difference is the media type and the required
 * `events` object.
 */
export async function verifySecEventJwt(
  jwt: string,
  store: AgentAuthStore,
  options?: { audience?: string },
): Promise<
  { ok: true; value: { claims: SecEventClaims; provider: TrustedProvider } } | { ok: false; error: VerifyError }
> {
  const issuer = peekIssuer(jwt)
  const provider = findTrustedProvider(issuer)
  if (!provider) {
    return {
      ok: false,
      error: {
        code: "invalid_issuer",
        message: `Issuer ${issuer ?? "<missing>"} is not in this service's trusted Agent Provider list.`,
      },
    }
  }

  let header
  try {
    header = decodeProtectedHeader(jwt)
  } catch {
    return { ok: false, error: { code: "invalid_request", message: "Malformed JWT header." } }
  }
  if (!header.alg || !allowedProviderAlgorithms.includes(header.alg)) {
    return {
      ok: false,
      error: {
        code: "invalid_signature",
        message: `Unsupported signing algorithm ${String(header.alg)}.`,
      },
    }
  }

  let claims: SecEventClaims
  try {
    const result = await jwtVerify(jwt, getProviderJwks(provider), {
      issuer: provider.issuer,
      audience: options?.audience ?? getAgentAudience(),
      typ: SECEVENT_TYP,
      algorithms: allowedProviderAlgorithms,
      clockTolerance: agentAuthConfig.clockSkewSeconds,
      requiredClaims: ["iss", "sub", "aud", "jti"],
    })
    claims = result.payload as SecEventClaims
  } catch (error) {
    return { ok: false, error: classifyJoseError(error) }
  }

  if (!claims.jti || !claims.sub) {
    return {
      ok: false,
      error: { code: "invalid_request", message: "Missing required claim (jti or sub)." },
    }
  }

  // RFC 8417 §2.1: `events` is required and is a non-empty object keyed by
  // event-type URIs. Anything else leaves the dispatch below nothing to match.
  if (
    typeof claims.events !== "object" ||
    claims.events === null ||
    Array.isArray(claims.events) ||
    Object.keys(claims.events).length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "invalid_request",
        message: "SET must include a non-empty events claim (RFC 8417 §2.1).",
      },
    }
  }

  const replay = await store.recordJti(
    claims.jti,
    "secevent",
    new Date(((claims.exp ?? Math.floor(Date.now() / 1000) + 300) + agentAuthConfig.clockSkewSeconds) * 1000),
  )
  if (replay === "replay") {
    return {
      ok: false,
      error: { code: "replay_detected", message: `SET jti ${claims.jti} has already been used.` },
    }
  }

  return { ok: true, value: { claims, provider } }
}
