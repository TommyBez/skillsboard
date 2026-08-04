import type { Metadata } from "next"

import { JsonLd } from "@/components/json-ld"
import { LandingMotionController } from "@/components/landing/landing-motion-controller"
import { ClosingSection } from "@/components/landing/sections/closing-section"
import { FaqSection } from "@/components/landing/sections/faq-section"
import { FlowSection } from "@/components/landing/sections/flow-section"
import { HeroSection } from "@/components/landing/sections/hero-section"
import {
  ChapterRail,
  LandingFooter,
  LandingHeader,
} from "@/components/landing/sections/landing-chrome"
import { McpSection } from "@/components/landing/sections/mcp-section"
import { PricingSection } from "@/components/landing/sections/pricing-section"
import base from "@/components/landing/styles/base.module.css"
import { buildLandingSchema } from "@/lib/seo/landing-schema"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "Skills Board, your team’s recommended AI skills" },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Skills Board: Your team’s skills. All in one place.",
    description: siteConfig.ogDescription,
  },
}

export default function HomePage() {
  return (
    <div
      className={`${base.root} min-h-[100dvh] overflow-x-clip bg-background text-foreground`}
      data-landing-motion-root
    >
      <JsonLd data={buildLandingSchema()} />
      <LandingMotionController />
      <ChapterRail />

      <LandingHeader />

      <main>
        <HeroSection />
        <FlowSection />
        <McpSection />
        <PricingSection />
        <FaqSection />
        <ClosingSection />
      </main>

      <LandingFooter />
    </div>
  )
}
