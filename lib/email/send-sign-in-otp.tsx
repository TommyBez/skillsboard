import SignInOtp from "@/emails/sign-in-otp"

import { getEmailFrom, getResendClient } from "./resend"

export interface SendSignInOtpInput {
  email: string
  otp: string
  /** OTP lifetime in seconds (Better Auth default: 300). */
  expiresInSeconds?: number
}

export async function sendSignInOtp(input: SendSignInOtpInput): Promise<void> {
  const resend = getResendClient()
  const expiresInSeconds = input.expiresInSeconds ?? 300
  const expiresInMinutes = Math.max(1, Math.ceil(expiresInSeconds / 60))
  const idempotencyKey = `sign-in-otp/${input.email.toLowerCase()}/${input.otp}`

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
      email: input.email,
      message: error.message,
    })
    throw new Error(`Failed to send sign-in OTP email: ${error.message}`)
  }
}
