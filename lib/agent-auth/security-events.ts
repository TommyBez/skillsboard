import { decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose"

import {
  AGENT_AUTH_CLOCK_TOLERANCE_SECONDS,
  acceptedAgentAudiences,
  findTrustedAgentProvider,
  getAgentAudience,
} from "@/lib/agent-auth/config"
import { AgentAuthError } from "@/lib/agent-auth/errors"
import { getProviderKeySource } from "@/lib/agent-auth/jwks"
import { revokeDelegation, revokeDelegationTokens } from "@/lib/agent-auth/delegations"
import { db } from "@/lib/db"
import { agentConsumedAssertion } from "@/lib/db/schema"

/**
 * How old a SET may be, and equally how long its `jti` tombstone is kept.
 *
 * The two bounds are one number on purpose. A SET carries no `exp`, so the
 * tombstone alone decides how long a replay is remembered — and a token that
 * stayed *acceptable* after its tombstone was pruned could be replayed to
 * revoke a delegation the user has since re-approved. Refusing any event
 * older than the horizon closes that: by the time a tombstone is pruned, the
 * token it guarded is no longer accepted at all.
 */
const SET_MAX_AGE_SECONDS = 24 * 60 * 60

/**
 * Event URIs that mean "this delegation is over".
 *
 * The SSF/CAEP families and the ID-JAG draft's own revocation event all say
 * the same thing in different vocabularies, and a provider picks one. Anything
 * outside this set is acknowledged and ignored rather than refused: an
 * unrecognized event is not an error on the provider's side, and answering it
 * with a 400 would make a well-behaved transmitter retry forever.
 */
const REVOCATION_EVENTS = new Set([
  "https://schemas.openid.net/secevent/oauth/event-type/token-revoked",
  "https://schemas.openid.net/secevent/caep/event-type/token-claims-change",
  "https://schemas.openid.net/secevent/caep/event-type/session-revoked",
  "https://schemas.openid.net/secevent/risc/event-type/account-disabled",
  "https://schemas.openid.net/secevent/risc/event-type/account-purged",
  "https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required",
])

export interface SecurityEventOutcome {
  /** Delegations this event actually revoked. */
  revoked: number
  /** Events recognized as revocations, whether or not a delegation existed. */
  handled: number
  /** Events this deployment does not act on. */
  ignored: number
}

/**
 * Verifies and applies a Security Event Token from a trusted agent provider.
 *
 * The SET is verified against the same trust list and the same JWKS cache an
 * ID-JAG is, for the same reason: a revocation an attacker can forge is worse
 * than no revocation channel at all — it is a denial of service against every
 * agent link on the service.
 */
export async function applySecurityEventToken(token: unknown): Promise<SecurityEventOutcome> {
  if (typeof token !== "string" || token.split(".").length !== 3) {
    throw new AgentAuthError("invalid_request", "The request body must be a signed Security Event Token.")
  }

  const claimedIssuer = readUnverifiedIssuer(token)
  const provider = findTrustedAgentProvider(claimedIssuer)
  if (!provider) {
    throw new AgentAuthError("invalid_client", "The event issuer is not a trusted agent provider.")
  }

  let header: ReturnType<typeof decodeProtectedHeader>
  try {
    header = decodeProtectedHeader(token)
  } catch {
    throw new AgentAuthError("invalid_request", "The event header could not be read.")
  }

  if (!header.alg || !provider.allowedAlgorithms.includes(header.alg)) {
    throw new AgentAuthError(
      "invalid_request",
      `The event is signed with an algorithm ${provider.displayName} is not trusted for.`,
    )
  }

  let payload: JWTPayload
  try {
    const verified = await jwtVerify(token, getProviderKeySource(provider), {
      issuer: provider.issuer,
      audience: acceptedAgentAudiences(),
      algorithms: provider.allowedAlgorithms,
      clockTolerance: AGENT_AUTH_CLOCK_TOLERANCE_SECONDS,
      // Bounds `iat`: see SET_MAX_AGE_SECONDS.
      maxTokenAge: SET_MAX_AGE_SECONDS,
      requiredClaims: ["iss", "aud", "iat", "jti"],
      // RFC 8417 §2.3: a SET is marked as one so it can never be mistaken for,
      // or replayed as, an access or identity token.
      typ: "secevent+jwt",
    })
    payload = verified.payload
  } catch {
    throw new AgentAuthError("invalid_request", "The event signature or audience did not verify.")
  }

  const jti = typeof payload.jti === "string" ? payload.jti : ""
  if (!jti) throw new AgentAuthError("invalid_request", "The event carries no jti.")

  const events = payload.events
  if (!events || typeof events !== "object" || Array.isArray(events)) {
    throw new AgentAuthError("invalid_request", "The event carries no events claim.")
  }

  // Everything checkable is checked before the jti is spent, and the spend
  // shares one transaction with the revocations it authorizes. Split apart,
  // either half fails alone: a tombstone written before a failed revocation
  // turns the transmitter's retry into a 202 that revoked nothing, and a
  // revocation before the tombstone lets a replay re-run it.
  const subjects: string[] = []
  let ignored = 0
  for (const [eventUri, eventBody] of Object.entries(events as Record<string, unknown>)) {
    if (!REVOCATION_EVENTS.has(eventUri)) {
      ignored += 1
      continue
    }
    const subject = readSubject(eventBody, payload, provider.issuer)
    if (!subject) {
      ignored += 1
      continue
    }
    subjects.push(subject)
  }

  const audience = getAgentAudience()

  const outcome = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(agentConsumedAssertion)
      .values({
        issuer: `${provider.issuer}#events`,
        jti,
        expiresAt: new Date(Date.now() + SET_MAX_AGE_SECONDS * 1000),
      })
      .onConflictDoNothing()
      .returning({ jti: agentConsumedAssertion.jti })

    // Delivered twice is the normal case for an at-least-once transmitter,
    // and the correct answer is the same success it got the first time.
    if (inserted.length === 0) return undefined

    const applied: SecurityEventOutcome = { revoked: 0, handled: 0, ignored }
    for (const subject of subjects) {
      applied.handled += 1
      const revoked = await revokeDelegation({ issuer: provider.issuer, subject, audience }, tx)
      if (revoked) {
        await revokeDelegationTokens(revoked.id, tx)
        applied.revoked += 1
      }
    }
    return applied
  })

  return outcome ?? { revoked: 0, handled: 0, ignored: 0 }
}

