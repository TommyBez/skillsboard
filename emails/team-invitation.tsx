import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email"

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
  inviterName,
  inviterEmail,
  teamName,
  role,
  inviteUrl,
  expiryDays,
}: TeamInvitationProps) {
  const formattedRole = formatRole(role)

  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#00752a",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Preview>You&apos;ve been invited to join {teamName} on Skills Board</Preview>
          <Container className="mx-auto max-w-xl bg-white px-5 py-10">
            <Heading as="h1" className="mb-6 text-center text-3xl font-bold text-gray-800">
              Join {teamName}
            </Heading>

            <Text className="my-4 text-base leading-7 text-gray-800">
              <strong>{inviterName}</strong> ({inviterEmail}) invited you to collaborate on{" "}
              <strong>{teamName}</strong> in Skills Board.
            </Text>

            <Section className="my-6 rounded border border-solid border-gray-200 bg-gray-50 p-5">
              <Text className="mb-2 text-xs font-bold uppercase text-gray-500">Role</Text>
              <Text className="m-0 text-lg font-bold text-gray-800">{formattedRole}</Text>
            </Section>

            <Text className="my-4 text-base leading-7 text-gray-800">
              Accept the invitation to access the shared skill library.
            </Text>

            <Button
              href={inviteUrl}
              className="my-6 block box-border rounded bg-brand px-7 py-3.5 text-center text-base font-bold text-white no-underline"
            >
              Accept invitation
            </Button>

            <Hr className="my-6 border-solid border-gray-200" />

            <Text className="my-2 text-sm leading-5 text-gray-500">
              This invitation expires in {expiryDays} day{expiryDays === 1 ? "" : "s"}.
            </Text>
            <Text className="my-2 text-sm leading-5 text-gray-500">
              If you weren&apos;t expecting this invitation, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
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
