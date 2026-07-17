import TeamInvitation from "@/emails/team-invitation"
import { getAuthBaseUrl } from "@/lib/auth-environment"

import { getEmailFrom, getResendClient } from "./resend"

export interface SendTeamInvitationInput {
  invitationId: string
  email: string
  role: string
  teamName: string
  inviterName: string
  inviterEmail: string
  expiresAt: Date
}

function buildInviteUrl(invitationId: string): string {
  const baseUrl = getAuthBaseUrl() ?? "http://localhost:3000"
  return new URL(`/invite/${invitationId}`, baseUrl).toString()
}

function expiryDaysFromDate(expiresAt: Date): number {
  const millisecondsRemaining = expiresAt.getTime() - Date.now()
  return Math.max(1, Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24)))
}

export async function sendTeamInvitation(input: SendTeamInvitationInput): Promise<void> {
  const resend = getResendClient()
  const inviteUrl = buildInviteUrl(input.invitationId)
  const expiryDays = expiryDaysFromDate(input.expiresAt)

  const { error } = await resend.emails.send(
    {
      from: getEmailFrom(),
      to: [input.email],
      subject: `You're invited to join ${input.teamName} on Skills Board`,
      react: (
        <TeamInvitation
          inviterName={input.inviterName}
          inviterEmail={input.inviterEmail}
          teamName={input.teamName}
          role={input.role}
          inviteUrl={inviteUrl}
          expiryDays={expiryDays}
        />
      ),
    },
    { idempotencyKey: `team-invitation/${input.invitationId}` },
  )

  if (error) {
    console.error("Failed to send team invitation email", {
      name: error.name,
      message: error.message,
    })
    throw new Error(`Failed to send invitation email: ${error.message}`)
  }
}
