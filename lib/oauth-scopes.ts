export const oauthScopes = ["openid", "profile", "email", "offline_access", "skills:read", "skills:write"] as const

export const oauthScopeDescriptions: Record<string, string> = {
  openid: "Confirm your Skills Board identity",
  profile: "View your name and basic profile",
  email: "View your email address",
  offline_access: "Keep access after you close the client",
  "skills:read": "View and search saved skills, collections, public skills, and install commands",
  "skills:write": "Save new skills and organize collections in your team libraries",
}
