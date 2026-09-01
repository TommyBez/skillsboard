import { Button, Heading, Hr, Section, Text } from "react-email"

import { EmailShell } from "@/emails/components/email-shell"

export interface TeamInvitationProps {
  inviterName: string
  inviterEmail: string
  teamName: string
  role: string
  inviteUrl: string
  expiryDays: number
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function TeamInvitation({
  inviterName = "Alex Morgan",
  inviterEmail = "alex@example.com",
  teamName = "Product Engineering",
  role = "member",
  inviteUrl = "https://skillsboard.example.com/invite/preview-invitation-id",
  expiryDays = 2,
}: TeamInvitationProps) {
  const formattedRole = formatRole(role)
  const title = `Join ${teamName} on Skills Board`
  const preview = `You've been invited to join ${teamName} on Skills Board`

  return (
    <EmailShell preview={preview} title={title}>
      <Heading as="h1" className="m-0 mb-5 text-[28px] font-semibold leading-9 tracking-[-0.04em] text-ink">
        Join {teamName}
      </Heading>

      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        <strong>{inviterName}</strong> ({inviterEmail}) invited you to collaborate on{" "}
        <strong>{teamName}</strong> in Skills Board.
      </Text>

      <Section className="mb-6 rounded-[12px] border border-solid border-border bg-panel p-5">
        <Text className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Role
        </Text>
        <Text className="m-0 text-lg font-semibold text-ink">{formattedRole}</Text>
      </Section>

      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        Accept the invitation to see the skills your team keeps in {teamName}.
      </Text>

      <Button
        href={inviteUrl}
        className="box-border block rounded-[12px] bg-brand px-7 py-3.5 text-center text-base font-semibold text-brand-foreground no-underline"
      >
        Accept invitation to {teamName}
      </Button>

      <Hr className="my-7 border-solid border-border" />

      <Text className="m-0 mb-2 text-sm leading-6 text-muted">
        This invitation expires in {expiryDays} day{expiryDays === 1 ? "" : "s"}.
      </Text>
      <Text className="m-0 text-sm leading-6 text-muted">
        If you weren&apos;t expecting this invitation, you can safely ignore this email.
      </Text>
    </EmailShell>
  )
}

TeamInvitation.PreviewProps = {
  inviterName: "Alex Morgan",
  inviterEmail: "alex@example.com",
  teamName: "Product Engineering",
  role: "member",
  inviteUrl: "https://skillsboard.example.com/invite/preview-invitation-id",
  expiryDays: 2,
} satisfies TeamInvitationProps
