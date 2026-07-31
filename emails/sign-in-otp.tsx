import { Heading, Hr, Section, Text } from "react-email"

import { EmailShell } from "@/emails/components/email-shell"

export interface SignInOtpProps {
  otp: string
  expiresInMinutes: number
}

export default function SignInOtp({
  otp = "482913",
  expiresInMinutes = 5,
}: SignInOtpProps) {
  const expiryLabel = `${expiresInMinutes} minute${expiresInMinutes === 1 ? "" : "s"}`
  const title = "Your Skills Board sign-in code"
  const preview = `Your Skills Board sign-in code is ${otp}. It expires in ${expiryLabel}.`

  return (
    <EmailShell preview={preview} title={title}>
      <Heading as="h1" className="m-0 mb-5 text-[28px] font-semibold leading-9 tracking-[-0.04em] text-ink">
        Your sign-in code
      </Heading>

      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        Use this one-time code to sign in to Skills Board. It expires in{" "}
        <strong>{expiryLabel}</strong>.
      </Text>

      <Section className="rounded-[12px] border border-solid border-border bg-panel px-5 py-8 text-center">
        <Text className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Sign-in code
        </Text>
        <Text className="m-0 font-mono text-[32px] font-bold leading-none tracking-[0.35em] text-ink">
          {otp}
        </Text>
      </Section>

      <Text className="mb-0 mt-5 text-sm leading-6 text-muted">
        Expires in {expiryLabel}.
      </Text>

      <Hr className="my-7 border-solid border-border" />

      <Text className="m-0 text-sm leading-6 text-muted">
        If you didn&apos;t request this code, you can safely ignore this email.
      </Text>
    </EmailShell>
  )
}

SignInOtp.PreviewProps = {
  otp: "482913",
  expiresInMinutes: 5,
} satisfies SignInOtpProps
