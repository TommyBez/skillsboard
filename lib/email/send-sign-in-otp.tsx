import SignInOtp from "@/emails/sign-in-otp"

import { assertTransactionalEmailAllowed } from "./email-preferences"
import { createEmailIdempotencyKey } from "./idempotency"
import { getEmailFrom, getResendClient } from "./resend"

export interface SendSignInOtpInput {
  email: string
  otp: string
  /** OTP lifetime in seconds (Better Auth default: 300). */
  expiresInSeconds?: number
}

function otpIdempotencyKey(email: string, otp: string): string {
  return createEmailIdempotencyKey("sign-in-otp", [email.toLowerCase(), otp])
}

export async function sendSignInOtp(input: SendSignInOtpInput): Promise<void> {
  await assertTransactionalEmailAllowed(input.email)
  const resend = getResendClient()
  const expiresInSeconds = input.expiresInSeconds ?? 300
  const expiresInMinutes = Math.max(1, Math.ceil(expiresInSeconds / 60))
  const idempotencyKey = otpIdempotencyKey(input.email, input.otp)

  const { error } = await resend.emails.send(
    {
      from: getEmailFrom(),
      to: [input.email],
      subject: `${input.otp} is your Skills Board sign-in code`,
      react: <SignInOtp otp={input.otp} expiresInMinutes={expiresInMinutes} />,
    },
    { idempotencyKey },
  )

  if (error) {
    console.error("Failed to send sign-in OTP email", {
      name: error.name,
    })
    const deliveryError = new Error("Failed to send sign-in OTP email")
    deliveryError.name = "EmailDeliveryError"
    throw deliveryError
  }
}
