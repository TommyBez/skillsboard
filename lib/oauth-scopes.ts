export const oauthScopes = ["openid", "profile", "email", "offline_access", "skills:read", "skills:write"] as const

export const oauthScopeDescriptions: Record<string, string> = {
  openid: "Confirm your Skills Board identity",
  profile: "View your name and basic profile",
  email: "View your email address",
  offline_access: "Keep access after you close the client",
  "skills:read": "View and search saved skills, collections, public skills, and install commands",
  "skills:write": "Save new skills and organize collections in your team libraries",
}

/**
 * Whether an access token carries a scope.
 *
 * Lives beside the scope list rather than inside the MCP route because both the
 * route and the tests that prove a read-only agent token cannot reach a write
 * tool have to agree on exactly one reading of the `scope` claim. The claim is a
 * space-delimited string (RFC 9068 §2.2.3); anything else is no scope at all.
 */
export function tokenHasScope(claims: Record<string, unknown>, scope: string): boolean {
  return typeof claims.scope === "string" && claims.scope.split(" ").includes(scope)
}
