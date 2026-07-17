import { oauthProvider } from "@better-auth/oauth-provider"
import { betterAuth } from "better-auth"
import { emailOTP, jwt, organization } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

import {
  getAuthBaseUrl as resolveAuthBaseUrl,
  getDeploymentEnvironment,
  getOAuthValidAudiences,
  getTrustedOrigins,
} from "@/lib/auth-environment"
import { sendSignInOtp } from "@/lib/email/send-sign-in-otp"
import { sendTeamInvitation } from "@/lib/email/send-team-invitation"
import { pool } from "@/lib/db"
import { oauthScopes } from "@/lib/oauth-scopes"

const isDevelopment = getDeploymentEnvironment() === "development"

const otpExpiresInSeconds = 300

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: resolveAuthBaseUrl(),
  trustedOrigins: getTrustedOrigins(),
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: otpExpiresInSeconds,
      allowedAttempts: 3,
      // In development, any 6-digit code verifies so local auth works without Resend.
      storeOTP: isDevelopment
        ? {
            hash: async (otp) => (/^\d{6}$/.test(otp) ? "dev-otp-bypass" : "dev-otp-reject"),
          }
        : "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") {
          console.warn("Ignoring unsupported OTP email type", { type })
          return
        }
        if (isDevelopment) {
          console.info("Skipping sign-in OTP email in development")
          return
        }
        // Better Auth may background this call; still await delivery work so
        // serverless runtimes keep the promise alive when awaited upstream.
        try {
          await sendSignInOtp({ email, otp, expiresInSeconds: otpExpiresInSeconds })
        } catch (error) {
          console.error("Unable to send sign-in OTP email", error)
          throw error
        }
      },
    }),
    organization({
      cancelPendingInvitationsOnReInvite: true,
      async sendInvitationEmail(data) {
        // Never throw: invitation creation must succeed so callers can return
        // the invite URL even when Resend is down. UI send path surfaces failures.
        try {
          await sendTeamInvitation({
            invitationId: data.id,
            email: data.email,
            role: data.role,
            teamName: data.organization.name,
            inviterName: data.inviter.user.name,
            inviterEmail: data.inviter.user.email,
            expiresAt: data.invitation.expiresAt,
          })
        } catch (error) {
          console.error("Unable to send invitation email from auth hook", error)
        }
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