/**
 * Finds the provider-side subject an event is about.
 *
 * Three shapes are accepted because three specs put it in three places: the
 * per-event `subject`, the top-level `sub_id` (RFC 9493), and a bare `sub`.
 * An `iss_sub` identifier is only honoured when its issuer matches the signer,
 * so a provider cannot revoke another provider's delegations.
 */
function readSubject(
  eventBody: unknown,
  payload: JWTPayload,
  issuer: string,
): string | undefined {
  const candidates = [
    isRecord(eventBody) ? eventBody.subject : undefined,
    payload.sub_id,
    payload.sub,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
    if (!isRecord(candidate)) continue

    if (candidate.format === "iss_sub" || candidate.iss !== undefined) {
      const declared = typeof candidate.iss === "string" ? candidate.iss.replace(/\/$/, "") : ""
      if (declared && declared !== issuer) continue
    }

    const sub = candidate.sub ?? candidate.subject
    if (typeof sub === "string" && sub.trim()) return sub.trim()
  }

  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function readUnverifiedIssuer(token: string): string | undefined {
  try {
    const [, payloadSegment] = token.split(".")
    const decoded = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as unknown
    if (!isRecord(decoded)) return undefined
    return typeof decoded.iss === "string" ? decoded.iss : undefined
  } catch {
    return undefined
  }
}
