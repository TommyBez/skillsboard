export const oauthScopes = ["openid", "profile", "email", "skills:read"] as const

export const oauthScopeDescriptions: Record<string, string> = {
  openid: "Confirm your Skills Board identity",
  profile: "View your name and basic profile",
  email: "View your email address",
  "skills:read": "View and search saved skills, public skills, and install commands",
}
