import { IDENTITY_ASSERTION_REVOKED_SCHEMA } from "@/lib/agent-auth/config"
import type { AgentAuthStore } from "@/lib/agent-auth/store"
import type { AgentAuthResult } from "@/lib/agent-auth/identity"
import { type VerifyError, verifySecEventJwt } from "@/lib/agent-auth/verify"

/**
 * `POST /agent/event/notify` — the RFC 8935 push-delivery receiver.
 *
 * A trusted Agent Provider posts a signed Security Event Token here when the
 * upstream identity behind a delegation changes (the user revoked the agent,
 * the account was disabled, and so on). Ported from the reference's SET handler
 * in `agent-services/src/routes/agent-auth.ts`, including its response shape:
 * `202` with no body on success, and `{ err, description }` — not
 * `{ error, message }` — on failure, per RFC 8935 §2.4.
 */

export async function handleSecurityEvent(
  token: string,
  deps: { store: AgentAuthStore; audience: string },
): Promise<AgentAuthResult> {
  const trimmed = token.trim()
  if (!trimmed) {
    return {
      status: 400,
      body: {
        err: "invalid_request",
        description: "Expected a JWT body with Content-Type application/secevent+jwt.",
      },
    }
  }

  const verified = await verifySecEventJwt(trimmed, deps.store, { audience: deps.audience })
  if (!verified.ok) {
    const { err, description } = mapSecEventError(verified.error)
    return { status: 400, body: { err, description } }
  }

  const schemas = Object.keys(verified.value.claims.events)
  if (schemas.includes(IDENTITY_ASSERTION_REVOKED_SCHEMA)) {
    const revoked = await deps.store.revokeDelegation({
      issuer: verified.value.claims.iss,
      subject: verified.value.claims.sub,
      // The SET's `aud` is this service's resource identifier — the same value
      // the delegation was keyed on when the ID-JAG established it.
      audience: deps.audience,
    })
    console.info("Revoked an agent delegation on a provider security event", {
      issuer: verified.value.claims.iss,
      delegations: revoked.delegations,
      registrations: revoked.registrations,
    })
  } else {
    /*
     * RFC 8417 §2.2: unknown event schemas in a well-formed SET are ignored,
     * and the delivery is still acknowledged — the provider did nothing wrong,
     * we simply had nothing to do.
     */
    console.info("Received a security event with no recognized schema", { schemas })
  }

  // RFC 8935 §2.4: 202 Accepted, empty body.
  return { status: 202, body: {} }
}

/** Maps our verifier codes onto the delivery error codes of RFC 8935 §2.4. */
function mapSecEventError(error: VerifyError): { err: string; description: string } {
  switch (error.code) {
    case "invalid_issuer":
      return { err: "invalid_issuer", description: error.message }
    case "invalid_audience":
      return { err: "invalid_audience", description: error.message }
    case "invalid_signature":
    case "expired":
    case "replay_detected":
      return { err: "authentication_failed", description: error.message }
    default:
      return { err: "invalid_request", description: error.message }
  }
}
