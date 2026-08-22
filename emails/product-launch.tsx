import {
  Button,
  Heading,
  Section,
  Text,
} from "react-email"

import { EmailShell } from "@/emails/components/email-shell"
import { MarketingFooter } from "@/emails/components/marketing-footer"
import { PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN_PROPERTY } from "@/lib/email/product-communications"
import { siteConfig } from "@/lib/site"

export const PRODUCT_LAUNCH_EMAIL = {
  name: "Skills Board product launch 2026-08",
  subject: "A shared home for your team’s AI skills",
  previewText: "Save a skill once, then let teammates find and use it in the way that fits.",
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
    <EmailShell
      preview={PRODUCT_LAUNCH_EMAIL.previewText}
      title={PRODUCT_LAUNCH_EMAIL.subject}
      showTransactionalFooter={false}
    >
      <Heading as="h1" className="m-0 mb-5 text-[28px] font-semibold leading-9 tracking-[-0.04em] text-ink">
        A shared home for your team’s AI skills
      </Heading>

      <Text className="m-0 mb-4 text-base leading-7 text-ink">
        Which skill should I use? Where can I find it?
      </Text>
      <Text className="m-0 mb-4 text-base leading-7 text-ink">
        Those questions are easy to answer once and surprisingly easy to repeat. Skills Board gives your team one searchable library for its AI skills.
      </Text>
      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        One teammate adds a useful skill. Another finds it by task or tag. Each person can open the original source, copy a compatible install command, download the latest skill files as a ZIP, or connect a compatible agent through authenticated MCP.
      </Text>
      <Section className="mb-6 rounded-[12px] border border-solid border-border bg-panel p-5">
        <Text className="m-0 text-sm leading-6 text-ink">
          Skills Board does not decide whether a skill is approved or compatible with every setup. It keeps the entry and its source visible so your team can make that choice.
        </Text>
      </Section>
      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        The hosted product is free forever, and the code is open source.
      </Text>

      <Button
        href={ctaUrl}
        className="box-border mb-6 block rounded-[12px] bg-brand px-7 py-3.5 text-center text-base font-semibold text-brand-foreground no-underline"
      >
        Create your team library
      </Button>

      <Text className="m-0 mb-2 text-base leading-7 text-ink">
        Tommaso<br />
        Skills Board
      </Text>

      <MarketingFooter
        managePreferencesUrl={managePreferencesUrl}
        providerUnsubscribeUrl={providerUnsubscribeUrl}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailShell>
  )
}

ProductLaunchEmail.PreviewProps = {
  ctaUrl: PRODUCT_LAUNCH_EMAIL.ctaUrl,
  managePreferencesUrl: `${siteConfig.url}/settings/email`,
  providerUnsubscribeUrl: `${siteConfig.url}/email/unsubscribe?provider=preview`,
  unsubscribeUrl: `${siteConfig.url}/email/unsubscribe?token=preview-token`,
} satisfies ProductLaunchEmailProps
