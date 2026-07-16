import { oauthProvider } from "@better-auth/oauth-provider"
import { betterAuth } from "better-auth"
import { jwt, organization } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

import {
  getAuthBaseUrl as resolveAuthBaseUrl,
  getDeploymentEnvironment,
  getOAuthValidAudiences,
  getTrustedOrigins,
} from "@/lib/auth-environment"
import { sendTeamInvitation } from "@/lib/email/send-team-invitation"
import { pool } from "@/lib/db"
import { oauthScopes } from "@/lib/oauth-scopes"

const isDevelopment = getDeploymentEnvironment() === "development"

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: resolveAuthBaseUrl(),
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: getTrustedOrigins(),
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  plugins: [
    organization({
      cancelPendingInvitationsOnReInvite: true,
      async sendInvitationEmail(data) {
        await sendTeamInvitation({
          invitationId: data.id,
          email: data.email,
          role: data.role,
          teamName: data.organization.name,
          inviterName: data.inviter.user.name,
          inviterEmail: data.inviter.user.email,
          expiresAt: data.invitation.expiresAt,
        })
      },
    }),
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      allowPublicClientPrelogin: true,
      scopes: [...oauthScopes],
      validAudiences: getOAuthValidAudiences(),
    }),
    nextCookies(),
  ],
  ...(isDevelopment
    ? {
        advanced: {
          defaultCookieAttributes: { sameSite: "none" as const, secure: true },
        },
      }
    : {}),
})

export function getAuthBaseUrl() {
  return resolveAuthBaseUrl() ?? "http://localhost:3000"
}
