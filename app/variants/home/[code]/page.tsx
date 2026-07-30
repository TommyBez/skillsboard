import { generatePermutations } from "flags/next"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

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
  LandingLaunchBanner,
} from "@/components/landing/sections/landing-chrome"
import { McpSection } from "@/components/landing/sections/mcp-section"
import { PricingSection } from "@/components/landing/sections/pricing-section"
import base from "@/components/landing/styles/base.module.css"
import { buildLandingSchema } from "@/lib/seo/landing-schema"
import { siteConfig } from "@/lib/site"
import { homepageFlags, launchTreatmentIsVisible } from "@/lib/launch"

type HomeVariantPageProps = {
  params: Promise<{ code: string }>
}

export async function generateStaticParams() {
  const codes = await generatePermutations(homepageFlags)
  return codes.map((code) => ({ code }))
}

async function getLaunchTreatment(code: string) {
  try {
    return await launchTreatmentIsVisible(code, homepageFlags)
  } catch {
    // This internal segment exists only for signed, precomputed flag variants.
    // Reject direct requests carrying an invalid or stale code.
    notFound()
  }
}

export async function generateMetadata({ params }: HomeVariantPageProps): Promise<Metadata> {
  const { code } = await params
  const showLaunchTreatment = await getLaunchTreatment(code)

  return {
    title: { absolute: "Skills Board, your team’s recommended AI skills" },
    description: siteConfig.description,
    alternates: { canonical: "/" },
    openGraph: {
      url: "/",
      title: "Skills Board: Your team’s skills. All in one place.",
      description: siteConfig.ogDescription,
      images: showLaunchTreatment
        ? [{
            url: "/launch/skills-board-launch-og.jpg",
            width: 1200,
            height: 630,
            alt: "Skills Board: a shared answer to which skill should I use?",
          }]
        : undefined,
    },
  }
}

export default async function HomePage({ params }: HomeVariantPageProps) {
  const { code } = await params
  const showLaunchTreatment = await getLaunchTreatment(code)

  return (
    <div
      className={`${base.root} min-h-[100dvh] overflow-x-clip bg-background text-foreground`}
      data-landing-motion-root
    >
      <JsonLd data={buildLandingSchema()} />
      <LandingMotionController />
      <ChapterRail />

      <LandingHeader />

      {showLaunchTreatment ? <LandingLaunchBanner /> : null}

      <main>
        <HeroSection />
        <FlowSection showLaunchTreatment={showLaunchTreatment} />
        <McpSection />
        <PricingSection />
        <FaqSection />
        <ClosingSection />
      </main>

      <LandingFooter />
    </div>
  )
}
