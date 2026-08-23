import { createHash, randomUUID } from "node:crypto"
import { hkdfSync } from "node:crypto"

import { jwtVerify, SignJWT, type JWTPayload } from "jose"

import {
  AGENT_AUTH_CLOCK_TOLERANCE_SECONDS,
  agentVerifiedScopes,
  getAgentAudience,
  IDENTITY_ASSERTION_TTL_SECONDS,
  IDENTITY_ASSERTION_TYP,
  type AgentVerifiedScope,
} from "@/lib/agent-auth/config"
import { AgentAuthError } from "@/lib/agent-auth/errors"
import { getAuthorizationServerIssuer } from "@/lib/agent-discovery"
import { consumeAssertionId } from "@/lib/agent-auth/replay"

/**
 * The identity assertion is signed with a key derived from
 * `BETTER_AUTH_SECRET`, not with the JWKS the `jwt` plugin publishes.
 *
 * It is symmetric on purpose. This token has exactly one issuer and exactly
 * one audience — us, at our own token endpoint — and nothing outside this
 * deployment ever needs to verify it. Signing it with the published key pair
 * would put a token that grants access on the same verification path as the
 * ID tokens relying parties already trust, and the only thing telling them
 * apart would be a `typ` header. A separate key that no one else holds makes
 * that confusion structurally impossible.
 *
 * HKDF with a distinct `info` label means this key cannot collide with any
 * other use of the same secret, present or future.
 */
function signingKey(): Uint8Array {
  const secret = process.env.BETTER_AUTH_SECRET?.trim()
  if (!secret) {
    throw new AgentAuthError(
      "server_error",
      "This deployment is not configured to issue identity assertions.",
    )
  }

  return new Uint8Array(
    hkdfSync(
      "sha256",
      Buffer.from(secret, "utf8"),
      Buffer.from("skillsboard/agent-auth", "utf8"),
      Buffer.from("auth.md identity assertion v1", "utf8"),
      32,
    ),
  )
}

export interface IdentityAssertionInput {
  userId: string
  delegationId: string
  clientId: string
  scopes: readonly AgentVerifiedScope[]
  providerIssuer: string
  providerSubject: string
  authTime: number
}

export interface MintedIdentityAssertion {
  assertion: string
  expiresAt: Date
  scopes: AgentVerifiedScope[]
}

/**
 * Mints the short-lived assertion `/agent/identity` hands back.
 *
 * Deliberately not an access token. The identity flow proves *who* the agent
 * is acting for; minting the credential is the token endpoint's job, and
 * keeping those apart is what lets the token endpoint stay the single place
 * that issues, records, and revokes access — including for this flow.
 */
export async function mintIdentityAssertion(
  input: IdentityAssertionInput,
): Promise<MintedIdentityAssertion> {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expires = issuedAt + IDENTITY_ASSERTION_TTL_SECONDS
  const scopes = [...input.scopes]

  const assertion = await new SignJWT({
    scope: scopes.join(" "),
    client_id: input.clientId,
    delegation_id: input.delegationId,
    provider_iss: input.providerIssuer,
    provider_sub: input.providerSubject,
    auth_time: input.authTime,
  })
    .setProtectedHeader({ alg: "HS256", typ: IDENTITY_ASSERTION_TYP })
    .setIssuer(getAuthorizationServerIssuer())
    // The token endpoint is the audience, and the only one. An assertion
    // presented anywhere else fails the audience check rather than being
    // accepted by an endpoint that was not expecting it.
    .setAudience(tokenEndpointAudience())
    .setSubject(input.userId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expires)
    .setJti(randomUUID())
    .sign(signingKey())

  return { assertion, expiresAt: new Date(expires * 1000), scopes }
}

export interface VerifiedIdentityAssertion {
  userId: string
  delegationId: string
  clientId: string
  scopes: AgentVerifiedScope[]
  providerIssuer: string
  providerSubject: string
  authTime?: number
  /** What `spendIdentityAssertion` needs to burn this assertion exactly once. */
  issuer: string
  jti: string
  expiresAt: Date
  payload: JWTPayload
}

