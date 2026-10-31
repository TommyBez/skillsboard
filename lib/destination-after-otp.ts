import { isInvitationPath } from "@/lib/safe-return-to"

/**
 * Where OTP success goes.
 *
 * Sign-up is the first hop of an account that does not have a team yet, so
 * every destination except an invitation resolves to `/onboarding`. Sign-in
 * keeps the destination it asked for.
 */
export function destinationAfterOtp(
  returnTo: string,
  mode: "sign-in" | "sign-up",
): string {
  return mode === "sign-up" && !isInvitationPath(returnTo) ? "/onboarding" : returnTo
}
