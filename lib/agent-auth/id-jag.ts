import { decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose"

import {
  acceptedAgentAudiences,
  AGENT_AUTH_CLOCK_TOLERANCE_SECONDS,
  findTrustedAgentProvider,
  getAgentAuthMaxAge,
  normalizeAgentAudience,
  type TrustedAgentProvider,
} from "@/lib/agent-auth/config"
import { AgentAuthError } from "@/lib/agent-auth/errors"
import { getProviderKeySource } from "@/lib/agent-auth/jwks"
import { consumeAssertionId } from "@/lib/agent-auth/replay"

/**
 * An ID-JAG this deployment has fully verified.
 *
 * Nothing in here is readable before verification succeeds. The `iss` is read
 * unverified exactly once, to pick a trust-list entry — and that entry, not
 * the token, supplies every key and constraint the verification then uses.
 */
export interface VerifiedIdJag {
  provider: TrustedAgentProvider
  issuer: string
  subject: string
  audience: string
  jti: string
  email?: string
  emailVerified: boolean
  phoneNumber?: string
  phoneNumberVerified: boolean
  authTime: number
  expiresAt: Date
  clientId?: string
  raw: JWTPayload
}

/**
 * The single-use `jti` store, injectable so the verification rules can be
 * exercised without a database. Production always uses `consumeAssertionId`;
 * nothing but a test ever passes anything else.
 */
export type ConsumeAssertionId = typeof consumeAssertionId

export async function verifyIdJag(
  assertion: unknown,
  { consume = consumeAssertionId }: { consume?: ConsumeAssertionId } = {},
): Promise<VerifiedIdJag> {
  if (typeof assertion !== "string" || assertion.split(".").length !== 3) {
    throw new AgentAuthError("invalid_request", "assertion must be a signed JWT.")
  }

  // Unverified reads, and the only two the token gets: the algorithm we are
  // about to constrain, and the issuer that selects which key source and which
  // constraints apply. Everything after this point is checked against the
  // trust-list entry, never against the token's own claims about itself.
  let header: ReturnType<typeof decodeProtectedHeader>
  try {
    header = decodeProtectedHeader(assertion)
  } catch {
    throw new AgentAuthError("invalid_grant", "The assertion header could not be read.")
  }

  const claimedIssuer = readUnverifiedIssuer(assertion)
  const provider = findTrustedAgentProvider(claimedIssuer)
  if (!provider) {
    // Same message for "unknown issuer" and "malformed issuer": which agent
    // providers a deployment trusts is not something an unauthenticated caller
    // gets to enumerate one probe at a time.
    throw new AgentAuthError("invalid_grant", "The assertion issuer is not a trusted agent provider.")
  }

  if (!header.alg || !provider.allowedAlgorithms.includes(header.alg)) {
    throw new AgentAuthError(
      "invalid_grant",
      `The assertion is signed with an algorithm ${provider.displayName} is not trusted for.`,
    )
  }

  let payload: JWTPayload
  try {
    // `jwtVerify` enforces iss, aud, exp, nbf and the algorithm allowlist
    // against the provider's published keys, so a token minted for another
    // service fails here, before any claim is read.
    // `audience` is the full accepted list because `jose` matches the token's
    // `aud` against every value given; `normalizeAgentAudience` below collapses
    // whichever one matched back to the single canonical audience we store.
    const verified = await jwtVerify(assertion, getProviderKeySource(provider), {
      issuer: provider.issuer,
      audience: acceptedAgentAudiences(),
      algorithms: provider.allowedAlgorithms,
      clockTolerance: AGENT_AUTH_CLOCK_TOLERANCE_SECONDS,
      requiredClaims: ["iss", "sub", "aud", "exp", "iat", "jti"],
    })
    payload = verified.payload
  } catch (error) {
    if (error instanceof AgentAuthError) throw error
    throw new AgentAuthError(
      "invalid_grant",
      "The assertion signature, audience, or lifetime did not verify.",
    )
  }

  const audience = normalizeAgentAudience(payload.aud)
  if (!audience) {
    throw new AgentAuthError("invalid_target", "The assertion was not issued for this service.")
  }

  const subject = typeof payload.sub === "string" ? payload.sub.trim() : ""
  if (!subject) {
    throw new AgentAuthError("invalid_grant", "The assertion carries no subject.")
  }

  const jti = typeof payload.jti === "string" ? payload.jti.trim() : ""
  if (!jti) {
    throw new AgentAuthError("invalid_grant", "The assertion carries no jti.")
  }

  const now = Math.floor(Date.now() / 1000)

  const issuedAt = numericClaim(payload.iat)
  if (issuedAt === undefined) {
    throw new AgentAuthError("invalid_grant", "The assertion carries no iat.")
  }
  if (issuedAt > now + AGENT_AUTH_CLOCK_TOLERANCE_SECONDS) {
    throw new AgentAuthError("invalid_grant", "The assertion was issued in the future.")
  }

  const expiresAtSeconds = numericClaim(payload.exp)
  if (expiresAtSeconds === undefined) {
    throw new AgentAuthError("invalid_grant", "The assertion carries no exp.")
  }

  // `auth_time` is the whole point of Agent Verified: it is the provider
  // attesting when the human last proved they were there. A token without it
  // asserts an identity with no freshness behind it.
  const authTime = numericClaim(payload.auth_time)
  if (authTime === undefined) {
    throw new AgentAuthError(
      "login_required",
      "The assertion carries no auth_time, so the user's authentication cannot be dated.",
    )
  }
  if (authTime > now + AGENT_AUTH_CLOCK_TOLERANCE_SECONDS) {
    throw new AgentAuthError("invalid_grant", "The assertion reports a future auth_time.")
  }
  if (now - authTime > getAgentAuthMaxAge() + AGENT_AUTH_CLOCK_TOLERANCE_SECONDS) {
    // Not ours to fix. The user authenticated at the agent provider too long
    // ago, so the provider has to re-authenticate them and mint a new ID-JAG;
    // our own OTP would prove something about a different session entirely.
    throw new AgentAuthError(
      "login_required",
      `The user's authentication at ${provider.displayName} is older than ${getAgentAuthMaxAge()} seconds.`,
      { max_age: getAgentAuthMaxAge(), auth_time: authTime },
    )
  }

  const email = readEmail(payload.email)
  const emailVerified = payload.email_verified === true
  const phoneNumber = typeof payload.phone_number === "string" ? payload.phone_number.trim() : undefined
  const phoneNumberVerified = payload.phone_number_verified === true

  // A bare `email` claim proves nothing: the provider has to say it verified
  // it. Without a verified identifier there is nothing to resolve a user from
  // that is safe to act on.
  if (!(emailVerified && email) && !(phoneNumberVerified && phoneNumber)) {
    throw new AgentAuthError(
      "invalid_grant",
      "The assertion carries no verified email address or phone number.",
    )
  }

  const expiresAt = new Date(expiresAtSeconds * 1000)

  // Burned last, once every other check has passed. Burning it earlier would
  // let a malformed replay of a *valid* assertion spend the real one's jti and
  // lock the agent out of a token it is entitled to.
  const fresh = await consume({ issuer: provider.issuer, jti, expiresAt })
  if (!fresh) {
    throw new AgentAuthError("invalid_grant", "This assertion has already been used.")
  }

  return {
    provider,
    issuer: provider.issuer,
    subject,
    audience,
    jti,
    email,
    emailVerified,
    phoneNumber,
    phoneNumberVerified,
    authTime,
    expiresAt,
    clientId: typeof payload.client_id === "string" ? payload.client_id : undefined,
    raw: payload,
  }
}

function readUnverifiedIssuer(assertion: string): string | undefined {
  try {
    const [, payloadSegment] = assertion.split(".")
    const decoded = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as unknown
    if (!decoded || typeof decoded !== "object") return undefined
    const issuer = (decoded as Record<string, unknown>).iss
    return typeof issuer === "string" ? issuer : undefined
  } catch {
    return undefined
  }
}

function numericClaim(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function readEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().toLowerCase()
  return trimmed.includes("@") ? trimmed : undefined
}
