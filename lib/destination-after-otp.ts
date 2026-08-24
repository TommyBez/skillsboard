import { isImmediateSignedInDestination } from "@/lib/safe-return-to"

/**
 * Where OTP success goes.
 *
 * Sign-up is the first hop of an account that does not have a team yet, so
 * `/library`, `/connect`, and `/start` resolve to `/onboarding`. Sign-in, an
 * invitation, and email preferences keep the destination they asked for.
 */
export function destinationAfterOtp(
  returnTo: string,
  mode: "sign-in" | "sign-up",
): string {
  return mode === "sign-up" && isImmediateSignedInDestination(returnTo)
    ? "/onboarding"
    : returnTo
}
