import { Resend } from "resend"

let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured")
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "Skills Board <onboarding@resend.dev>"
}
