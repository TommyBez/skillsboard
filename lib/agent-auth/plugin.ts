import { extendOAuthProvider } from "@better-auth/oauth-provider"
import type { BetterAuthPlugin } from "better-auth"
import { APIError } from "better-auth/api"

import {
  getAgentAudience,
  JWT_BEARER_GRANT_TYPE,
} from "@/lib/agent-auth/config"
import { findActiveDelegationById, touchDelegation } from "@/lib/agent-auth/delegations"
import { AgentAuthError } from "@/lib/agent-auth/errors"
import { consumeIdentityAssertion } from "@/lib/agent-auth/identity-assertion"

/**
 * auth.md Agent Verified, expressed as one extra grant on the existing OAuth
 * provider.
 *
 * The whole point of doing it this way is that there is no second token
 * system. `/agent/identity` decides *who* the agent is acting for and hands
 * back a two-minute assertion; this grant turns that assertion into an
 * ordinary Better Auth access token through `provider.issueTokens`, so the
 * token is stored, introspected, audience-bound, and revoked by exactly the
 * same code as a token from the browser consent flow. Every protected endpoint
 * downstream stays unaware that auth.md exists.
 */
export function authMdAgentVerified() {
  return {
    id: "auth-md-agent-verified",
    init(ctx) {
      extendOAuthProvider(ctx, {
        grants: {
          [JWT_BEARER_GRANT_TYPE]: async ({ ctx: endpointContext, provider }) => {
            const body = (endpointContext.body ?? {}) as Record<string, unknown>

            let verified
            try {
              verified = await consumeIdentityAssertion(body.assertion)
            } catch (error) {
              throw toApiError(error)
            }

            // Client authentication, delegated whole. It verifies the secret
            // (or accepts a registered public client), checks the client is
            // enabled, narrows the requested scopes against the client's
            // registered ceiling, and enforces that the client registered for
            // this grant type at all.
            const authenticated = await provider.authenticateClient({
              scopes: verified.scopes,
              // The ID-JAG was the credential at `/agent/identity`; a public
              // agent client with no secret is legitimate here. A client that
              // registered as confidential still has to present its secret —
              // that check lives inside `authenticateClient`.
              requireCredentials: false,
            })

            // The binding that makes the assertion safe to hand to an agent.
            // It was minted for one client; another client presenting it —
            // including one that captured it in transit — gets nothing.
            if (authenticated.clientId !== verified.clientId) {
              throw new APIError("BAD_REQUEST", {
                error: "invalid_grant",
                error_description: "This identity assertion was issued for a different client.",
              })
            }

            // Checked here rather than only at mint time, because revocation
            // can land in the two minutes between the two steps and this is
            // the step that produces the credential.
            const delegation = await findActiveDelegationById(verified.delegationId)
            if (!delegation || delegation.userId !== verified.userId) {
              throw new APIError("BAD_REQUEST", {
                error: "invalid_grant",
                error_description: "This delegation is no longer active.",
              })
            }

            const user = await endpointContext.context.internalAdapter.findUserById(verified.userId)
            if (!user) {
              throw new APIError("BAD_REQUEST", {
                error: "invalid_grant",
                error_description: "The delegated account no longer exists.",
              })
            }

            await touchDelegation(delegation.id)

            const resource = getAgentAudience()

            return provider.issueTokens({
              client: authenticated.client,
              user,
              scopes: verified.scopes,
              resources: [resource],
              originalResources: [resource],
              // The provider's word on when the human last authenticated. It
              // came from the ID-JAG's `auth_time`, so a resource that cares
              // about freshness reads the provider's answer, not ours.
              ...(verified.authTime ? { authTime: new Date(verified.authTime * 1000) } : {}),
              confirmation: authenticated.confirmation,
              accessTokenClaims: {
                // Provenance, so a token minted through auth.md is
                // distinguishable in an audit without changing how it is
                // validated.
                agent_provider: verified.providerIssuer,
                agent_subject: verified.providerSubject,
                delegation_id: delegation.id,
              },
            })
          },
        },
      })
    },
  } satisfies BetterAuthPlugin
}

/** Maps an `AgentAuthError` onto the OAuth error the token endpoint returns. */
function toApiError(error: unknown): APIError {
  if (error instanceof AgentAuthError) {
    return new APIError(error.status === 401 ? "UNAUTHORIZED" : "BAD_REQUEST", {
      error: error.code,
      error_description: error.description,
    })
  }

  console.error("Unexpected failure in the jwt-bearer grant", {
    name: error instanceof Error ? error.name : "UnknownError",
  })
  return new APIError("INTERNAL_SERVER_ERROR", {
    error: "server_error",
    error_description: "The assertion could not be exchanged.",
  })
}
