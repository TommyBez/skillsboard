import type { AgentAuthStore, AgentDelegationRecord } from "@/lib/agent-auth/store"
import type { AgentUser, AgentUserResolver } from "@/lib/agent-auth/user-resolver"
import type { TrustedProvider } from "@/lib/agent-auth/trust"
import type { IdJagClaims } from "@/lib/agent-auth/verify"

/**
 * Resolving a verified ID-JAG to a Better Auth user — the port of
 * `agent-services/src/matcher.ts`, with this application's user store behind the
 * {@link AgentUserResolver} boundary.
 */
export type MatchResult =
  /** A live delegation, or a JIT-provisioned account. Safe to bind credentials. */
  | { kind: "match"; user: AgentUser; via: "delegation" | "jit"; delegation: AgentDelegationRecord }
  /**
   * The assertion's verified email matched an account, but no delegation exists
   * for this `(iss, sub, aud)` — or the one that existed was revoked. A human
   * has to confirm the link before anything is issued.
   */
  | { kind: "step_up_required"; via: "email"; matchedUser: AgentUser }
  /** Nobody matched and this deployment does not provision accounts for agents. */
  | { kind: "registration_not_allowed" }

/**
 * Whether an unknown identity may create a Skills Board account.
 *
 * Off by default here, unlike the reference demo. A Skills Board user is only
 * useful inside a team library, and an agent has no way to be invited into one,
 * so a JIT account would be an orphan row created by an unattended process. An
 * operator who wants the reference's behavior sets the variable.
 */
export function isJitProvisioningAllowed(): boolean {
  return process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING === "true"
}

export async function matchOrProvision(input: {
  claims: IdJagClaims
  provider: TrustedProvider
  store: AgentAuthStore
  users: AgentUserResolver
  audience: string
}): Promise<MatchResult> {
  const { claims, provider, store, users, audience } = input
  const key = { issuer: claims.iss, subject: claims.sub, audience }

  const existing = await store.findDelegation(key)
  /*
   * A revoked delegation is deliberately treated as *absent*, not as a hard
   * error: it can never resolve to a user, so no credential is issued for it,
   * but a fresh ID-JAG plus a completed confirmation ceremony can legitimately
   * re-establish the link — the same recovery path the reference allows after a
   * provider-pushed revocation.
   */
  if (existing && !existing.revokedAt) {
    const user = await users.findUserById(existing.userId)
    if (user) {
      await store.touchDelegation(existing.id)
      return { kind: "match", user, via: "delegation", delegation: existing }
    }
    // The Better Auth user is gone (account deleted). The delegation points at
    // nothing; fall through to matching, which will require confirmation.
  }

  /*
   * An email or phone match is never enough on its own. Without this gate any
   * trusted provider could mint an ID-JAG carrying a victim's verified address
   * and take over that account here silently. Phone is included for parity with
   * the reference even though Better Auth holds no phone identity in this
   * deployment — a phone-verified assertion with no email simply finds nobody
   * and falls through to the registration policy.
   */
  if (claims.email && claims.email_verified) {
    const byEmail = await users.findVerifiedUserByEmail(claims.email)
    if (byEmail) return { kind: "step_up_required", via: "email", matchedUser: byEmail }
  }

  if (!isJitProvisioningAllowed()) return { kind: "registration_not_allowed" }

  // JIT provisioning requires a verified email: an account keyed on an
  // unverified identifier could later be claimed by whoever proves that address.
  if (!claims.email || !claims.email_verified) return { kind: "registration_not_allowed" }

  const created = await users.createUser({ email: claims.email, name: claims.name })
  const delegation = await store.upsertDelegation({
    userId: created.id,
    issuer: claims.iss,
    subject: claims.sub,
    audience,
    providerName: provider.displayName,
  })
  return { kind: "match", user: created, via: "jit", delegation }
}
