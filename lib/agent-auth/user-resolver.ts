import type { GenericEndpointContext } from "@better-auth/core"

/**
 * The boundary between the auth.md protocol and this application's identity.
 *
 * The WorkOS reference owns its own `users` Map; Skills Board does not get a
 * second user table. Everything the protocol needs to know about a human comes
 * through this interface, and the only implementation goes to Better Auth's
 * internal adapter — the same path email OTP sign-in uses — so an agent resolves
 * to exactly the `user.id` a browser login would.
 */
export type AgentUser = {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
}

export interface AgentUserResolver {
  /**
   * Looks a user up by a *verified* email address. Returning a user here never
   * authorizes anything on its own: the caller still has to run the first-link
   * ceremony before a delegation exists.
   */
  findVerifiedUserByEmail(email: string): Promise<AgentUser | null>
  findUserById(id: string): Promise<AgentUser | null>
  /** Just-in-time provisioning, used only when the deployment allows it. */
  createUser(input: { email: string; name?: string }): Promise<AgentUser>
}

type BetterAuthUserRow = {
  id: string
  email: string
  emailVerified?: boolean | null
  name?: string | null
}

function toAgentUser(row: BetterAuthUserRow): AgentUser {
  return {
    id: row.id,
    email: row.email,
    emailVerified: Boolean(row.emailVerified),
    name: row.name ?? null,
  }
}

/**
 * Better Auth-backed resolver, bound to one request context.
 *
 * `findVerifiedUserByEmail` filters on `emailVerified` on purpose. An
 * unverified row is an account nobody has proved they own; matching an ID-JAG
 * against it — even to start a confirmation ceremony — would let a provider
 * that asserts a verified address decide which unproven local row it lines up
 * with.
 */
export function createBetterAuthUserResolver(ctx: GenericEndpointContext): AgentUserResolver {
  const internal = ctx.context.internalAdapter

  return {
    async findVerifiedUserByEmail(email) {
      const normalized = email.trim().toLowerCase()
      if (!normalized) return null
      const found = await internal.findUserByEmail(normalized)
      const row = found?.user as BetterAuthUserRow | undefined
      if (!row || !row.emailVerified) return null
      return toAgentUser(row)
    },

    async findUserById(id) {
      const row = (await ctx.context.adapter.findOne({
        model: "user",
        where: [{ field: "id", value: id }],
      })) as BetterAuthUserRow | null
      return row ? toAgentUser(row) : null
    },

    async createUser(input) {
      const email = input.email.trim().toLowerCase()
      const created = (await internal.createUser(
        {
          email,
          // The address is verified — an ID-JAG only reaches provisioning with
          // `email_verified: true`, and the provider is on the trust list.
          emailVerified: true,
          name: input.name ?? "",
        },
        { method: "agent-auth-id-jag" },
      )) as BetterAuthUserRow
      return toAgentUser(created)
    },
  }
}
