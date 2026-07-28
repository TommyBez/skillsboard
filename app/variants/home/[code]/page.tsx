import { generatePermutations } from "flags/next"
import { ArrowRightIcon, CableIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { JsonLd } from "@/components/json-ld"
import { LandingMotionController } from "@/components/landing/landing-motion-controller"
import styles from "@/components/landing/landing-shared.module.css"
import { Closing } from "@/components/landing/sections/closing"
import { Faq } from "@/components/landing/sections/faq"
import { Hero } from "@/components/landing/sections/hero"
import { Mcp } from "@/components/landing/sections/mcp"
import { Pricing } from "@/components/landing/sections/pricing"
import { ProductSlab } from "@/components/landing/sections/product-slab"
import { ProofStrip } from "@/components/landing/sections/proof-strip"
import { SiteFooter } from "@/components/landing/sections/site-footer"
import { SiteHeader } from "@/components/landing/sections/site-header"
import { Workflow } from "@/components/landing/sections/workflow"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"
import { buildLandingSchema } from "@/lib/seo/landing-schema"
import { getSession } from "@/lib/session"
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

function primaryAction(signedIn: boolean): {
  href: "/library" | "/sign-up"
  label: string
} {
  return signedIn
    ? { href: "/library", label: "Open your library" }
    : { href: "/sign-up", label: "Create your team library" }
}

function primaryCtaEventProperties(
  signedIn: boolean,
  location: "header" | "hero" | "closing" | "launch_demo",
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  const primary = primaryAction(signedIn)
  return {
    destination: primary.href,
    landing_path: "/",
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}

function HomeHeaderActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <nav className="flex items-center gap-1.5" aria-label="Main navigation">
        {!signedIn ? (
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            Sign in
          </Button>
        ) : null}
      <Button
        size="sm"
        variant="ink"
        className={`${styles.ctaButton} px-2.5 sm:h-10 sm:px-4`}
        nativeButton={false}
        render={(
          <TrackedLink
            href={primary.href}
            analytics={{
              event: "landing_cta_clicked",
              properties: primaryCtaEventProperties(signedIn, "header"),
            }}
          />
        )}
      >
        <span className="sm:hidden">{signedIn ? "Open" : "Start"}</span>
        <span className="hidden sm:inline">{primary.label}</span>
        <ArrowRightIcon
          className={`${styles.ctaArrow} hidden sm:block`}
          data-icon="inline-end"
        />
      </Button>
      </nav>
    </div>
  )
}

async function HomeHeaderActions() {
  const session = await getSession()
  return <HomeHeaderActionsView signedIn={Boolean(session?.user)} />
}

function HomeHeroActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="lg"
        className={`${styles.ctaButton} lp-cta-accent`}
        nativeButton={false}
        render={(
          <TrackedLink
            href={primary.href}
            analytics={{
              event: "landing_cta_clicked",
              properties: primaryCtaEventProperties(signedIn, "hero"),
            }}
          />
        )}
      >
        {primary.label}
        <ArrowRightIcon className={styles.ctaArrow} data-icon="inline-end" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className={styles.ctaButton}
        nativeButton={false}
        render={(
          <TrackedLink
            href="#mcp"
            analytics={{
              event: "mcp_entry_clicked",
              properties: mcpEntryEventProperties(signedIn, "landing_hero", "#mcp"),
            }}
          />
        )}
      >
        See MCP access
        <ArrowRightIcon className={styles.ctaArrow} data-icon="inline-end" />
      </Button>
    </div>
  )
}

async function HomeHeroActions() {
  const session = await getSession()
  return <HomeHeroActionsView signedIn={Boolean(session?.user)} />
}

function HomeMcpActionsView({ signedIn }: { signedIn: boolean }) {
  const href = signedIn ? "/settings/mcp" : "/sign-up"

  return (
      <Button
        size="lg"
        className={`${styles.ctaButton} lp-cta-accent`}
        nativeButton={false}
        render={(
          <TrackedLink
            href={href}
            analytics={{
              event: "mcp_entry_clicked",
              properties: mcpEntryEventProperties(signedIn, "landing_section", href),
            }}
          />
        )}
      >
        <CableIcon data-icon="inline-start" />
        {signedIn ? "Connect your agent" : "Create a library to connect"}
        <ArrowRightIcon className={styles.ctaArrow} data-icon="inline-end" />
      </Button>
  )
}

