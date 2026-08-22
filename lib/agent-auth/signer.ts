import type { GenericEndpointContext } from "@better-auth/core"
import { signJWT } from "better-auth/plugins"
import { createLocalJWKSet, decodeProtectedHeader, jwtVerify, type JSONWebKeySet } from "jose"
import { randomUUID } from "node:crypto"
import { desc } from "drizzle-orm"

import { ID_JAG_TYP, agentAuthConfig, getServiceIssuer } from "@/lib/agent-auth/config"
import { db } from "@/lib/db"
import { jwks as jwksTable } from "@/lib/db/schema"

/**
 * Service-signed `identity_assertion` handling.
 *
 * The reference implementation keeps its own ES256 key on disk. Here the
 * signing key is Better Auth's JWKS — the same keys that sign access tokens and
 * that `/api/auth/jwks` already publishes — so this deployment gains no second
 * key store, and an operator rotating Better Auth's keys rotates these too.
 */

export type ServiceAssertionClaims = {
  iss: string
  sub: string
  aud: string
  jti: string
  exp: number
  iat: number
  email?: string
  email_verified?: boolean
  amr?: string[]
  /** Scopes the registration was authorized for when the assertion was minted. */
  scope?: string
  /** The delegation this assertion speaks for, for revocation at exchange time. */
  agent_delegation_id?: string
}

export type ServiceAssertionError = {
  code: "invalid_request" | "invalid_signature" | "expired" | "invalid_audience"
  message: string
}

/**
 * Mints the assertion the agent exchanges at the token endpoint.
 *
 * `sub` is the registration id, exactly as in the reference: the token endpoint
 * resolves it back to the registration's current state, so a delegation revoked
 * between minting and exchange still stops the exchange.
 */
export async function signServiceAssertion(
  ctx: GenericEndpointContext,
  input: {
    registrationId: string
    delegationId?: string | null
    scopes: readonly string[]
    email?: string | null
    emailVerified?: boolean | null
    amr?: string[] | null
  },
): Promise<{ jwt: string; jti: string; expiresAt: Date }> {
  const issuedAt = Math.floor(Date.now() / 1000)
  const ttl = agentAuthConfig.serviceAssertionTtlSeconds
  const jti = `jti_${randomUUID()}`

  const payload: Record<string, unknown> = {
    iss: getServiceIssuer(),
    sub: input.registrationId,
    aud: getServiceIssuer(),
    jti,
    iat: issuedAt,
    exp: issuedAt + ttl,
    scope: [...input.scopes].join(" "),
  }
  if (input.email) payload.email = input.email
  if (input.emailVerified !== undefined && input.emailVerified !== null) {
    payload.email_verified = input.emailVerified
  }
  if (input.amr?.length) payload.amr = input.amr
  if (input.delegationId) payload.agent_delegation_id = input.delegationId

  const jwt = await signJWT(ctx, { payload, header: { typ: ID_JAG_TYP } })
  return { jwt, jti, expiresAt: new Date((issuedAt + ttl) * 1000) }
}

/** Where the public half of the service key set comes from. */
export type ServiceJwksSource = () => Promise<JSONWebKeySet>

/** Better Auth's own default grace window for retired keys. */
const JWKS_GRACE_PERIOD_MS = 3600 * 24 * 30 * 1000

type JwksRow = {
  id: string
  publicKey: string
  alg?: string | null
  crv?: string | null
  expiresAt?: Date | string | null
}

function toJwksDocument(rows: JwksRow[]): JSONWebKeySet {
  const now = Date.now()
  return {
    keys: rows
      .filter((row) => {
        if (!row.expiresAt) return true
        const expiresAt = row.expiresAt instanceof Date ? row.expiresAt : new Date(row.expiresAt)
        return expiresAt.getTime() + JWKS_GRACE_PERIOD_MS > now
      })
      .map((row) => ({
        alg: row.alg ?? "EdDSA",
        ...(row.crv ? { crv: row.crv } : {}),
        ...(JSON.parse(row.publicKey) as Record<string, unknown>),
        kid: row.id,
      })),
  }
}

