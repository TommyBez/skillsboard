import type { Metadata } from "next"

import { JsonLd } from "@/components/json-ld"
import { ClosingSection } from "@/components/landing/sections/closing-section"
import { FaqSection } from "@/components/landing/sections/faq-section"
import { FlowSection } from "@/components/landing/sections/flow-section"
import { HeroSection } from "@/components/landing/sections/hero-section"
import { McpSection } from "@/components/landing/sections/mcp-section"
import { PricingSection } from "@/components/landing/sections/pricing-section"
import { buildLandingSchema } from "@/lib/seo/landing-schema"
import { siteConfig } from "@/lib/site"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
  title: { absolute: "Skills Board, your team’s recommended AI skills" },
  description: siteConfig.description,
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildLandingSchema()} />

      <HeroSection />
      <FlowSection />
      <McpSection />
      <PricingSection />
      <FaqSection />
      <ClosingSection />
    </>
  )
}
