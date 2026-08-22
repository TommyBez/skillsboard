import {
  AGENT_AUTH_PATHS,
  ID_JAG_ASSERTION_TYPE,
  agentAuthConfig,
  agentAuthUrl,
} from "@/lib/agent-auth/config"
import { matchOrProvision } from "@/lib/agent-auth/matcher"
import {
  type CeremonyMaterial,
  findOrCreateIdJagRegistration,
  reissueCeremony,
} from "@/lib/agent-auth/registration"
import {
  type AgentAuthStore,
  type AgentRegistrationRecord,
  effectiveRegistrationStatus,
  sha256Hex,
} from "@/lib/agent-auth/store"
import { isAgentVerifiedEnabled } from "@/lib/agent-auth/trust"
import type { AgentUserResolver } from "@/lib/agent-auth/user-resolver"
import { type IdJagClaims, type VerifyError, verifyIdJag } from "@/lib/agent-auth/verify"

/**
 * `POST /agent/identity` and `POST /agent/identity/claim`, ported from
 * `agent-services/src/routes/agent-auth.ts`.
 *
 * These functions never issue an access token. The reference separates identity
 * registration from credential issuance on purpose: the endpoint returns a
 * service-signed `identity_assertion`, and the agent has to exchange it at the
 * OAuth token endpoint, which is where the delegation is re-checked.
 */

/** Signs the service assertion. Injected so the protocol stays testable. */
export type ServiceAssertionSigner = (input: {
  registrationId: string
  delegationId: string | null
  scopes: readonly string[]
  email?: string | null
  emailVerified?: boolean | null
  amr?: string[] | null
}) => Promise<{ jwt: string; jti: string; expiresAt: Date }>

/**
 * The statuses this profile answers with, spelled out rather than left as
 * `number`, so the Better Auth endpoint can pass one straight to `setStatus`
 * and a new branch has to name the status it means.
 */
export type AgentAuthStatus = 200 | 202 | 400 | 401 | 403 | 409 | 410

export type AgentAuthResult = {
  status: AgentAuthStatus
  headers?: Record<string, string>
  body: Record<string, unknown>
}

export type IdentityRequestDeps = {
  store: AgentAuthStore
  users: AgentUserResolver
  sign: ServiceAssertionSigner
  audience: string
  now?: Date
}

const SUPPORTED_SCOPES = new Set<string>(agentAuthConfig.scopesSupported)

/**
 * Scopes to bind to a registration. An agent may ask for less than the profile
 * supports; asking for more is an error rather than a silent downgrade, so an
 * agent never believes it holds a permission it does not.
 */
export function resolveRequestedScopes(
  requested: string | undefined,
): { ok: true; scopes: string[] } | { ok: false; invalid: string[] } {
  if (!requested?.trim()) return { ok: true, scopes: [...agentAuthConfig.scopesSupported] }
  const asked = requested.trim().split(/\s+/)
  const invalid = asked.filter((scope) => !SUPPORTED_SCOPES.has(scope))
  if (invalid.length) return { ok: false, invalid }
  return { ok: true, scopes: [...new Set(asked)] }
}

function ceremonyBlock(material: CeremonyMaterial, now: Date): Record<string, unknown> {
  return {
    user_code: material.userCode,
    expires_in: Math.max(
      0,
      Math.floor((material.claim.userCodeExpiresAt.getTime() - now.getTime()) / 1000),
    ),
    verification_uri: buildVerificationUri(material.claimViewTokenPlaintext),
    interval: agentAuthConfig.pollIntervalSeconds,
  }
}

/**
 * Where the human goes. The page behind it requires a Better Auth session and
 * bounces through the ordinary `/sign-in` email-OTP flow when there is none, so
 * the agent never has to know how this application authenticates people.
 */
export function buildVerificationUri(claimViewToken: string): string {
  return agentAuthUrl(
    `${AGENT_AUTH_PATHS.claimConfirmation}?claim_attempt_token=${encodeURIComponent(claimViewToken)}`,
  )
}

