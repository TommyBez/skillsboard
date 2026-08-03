import type { ReactNode } from "react"
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email"

import { BrandHeader } from "@/emails/components/brand-header"
import tailwindConfig from "@/emails/tailwind.config"
import { siteConfig } from "@/lib/site"

export interface EmailShellProps {
  children: ReactNode
  preview: string
  title: string
  /** Compact transactional footer with site name only. Marketing emails pass false and use MarketingFooter. */
  showTransactionalFooter?: boolean
}

export function EmailShell({
  children,
  preview,
  title,
  showTransactionalFooter = true,
}: EmailShellProps) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind config={tailwindConfig}>
        <Head>
          <title>{title}</title>
        </Head>
        <Body className="bg-paper font-sans text-ink" lang="en" dir="ltr">
          <Preview>{preview}</Preview>
          {/* lang/dir repeated on the body child: some clients strip them from <html>/<body>. */}
          <Section lang="en" dir="ltr" className="bg-paper px-0 py-8">
            <Container className="mx-auto max-w-[560px] rounded-[16px] border border-solid border-border bg-surface px-7 py-9">
              <BrandHeader />
              {children}
              {showTransactionalFooter ? (
                <Text className="mb-0 mt-8 text-xs leading-5 text-muted">
                  {siteConfig.name}
                </Text>
              ) : null}
            </Container>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  )
}