/**
 * Verifies an identity assertion without spending it.
 *
 * Verification and consumption are two steps on purpose: the token endpoint
 * runs recoverable checks after this one — client authentication, the client
 * binding, the delegation's liveness — and a failure there must leave the
 * assertion usable for a corrected retry. Only the caller that has passed
 * every check spends the `jti`, via `spendIdentityAssertion`, immediately
 * before minting.
 */
export async function verifyIdentityAssertion(
  assertion: unknown,
): Promise<VerifiedIdentityAssertion> {
  if (typeof assertion !== "string" || assertion.split(".").length !== 3) {
    throw new AgentAuthError("invalid_grant", "assertion must be a signed JWT.")
  }

  const issuer = getAuthorizationServerIssuer()

  let payload: JWTPayload
  try {
    const verified = await jwtVerify(assertion, signingKey(), {
      issuer,
      audience: tokenEndpointAudience(),
      algorithms: ["HS256"],
      typ: IDENTITY_ASSERTION_TYP,
      clockTolerance: AGENT_AUTH_CLOCK_TOLERANCE_SECONDS,
      requiredClaims: ["iss", "sub", "aud", "exp", "jti"],
    })
    payload = verified.payload
  } catch (error) {
    if (error instanceof AgentAuthError) throw error
    throw new AgentAuthError("invalid_grant", "The identity assertion did not verify.")
  }

  const userId = typeof payload.sub === "string" ? payload.sub : ""
  const delegationId = typeof payload.delegation_id === "string" ? payload.delegation_id : ""
  const clientId = typeof payload.client_id === "string" ? payload.client_id : ""
  const jti = typeof payload.jti === "string" ? payload.jti : ""
  const expiresAt = typeof payload.exp === "number" ? new Date(payload.exp * 1000) : undefined

  if (!userId || !delegationId || !clientId || !jti || !expiresAt) {
    throw new AgentAuthError("invalid_grant", "The identity assertion is missing required claims.")
  }

  const declared = typeof payload.scope === "string" ? payload.scope.split(" ").filter(Boolean) : []
  const allowed = new Set<string>(agentVerifiedScopes)
  const scopes = declared.filter((scope) => allowed.has(scope)) as AgentVerifiedScope[]
  if (scopes.length === 0) {
    throw new AgentAuthError("invalid_scope", "The identity assertion authorizes no usable scope.")
  }

  return {
    userId,
    delegationId,
    clientId,
    scopes,
    providerIssuer: typeof payload.provider_iss === "string" ? payload.provider_iss : "",
    providerSubject: typeof payload.provider_sub === "string" ? payload.provider_sub : "",
    authTime: typeof payload.auth_time === "number" ? payload.auth_time : undefined,
    issuer,
    jti,
    expiresAt,
    payload,
  }
}

/**
 * Burns a verified assertion's `jti`, failing if it was already spent.
 *
 * Single-use through the same tombstone table the ID-JAG uses, keyed by our
 * own issuer so the two namespaces cannot collide. Without it a captured
 * assertion could be exchanged repeatedly for the whole two minutes it lives.
 */
export async function spendIdentityAssertion(
  verified: VerifiedIdentityAssertion,
  { consume = consumeAssertionId }: { consume?: typeof consumeAssertionId } = {},
): Promise<void> {
  const fresh = await consume({
    issuer: verified.issuer,
    jti: verified.jti,
    expiresAt: verified.expiresAt,
  })
  if (!fresh) {
    throw new AgentAuthError("invalid_grant", "This identity assertion has already been exchanged.")
  }
}

/** Verify and spend in one step, for callers with no checks in between. */
export async function consumeIdentityAssertion(
  assertion: unknown,
  options: { consume?: typeof consumeAssertionId } = {},
): Promise<VerifiedIdentityAssertion> {
  const verified = await verifyIdentityAssertion(assertion)
  await spendIdentityAssertion(verified, options)
  return verified
}

/**
 * The audience an identity assertion is bound to.
 *
 * The protected resource, which is also the `resource` the exchanged access
 * token ends up audience-bound to, so the assertion and the credential it buys
 * name the same service.
 */
function tokenEndpointAudience(): string {
  return getAgentAudience()
}

/** Constant-shape hash for a claim token, so the plaintext is never stored. */
export function hashClaimToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}
