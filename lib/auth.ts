import { oauthProvider } from "@better-auth/oauth-provider"
import { betterAuth } from "better-auth"
import { jwt, organization } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

import { pool } from "@/lib/db"
import { oauthScopes } from "@/lib/oauth-scopes"

function getBaseUrl() {
  const explicitUrl = process.env.BETTER_AUTH_URL?.trim()
  if (explicitUrl) return explicitUrl

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (productionHost) return `https://${productionHost}`

  const deploymentHost = process.env.VERCEL_URL?.trim()
  if (deploymentHost) return `https://${deploymentHost}`

  const v0Url = process.env.V0_RUNTIME_URL?.trim()
  if (v0Url) return v0Url

  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getBaseUrl(),
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: [
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  plugins: [
    organization({ cancelPendingInvitationsOnReInvite: true }),
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      allowPublicClientPrelogin: true,
      scopes: [...oauthScopes],
    }),
    nextCookies(),
  ],
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: { sameSite: "none" as const, secure: true },
        },
      }
    : {}),
})

export function getAuthBaseUrl() {
  return getBaseUrl() ?? "http://localhost:3000"
}
