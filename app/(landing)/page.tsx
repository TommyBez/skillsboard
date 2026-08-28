import type { Metadata } from "next"

import { JsonLd } from "@/components/json-ld"
import { ClosingSection } from "@/components/landing/sections/closing-section"
import { EmailCaptureSection } from "@/components/landing/sections/email-capture-section"
import { FaqSection } from "@/components/landing/sections/faq-section"
import { FlowSection } from "@/components/landing/sections/flow-section"
import { HeroSection } from "@/components/landing/sections/hero-section"
import { McpSection } from "@/components/landing/sections/mcp-section"
import { PluginSection } from "@/components/landing/sections/plugin-section"
import { PricingSection } from "@/components/landing/sections/pricing-section"
import { RelatedResourcesSection } from "@/components/landing/sections/related-resources-section"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { homePath } from "@/lib/seo/home"
import { buildLandingSchema } from "@/lib/seo/landing-schema"
import { siteConfig } from "@/lib/site"

/**
 * No `openGraph` block here on purpose.
 *
 * It used to repeat the root layout's og title, description, and url verbatim.
 * That was harmless while this file sat beside `app/opengraph-image.tsx` — same
 * segment, so the generated image merged into the page's own openGraph. Inside
 * the route group the image file is an ancestor's, and a leaf `openGraph`
 * replaces the inherited one wholesale, images included: the home page shipped
 * without an og:image. The root layout already declares exactly these three
 * values, so inheriting them is both shorter and correct.
 */
export const metadata: Metadata = {
  title: { absolute: "Skills Board, the agent-native skills registry for teams" },
  description: siteConfig.description,
  alternates: markdownTwinAlternates(homePath),
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildLandingSchema()} />

      <HeroSection />
      <FlowSection />
      <McpSection />
      <PluginSection />
      <PricingSection />
      <FaqSection />
      <EmailCaptureSection />
      <ClosingSection />
      <RelatedResourcesSection />
    </>
  )
}
