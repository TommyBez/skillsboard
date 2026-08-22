import type { AuthContext } from "@better-auth/core"
import type { BetterAuthPlugin } from "better-auth"
import { createAuthEndpoint } from "better-auth/api"
import {
  type OAuthProviderExtension,
  extendOAuthProvider,
} from "@better-auth/oauth-provider"
import * as z from "zod"

import {
  AGENT_AUTH_PATHS,
  CLAIM_GRANT,
  ID_JAG_ASSERTION_TYPE,
  JWT_BEARER_GRANT,
  getAgentAudience,
} from "@/lib/agent-auth/config"
import { handleIdentityRequest } from "@/lib/agent-auth/identity"
import { handleClaimGrant, handleJwtBearerGrant } from "@/lib/agent-auth/oauth"
import { signServiceAssertion } from "@/lib/agent-auth/signer"
import type { AgentAuthStore } from "@/lib/agent-auth/store"
import { agentAuthStore } from "@/lib/agent-auth/store-db"
import { createBetterAuthUserResolver } from "@/lib/agent-auth/user-resolver"

/**
 * The auth.md Agent Verified profile, as a Better Auth plugin.
 *
 * It adds two things to the existing authorization server and replaces nothing:
 *
 *  - the `/agent/identity` registration endpoint, which resolves an ID-JAG to a
 *    Better Auth user and hands back a service-signed `identity_assertion`;
 *  - two grants on the provider's own `/oauth2/token`, so the assertion is
 *    exchanged for an ordinary Better Auth access token.
 *
 * Everything else in the profile — the claim endpoint, the SET receiver, the
 * confirmation page, revocation — is served by Next.js routes that talk to the
 * same modules; only the pieces that need Better Auth's signing key and adapter
 * live in here.
 */

export type AgentAuthPluginOptions = {
  /**
   * Where the profile's delegation, registration and claim state lives.
   * Defaults to Postgres through the application's Drizzle pool; overridden by
   * the integration tests, which run the real plugin against an in-memory
   * Better Auth instance.
   */
  store?: AgentAuthStore
}

/**
 * Registered once, by identity: `extendOAuthProvider` is idempotent on the same
 * object, so a shared plugin instance across two `betterAuth()` calls does not
 * register the grants twice.
 */
function buildOAuthExtension(store: AgentAuthStore): OAuthProviderExtension {
  return {
    grants: {
      [JWT_BEARER_GRANT]: ({ ctx, provider }) =>
        handleJwtBearerGrant({ ctx, api: provider, store }),
      [CLAIM_GRANT]: ({ ctx, provider }) => handleClaimGrant({ ctx, api: provider, store }),
    },
  }
}

/*
 * Deliberately permissive. Shape errors are answered by `handleIdentityRequest`
 * with the auth.md error vocabulary (`invalid_request`, `anonymous_not_enabled`,
 * and so on), which is what an agent is told to branch on; a schema rejection
 * here would replace those with a validation envelope the profile never
 * describes.
 */
const identityBody = z
  .object({
    type: z.string().optional(),
    assertion_type: z.string().optional(),
    assertion: z.string().optional(),
    scope: z.string().optional(),
  })
  .passthrough()

export const agentAuth = (options: AgentAuthPluginOptions = {}) => {
  const store = options.store ?? agentAuthStore
  const oauthExtension = buildOAuthExtension(store)

  return {
    id: "agent-auth",

    init(ctx: AuthContext) {
      extendOAuthProvider(ctx, oauthExtension)
    },

    endpoints: {
      agentIdentity: createAuthEndpoint(
        AGENT_AUTH_PATHS.identity,
        {
          method: "POST",
          body: identityBody,
          metadata: {
            openapi: {
              operationId: "agentIdentity",
              description:
                "auth.md agent registration. Accepts an ID-JAG from a trusted Agent Provider and returns a service-signed identity_assertion to exchange at the token endpoint.",
            },
          },
        },
        async (ctx) => {
          const result = await handleIdentityRequest(ctx.body, {
            store,
            users: createBetterAuthUserResolver(ctx),
            audience: getAgentAudience(),
            sign: (input) => signServiceAssertion(ctx, input),
          })

          /*
           * Status and headers go through `setStatus`/`setHeader` rather than
           * the second argument of `ctx.json`. Better Auth dispatches endpoints
           * with `asResponse: false` and builds the HTTP response afterwards
           * from the context, so a router-response argument here would be
           * dropped and every answer — including the two 401s the profile
           * depends on — would leave as a 200.
           */
          ctx.setStatus(result.status)
          // Registration responses carry claim tokens and assertions; no cache,
          // anywhere, ever.
          ctx.setHeader("Cache-Control", "no-store")
          ctx.setHeader("Pragma", "no-cache")
          for (const [name, value] of Object.entries(result.headers ?? {})) {
            ctx.setHeader(name, value)
          }

          return ctx.json(result.body)
        },
      ),
    },
  } satisfies BetterAuthPlugin
}

export { ID_JAG_ASSERTION_TYPE }