async function HomeMcpActions() {
  const session = await getSession()
  return <HomeMcpActionsView signedIn={Boolean(session?.user)} />
}

function HomeFinalActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
      <Button
        size="lg"
        variant="on-ink"
        className={styles.ctaButton}
        nativeButton={false}
        render={(
          <TrackedLink
            href={primary.href}
            analytics={{
              event: "landing_cta_clicked",
              properties: primaryCtaEventProperties(signedIn, "closing"),
            }}
          />
        )}
      >
        {primary.label}
        <ArrowRightIcon className={styles.ctaArrow} data-icon="inline-end" />
      </Button>
  )
}

async function HomeFinalActions() {
  const session = await getSession()
  return <HomeFinalActionsView signedIn={Boolean(session?.user)} />
}

function HomeLaunchActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <Button
      size="lg"
      className={`${styles.ctaButton} lp-cta-accent`}
      nativeButton={false}
      render={(
        <TrackedLink
          href={primary.href}
          analytics={{
            event: "landing_cta_clicked",
            properties: primaryCtaEventProperties(signedIn, "launch_demo"),
          }}
        />
      )}
    >
      {primary.label}
      <ArrowRightIcon className={styles.ctaArrow} data-icon="inline-end" />
    </Button>
  )
}

async function HomeLaunchActions() {
  const session = await getSession()
  return <HomeLaunchActionsView signedIn={Boolean(session?.user)} />
}

function HomeLaunchBanner() {
  return (
    <aside className="relative z-30 border-b border-primary/25 bg-primary/10">
      <a
        href="#launch-demo"
        className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-2 px-5 py-3 text-center text-sm font-semibold transition-colors hover:bg-primary/8 md:px-10"
      >
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
          Product walkthrough
        </span>
        <span>See how a team shares one useful skill in 14 seconds.</span>
        <ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
      </a>
    </aside>
  )
}

/*
 * Suspense fallbacks render the signed-out call to action rather than a
 * skeleton. Next streams the resolved session in and swaps it, but with
 * JavaScript disabled the fallback is what the reader keeps — skeletons left
 * every CTA on the page as a grey block. Signed out is also the overwhelmingly
 * common case for a landing page, so this is the cheaper guess besides.
 */
function HomeHeaderActionsFallback() {
  return <HomeHeaderActionsView signedIn={false} />
}

function HomeHeroActionsFallback() {
  return <HomeHeroActionsView signedIn={false} />
}

function HomeMcpActionsFallback() {
  return <HomeMcpActionsView signedIn={false} />
}

function HomeFinalActionsFallback() {
  return <HomeFinalActionsView signedIn={false} />
}

function HomeLaunchActionsFallback() {
  return <HomeLaunchActionsView signedIn={false} />
}

export default async function HomePage({ params }: HomeVariantPageProps) {
  const { code } = await params
  const showLaunchTreatment = await getLaunchTreatment(code)

  return (
    <div
      className={`${styles.root} min-h-[100dvh] overflow-x-clip bg-background text-foreground`}
      data-landing-motion-root
      data-landing-page
    >
      <JsonLd data={buildLandingSchema()} />
      <LandingMotionController />

      <SiteHeader
        actions={(
          <Suspense fallback={<HomeHeaderActionsFallback />}>
            <HomeHeaderActions />
          </Suspense>
        )}
      />

      {showLaunchTreatment ? <HomeLaunchBanner /> : null}

      <main>
        <Hero
          actions={(
            <Suspense fallback={<HomeHeroActionsFallback />}>
              <HomeHeroActions />
            </Suspense>
          )}
        />

        <ProofStrip />

        <Workflow
          showLaunchDemo={showLaunchTreatment}
          launchActions={(
            <Suspense fallback={<HomeLaunchActionsFallback />}>
              <HomeLaunchActions />
            </Suspense>
          )}
        />

        <ProductSlab />

        <Mcp
          actions={(
            <Suspense fallback={<HomeMcpActionsFallback />}>
              <HomeMcpActions />
            </Suspense>
          )}
        />

        <Pricing />

        <Faq />

        <Closing
          actions={(
            <Suspense fallback={<HomeFinalActionsFallback />}>
              <HomeFinalActions />
            </Suspense>
          )}
        />
      </main>

      <SiteFooter />
    </div>
  )
}
