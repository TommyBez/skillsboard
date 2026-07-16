export const oauthScopes = ["openid", "profile", "email", "offline_access", "skills:read"] as const

export const oauthScopeDescriptions: Record<(typeof oauthScopes)[number], string> = {
  openid: "Confirm your Skills Board identity",
  profile: "View your name and basic profile",
  email: "View your email address",
  offline_access: "Keep access after you close the client",
  "skills:read": "View and search saved skills, public skills, and install commands",
}