/**
 * Reads the key set through Better Auth's own adapter. Preferred wherever a
 * request context exists, so verification sees exactly the rows the `jwt`
 * plugin wrote, through the same adapter that wrote them.
 */
export function serviceJwksFromContext(ctx: GenericEndpointContext): ServiceJwksSource {
  return async () => {
    const rows = (await ctx.context.adapter.findMany({ model: "jwks" })) as JwksRow[]
    return toJwksDocument(rows ?? [])
  }
}

/**
 * The public half of Better Auth's JWKS, read straight from the table the `jwt`
 * plugin owns rather than fetched over HTTP. Same document `/api/auth/jwks`
 * serves — this just avoids a deployment calling itself over the network to
 * verify a token it signed a moment ago. Used where there is no request context
 * to read through, such as the standalone revocation route.
 */
async function loadServiceJwks(source?: ServiceJwksSource): Promise<JSONWebKeySet> {
  if (source) return source()

  return toJwksDocument(
    await db.select().from(jwksTable).orderBy(desc(jwksTable.createdAt)),
  )
}

/**
 * Verifies an assertion this service signed.
 *
 * Kept strict in the same places the reference is strict: the `typ` must be the
 * profile's media type so a plain access token cannot be presented as an
 * assertion, and `iss`/`aud` must both be this authorization server.
 */
export async function verifyServiceAssertion(
  jwt: string,
  options?: { jwks?: ServiceJwksSource },
): Promise<{ ok: true; claims: ServiceAssertionClaims } | { ok: false; error: ServiceAssertionError }> {
  let header
  try {
    header = decodeProtectedHeader(jwt)
  } catch {
    return { ok: false, error: { code: "invalid_request", message: "Malformed JWT header." } }
  }
  if (header.typ !== ID_JAG_TYP) {
    return {
      ok: false,
      error: {
        code: "invalid_request",
        message: `Unexpected typ ${String(header.typ)}; wanted ${ID_JAG_TYP}.`,
      },
    }
  }

  try {
    const keySet = createLocalJWKSet(await loadServiceJwks(options?.jwks))
    const issuer = getServiceIssuer()
    const result = await jwtVerify(jwt, keySet, {
      issuer,
      audience: issuer,
      typ: ID_JAG_TYP,
      clockTolerance: agentAuthConfig.clockSkewSeconds,
      requiredClaims: ["sub", "jti", "exp"],
    })
    return { ok: true, claims: result.payload as unknown as ServiceAssertionClaims }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/expired/i.test(message)) return { ok: false, error: { code: "expired", message } }
    if (/audience/i.test(message)) return { ok: false, error: { code: "invalid_audience", message } }
    return { ok: false, error: { code: "invalid_signature", message } }
  }
}


/**
 * Verifies any JWT this authorization server signed — an access token as
 * readily as an identity assertion — against the same local JWKS.
 *
 * Used by the revocation endpoint, which has to tell an agent's own access
 * token from its identity assertion before deciding what a revocation means,
 * and must not act on a token it cannot prove it issued.
 */
export async function verifyServiceIssuedToken(
  token: string,
  options?: { jwks?: ServiceJwksSource },
): Promise<{ ok: true; payload: Record<string, unknown>; typ?: string } | { ok: false }> {
  let header
  try {
    header = decodeProtectedHeader(token)
  } catch {
    return { ok: false }
  }

  try {
    const keySet = createLocalJWKSet(await loadServiceJwks(options?.jwks))
    const result = await jwtVerify(token, keySet, {
      issuer: getServiceIssuer(),
      clockTolerance: agentAuthConfig.clockSkewSeconds,
    })
    return {
      ok: true,
      payload: result.payload as unknown as Record<string, unknown>,
      typ: typeof header.typ === "string" ? header.typ : undefined,
    }
  } catch {
    return { ok: false }
  }
}
