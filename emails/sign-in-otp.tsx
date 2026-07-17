import {
  Body,
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

export interface SignInOtpProps {
  otp: string
  expiresInMinutes: number
}

export default function SignInOtp({ otp, expiresInMinutes }: SignInOtpProps) {
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
          <Preview>{`Your Skills Board sign-in code is ${otp}. It expires in ${expiresInMinutes} minutes.`}</Preview>
          <Container className="mx-auto max-w-xl bg-white px-5 py-10">
            <Heading as="h1" className="mb-6 text-center text-3xl font-bold text-gray-800">
              Your sign-in code
            </Heading>

            <Text className="my-4 text-base leading-7 text-gray-800">
              Use this one-time code to sign in to Skills Board. It expires in{" "}
              {expiresInMinutes} minute{expiresInMinutes === 1 ? "" : "s"}.
            </Text>

            <Section className="my-6 rounded border border-solid border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <Text className="mb-2 text-xs font-bold uppercase text-gray-500">Code</Text>
              <Text className="m-0 font-mono text-4xl font-bold tracking-[0.35em] text-gray-800">
                {otp}
              </Text>
            </Section>

            <Hr className="my-6 border-solid border-gray-200" />

            <Text className="my-2 text-sm leading-5 text-gray-500">
              If you didn&apos;t request this code, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

SignInOtp.PreviewProps = {
  otp: "482913",
  expiresInMinutes: 5,
} satisfies SignInOtpProps
