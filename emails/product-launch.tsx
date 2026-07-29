import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email"

import { MarketingFooter } from "@/emails/components/marketing-footer"
import { PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN_PROPERTY } from "@/lib/email/product-communications"
import { siteConfig } from "@/lib/site"

export const PRODUCT_LAUNCH_EMAIL = {
  name: "Skills Board product launch 2026-08",
  subject: "A shared home for your team’s AI skills",
  previewText: "Save a recommendation once, then let teammates find and use it in the way that fits.",
  from: "Tommaso from Skills Board <tommaso@skillsboard.sh>",
  ctaUrl: `${siteConfig.url}/?utm_source=product_email&utm_medium=email&utm_campaign=product_launch_2026_08&utm_content=launch_announcement`,
} as const

export const PRODUCT_LAUNCH_BROADCAST_PROPS = {
  ctaUrl: PRODUCT_LAUNCH_EMAIL.ctaUrl,
  managePreferencesUrl: `${siteConfig.url}/settings/email`,
  providerUnsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
  unsubscribeUrl: `${siteConfig.url}/email/unsubscribe?token={{{${PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN_PROPERTY}}}}`,
} as const

export interface ProductLaunchEmailProps {
  ctaUrl: string
  managePreferencesUrl: string
  providerUnsubscribeUrl: string
  unsubscribeUrl: string
}

export default function ProductLaunchEmail({
  ctaUrl = PRODUCT_LAUNCH_BROADCAST_PROPS.ctaUrl,
  managePreferencesUrl = PRODUCT_LAUNCH_BROADCAST_PROPS.managePreferencesUrl,
  providerUnsubscribeUrl = PRODUCT_LAUNCH_BROADCAST_PROPS.providerUnsubscribeUrl,
  unsubscribeUrl = PRODUCT_LAUNCH_BROADCAST_PROPS.unsubscribeUrl,
}: ProductLaunchEmailProps) {
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
        <Head>
          <title>{PRODUCT_LAUNCH_EMAIL.subject}</title>
        </Head>
        <Body className="bg-gray-100 font-sans">
          <Preview>{PRODUCT_LAUNCH_EMAIL.previewText}</Preview>
          <Container className="mx-auto max-w-xl bg-white px-5 py-10">
            <Heading as="h1" className="mb-6 text-3xl font-bold leading-10 text-gray-900">
              A shared home for your team’s AI skills
            </Heading>

            <Text className="my-4 text-base leading-7 text-gray-800">
              Which skill should I use? Where can I find it?
            </Text>
            <Text className="my-4 text-base leading-7 text-gray-800">
              Those questions are easy to answer once and surprisingly easy to repeat. Skills Board gives your team one searchable library for the AI skills it recommends.
            </Text>
            <Text className="my-4 text-base leading-7 text-gray-800">
              One teammate adds a useful skill. Another finds it by task or tag. Each person can open the original source, copy a compatible install command, download the latest skill files as a ZIP, or connect a compatible agent through authenticated MCP.
            </Text>
            <Section className="my-6 rounded border border-solid border-gray-200 bg-gray-50 p-5">
              <Text className="m-0 text-sm leading-6 text-gray-700">
                Skills Board does not decide whether a skill is approved or compatible with every setup. It keeps the recommendation and source visible so your team can make that choice.
              </Text>
            </Section>
            <Text className="my-4 text-base leading-7 text-gray-800">
              The hosted product is free forever, and the code is open source.
            </Text>

            <Button
              href={ctaUrl}
              className="my-6 block box-border rounded bg-brand px-7 py-3.5 text-center text-base font-bold text-white no-underline"
            >
              Create your team library
            </Button>

            <Text className="my-5 text-base leading-7 text-gray-800">
              Tommaso<br />
              Skills Board
            </Text>

            <MarketingFooter
              managePreferencesUrl={managePreferencesUrl}
              providerUnsubscribeUrl={providerUnsubscribeUrl}
              unsubscribeUrl={unsubscribeUrl}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ProductLaunchEmail.PreviewProps = {
  ctaUrl: PRODUCT_LAUNCH_EMAIL.ctaUrl,
  managePreferencesUrl: `${siteConfig.url}/settings/email`,
  providerUnsubscribeUrl: `${siteConfig.url}/email/unsubscribe?provider=preview`,
  unsubscribeUrl: `${siteConfig.url}/email/unsubscribe?token=preview-token`,
} satisfies ProductLaunchEmailProps
