import { createHash } from "node:crypto"

import SignInOtp from "@/emails/sign-in-otp"

import { getEmailFrom, getResendClient } from "./resend"

export interface SendSignInOtpInput {
  email: string
  otp: string
  /** OTP lifetime in seconds (Better Auth default: 300). */
  expiresInSeconds?: number
}

function otpIdempotencyKey(email: string, otp: string): string {
  // Opaque fixed-length key so email/OTP never appear in Idempotency-Key headers or proxy logs.
  const digest = createHash("sha256")
    .update(`sign-in-otp\0${email.toLowerCase()}\0${otp}`)
    .digest("hex")
    .slice(0, 32)
  return `sign-in-otp/${digest}`
}

export async function sendSignInOtp(input: SendSignInOtpInput): Promise<void> {
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
      message: error.message,
    })
    throw new Error(`Failed to send sign-in OTP email: ${error.message}`)
  }
}