function escapeHeaderValue(value: string): string {
  return value.replace(/[\\"]/g, "\\$&")
}

/**
 * `auth_time` failures are the one case a human cannot fix here: the user's
 * session at the Agent Provider is missing or stale, so the agent has to go
 * back there with `prompt=login`. It gets OIDC's `login_required`, which is a
 * different instruction from `interaction_required` — signing in to Skills Board
 * would not help, and must not be offered.
 */
function verifyErrorResult(error: VerifyError): AgentAuthResult {
  if (error.code === "auth_time_missing" || error.code === "auth_time_too_old") {
    return {
      status: 401,
      headers: {
        "WWW-Authenticate": `AgentAuth error="login_required", max_age="${agentAuthConfig.idJagMaxAuthAgeSeconds}", error_description="${escapeHeaderValue(error.message)}"`,
      },
      body: {
        error: "login_required",
        error_description: error.message,
        max_age: agentAuthConfig.idJagMaxAuthAgeSeconds,
      },
    }
  }
  if (error.code === "invalid_issuer") {
    // AUTH.md's error table names this `issuer_not_enabled` — the code an agent
    // is told to branch on when its provider is not on the trust list.
    return {
      status: 400,
      body: { error: "issuer_not_enabled", message: error.message },
    }
  }
  return { status: 400, body: { error: error.code, message: error.message } }
}

export type IdentityRequestBody = {
  type?: unknown
  assertion_type?: unknown
  assertion?: unknown
  scope?: unknown
}

export async function handleIdentityRequest(
  body: IdentityRequestBody,
  deps: IdentityRequestDeps,
): Promise<AgentAuthResult> {
  const now = deps.now ?? new Date()

  if (body?.type !== "identity_assertion") {
    /*
     * Only Agent Verified is implemented. The other two auth.md registration
     * types are declined with the codes AUTH.md defines for a service that
     * opted out, so an agent falls back instead of retrying — and discovery
     * never advertised them in the first place.
     */
    if (body?.type === "anonymous") {
      return {
        status: 400,
        body: {
          error: "anonymous_not_enabled",
          message: "This service issues agent credentials only for a verified user identity.",
        },
      }
    }
    if (body?.type === "service_auth") {
      return {
        status: 400,
        body: {
          error: "service_auth_not_enabled",
          message:
            "This service does not accept email-only agent registration. Present an ID-JAG from a trusted Agent Provider.",
        },
      }
    }
    return {
      status: 400,
      body: {
        error: "invalid_request",
        message: `type must be "identity_assertion".`,
      },
    }
  }

  if (body.assertion_type !== ID_JAG_ASSERTION_TYPE) {
    return {
      status: 400,
      body: {
        error: "invalid_request",
        message: `assertion_type must be ${ID_JAG_ASSERTION_TYPE}.`,
      },
    }
  }
  if (typeof body.assertion !== "string" || body.assertion.length === 0) {
    return { status: 400, body: { error: "invalid_request", message: "assertion is required." } }
  }
  if (body.scope !== undefined && typeof body.scope !== "string") {
    return { status: 400, body: { error: "invalid_request", message: "scope must be a string." } }
  }

  if (!isAgentVerifiedEnabled()) {
    return {
      status: 400,
      body: {
        error: "issuer_not_enabled",
        message: "This deployment has no trusted Agent Providers configured.",
      },
    }
  }

  const scopes = resolveRequestedScopes(body.scope)
  if (!scopes.ok) {
    return {
      status: 400,
      body: {
        error: "invalid_scope",
        message: `Unsupported scope(s): ${scopes.invalid.join(", ")}. Supported: ${agentAuthConfig.scopesSupported.join(", ")}.`,
      },
    }
  }

  const verified = await verifyIdJag(body.assertion, deps.store, {
    now,
    audience: deps.audience,
  })
  if (!verified.ok) return verifyErrorResult(verified.error)

  const { claims, provider } = verified.value
  const match = await matchOrProvision({
    claims,
    provider,
    store: deps.store,
    users: deps.users,
    audience: deps.audience,
  })

  if (match.kind === "registration_not_allowed") {
    return {
      status: 403,
      body: {
        error: "registration_not_allowed",
        message:
          "No Skills Board account matches this identity, and this service does not create accounts for agents. Have the user sign in at Skills Board first, then retry.",
      },
    }
  }

  const key = { issuer: claims.iss, subject: claims.sub, audience: deps.audience }

  if (match.kind === "step_up_required") {
    const result = await findOrCreateIdJagRegistration({
      store: deps.store,
      key,
      context: { email: match.matchedUser.email },
      requestedScopes: scopes.scopes,
      now,
    })
    if (result.kind === "ready") {
      // A concurrent ceremony completed while this request was matching. Answer
      // as the clean-match path would rather than sending the agent round again.
      return issueAssertionResult(result.registration, claims, deps, scopes.scopes)
    }
    return stepUpResult(result, now)
  }

  const result = await findOrCreateIdJagRegistration({
    store: deps.store,
    key,
    context: { user: match.user, delegation: match.delegation },
    requestedScopes: scopes.scopes,
    now,
  })
  if (result.kind !== "ready") {
    throw new Error("a resolved delegation produced a step-up registration")
  }
  return issueAssertionResult(result.registration, claims, deps, scopes.scopes)
}

async function issueAssertionResult(
  registration: AgentRegistrationRecord,
  claims: IdJagClaims,
  deps: IdentityRequestDeps,
  scopes: string[],
): Promise<AgentAuthResult> {
  const assertion = await deps.sign({
    registrationId: registration.id,
    delegationId: registration.delegationId,
    scopes,
    email: claims.email ?? null,
    emailVerified: claims.email_verified ?? null,
    amr: claims.amr ?? null,
  })

  return {
    status: 200,
    body: {
      registration_id: registration.id,
      registration_type: "identity_assertion",
      identity_assertion: assertion.jwt,
      assertion_expires: assertion.expiresAt.toISOString(),
      scopes,
    },
  }
}

function stepUpResult(material: CeremonyMaterial, now: Date): AgentAuthResult {
  return {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'AgentAuth error="interaction_required", error_description="ID-JAG matches an existing Skills Board account; the user must confirm linking this provider identity"',
    },
    body: {
      error: "interaction_required",
      error_description:
        "This ID-JAG matches an existing Skills Board account. Surface the user_code and verification_uri so the user can confirm linking this provider identity to their account.",
      registration_id: material.registration.id,
      registration_type: "identity_assertion",
      claim_url: agentAuthUrl(AGENT_AUTH_PATHS.claim),
      claim_token: material.claimTokenPlaintext,
      claim_token_expires: material.registration.claimTokenExpiresAt?.toISOString(),
      post_claim_scopes: material.registration.requestedScopes,
      claim: ceremonyBlock(material, now),
    },
  }
}

export type ClaimRequestBody = { claim_token?: unknown; email?: unknown }

/**
 * `POST /agent/identity/claim` — re-mints a ceremony whose `user_code` window
 * closed while the outer registration is still live, so the agent can hand the
 * user a fresh code without starting over at `/agent/identity`.
 */
export async function handleClaimInitiation(
  body: ClaimRequestBody,
  deps: Pick<IdentityRequestDeps, "store" | "now">,
): Promise<AgentAuthResult> {
  const now = deps.now ?? new Date()

  if (typeof body?.claim_token !== "string" || !body.claim_token) {
    return { status: 400, body: { error: "invalid_request", message: "claim_token is required." } }
  }
  if (typeof body?.email !== "string" || !body.email.includes("@")) {
    return {
      status: 400,
      body: { error: "invalid_request", message: "email must be an email address." },
    }
  }

  const registration = await deps.store.findRegistrationByClaimTokenHash(sha256Hex(body.claim_token))
  if (!registration) {
    return {
      status: 401,
      body: { error: "invalid_claim_token", message: "The claim token is invalid." },
    }
  }

  const status = effectiveRegistrationStatus(registration, now)
  if (status === "expired" || status === "revoked") {
    return { status: 410, body: { error: "claim_expired", message: "This registration has expired." } }
  }
  if (status === "claimed") {
    return {
      status: 409,
      body: {
        error: "claimed_or_in_flight",
        message: "This registration has already been claimed.",
      },
    }
  }

  /*
   * The email is checked against the one the step-up was minted for, not taken
   * as a new binding. An ID-JAG step-up is already bound to the account the
   * assertion matched; letting the agent re-point the ceremony at another
   * address would hand it the account-takeover the step-up exists to prevent.
   */
  if (
    registration.loginHintEmail &&
    registration.loginHintEmail.toLowerCase() !== body.email.trim().toLowerCase()
  ) {
    return {
      status: 403,
      body: {
        error: "invalid_request",
        message: "This claim was started for a different account.",
      },
    }
  }

  const material = await reissueCeremony({
    store: deps.store,
    registration,
    loginHintEmail: registration.loginHintEmail ?? body.email.trim().toLowerCase(),
    now,
  })

  return {
    status: 200,
    body: {
      registration_id: material.registration.id,
      claim_attempt_id: material.claim.id,
      status: "initiated",
      expires_at: material.claim.viewExpiresAt.toISOString(),
      claim_token: material.claimTokenPlaintext,
      claim_token_expires: material.registration.claimTokenExpiresAt?.toISOString(),
      claim_attempt: ceremonyBlock(material, now),
    },
  }
}
