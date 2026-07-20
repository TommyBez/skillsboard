import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { JsonLd } from "@/components/json-ld"
import { LandingMotionController } from "@/components/landing/landing-motion-controller"
import styles from "@/components/landing/landing-motion.module.css"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { landingFaqs } from "@/lib/seo/landing-faq"
import { buildLandingSchema } from "@/lib/seo/landing-schema"
import { getSession } from "@/lib/session"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "Skills Board, your team’s recommended AI skills" },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Skills Board: One shared library. Different agents.",
    description: siteConfig.ogDescription,
  },
}

function primaryAction(signedIn: boolean) {
  return signedIn
    ? { href: "/library", label: "Open your library" }
    : { href: "/sign-up", label: "Create your team library" }
}

function HomeHeaderActionsFallback() {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <nav className="flex items-center gap-1.5" aria-label="Main navigation" aria-busy="true">
        <Skeleton className="hidden h-8 w-16 rounded-lg sm:block" />
        <Skeleton className="h-8 w-28 rounded-lg sm:h-10 sm:w-40" />
      </nav>
    </div>
  )
}

function HomeCtaFallback() {
  return <Skeleton className="h-12 w-56 rounded-lg" aria-busy="true" />
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
          className={`${styles.ctaButton} sm:h-10 sm:px-4`}
          nativeButton={false}
          render={<Link href={primary.href} />}
        >
          <span className="sm:hidden">{signedIn ? "Open library" : "Create library"}</span>
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
    <Button
      size="lg"
      className={styles.ctaButton}
      nativeButton={false}
      render={<Link href={primary.href} />}
    >
      {primary.label}
      <ArrowRightIcon className={styles.ctaArrow} data-icon="inline-end" />
    </Button>
  )
}

async function HomeHeroActions() {
  const session = await getSession()
  return <HomeHeroActionsView signedIn={Boolean(session?.user)} />
}

function HomeFinalActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <Button
      size="lg"
      className={styles.ctaButton}
      nativeButton={false}
      render={<Link href={primary.href} />}
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

const agents = ["Claude", "Codex", "Cursor", "Other agents"]

function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.947 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.844-2.337 4.691-4.566 4.94.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.757 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <main
      className={`${styles.root} app-canvas min-h-[100dvh] overflow-x-clip bg-background text-foreground`}
      data-landing-motion-root
    >
      <JsonLd data={buildLandingSchema()} />
      <LandingMotionController />
      <header className="sticky top-0 z-30 border-b border-border/75 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
          <Brand />
          <Suspense fallback={<HomeHeaderActionsFallback />}>
            <HomeHeaderActions />
          </Suspense>
        </div>
      </header>

      <section className="border-b border-border/70">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 md:px-8 md:py-20 lg:min-h-[min(40rem,calc(100dvh-4.5rem))] lg:grid-cols-12 lg:content-center lg:items-end lg:gap-x-10 lg:py-20">
          <div className="flex w-full min-w-0 flex-col items-start lg:col-span-8">
            <p className={`${styles.heroEyebrow} mb-5 text-sm font-semibold text-primary`}>
              Skills selected by your team
            </p>
            <h1 className="text-balance text-[clamp(2.75rem,6.5vw,6rem)] font-semibold leading-[0.92] tracking-display">
              <span className={`${styles.heroLine} ${styles.heroLineFirst} block`}>
                One shared library.
              </span>
              <span className={`${styles.heroLine} ${styles.heroLineSecond} block text-primary`}>
                Different agents.
              </span>
            </h1>
          </div>

          <div className="flex w-full flex-col items-start lg:col-span-4 lg:pb-1">
            <p className={`${styles.heroCopy} max-w-[34rem] text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl`}>
              Keep your team&apos;s recommended skills in one place, so everyone knows where to find and use them.
            </p>
            <div className={`${styles.heroCta} mt-7`}>
              <Suspense fallback={<HomeCtaFallback />}>
                <HomeHeroActions />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-accent/30">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(28rem,1.2fr)] lg:items-center lg:gap-20">
          <div className="w-full">
            <h2 className="max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl">
              The library belongs to your team, not one agent.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Skills Board is a shared AI skill library for teams. Everyone starts from the same recommendation, then chooses the source, command, or ZIP that fits their setup.
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              Compatible agents can optionally access the same library through authenticated, read-only MCP.
            </p>
          </div>

          <figure
            className="w-full"
            aria-label="One team library can support different agents"
            data-motion-group="library"
          >
            <div className="grid border-y border-border py-7 sm:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)] sm:items-center sm:gap-8 sm:py-9">
              <div className={styles.librarySource}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  One team recommendation
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.045em] md:text-4xl">
                  Shared library
                </p>
              </div>

              <ArrowRightIcon
                className={`${styles.libraryArrow} my-6 size-7 rotate-90 text-primary sm:my-0 sm:rotate-0`}
                aria-hidden="true"
              />

              <div>
                <p className={`${styles.agentsLabel} text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground`}>
                  Wherever people work
                </p>
                <ul
                  className={`${styles.agentList} mt-3 flex flex-col gap-1.5`}
                  aria-label="Supported agent choices"
                >
                  {agents.map((agent) => (
                    <li key={agent} className={styles.agentItem}>
                      <span
                        className={`${styles.agentName} inline-block text-2xl font-semibold tracking-[-0.03em] md:text-3xl lg:text-4xl`}
                      >
                        {agent}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <figcaption className={`${styles.libraryCaption} mt-5 text-sm leading-relaxed text-muted-foreground`}>
              Open the source, copy the command, or download the latest ZIP.
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="border-b border-primary/30 bg-primary text-primary-foreground"
      >
        <div
          className="mx-auto grid w-full max-w-[1440px] gap-10 overflow-hidden px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-20"
          data-motion-group="pricing"
        >
          <p
            className={`${styles.pricingZero} select-none text-[clamp(9rem,25vw,22rem)] font-semibold leading-[0.68] tracking-[-0.09em]`}
            aria-hidden="true"
          >
            0
          </p>

          <div className="max-w-lg lg:pb-2">
            <h2
              id="pricing-heading"
              className={`${styles.pricingMessage} text-balance text-5xl font-semibold leading-[0.94] tracking-display md:text-7xl`}
            >
              Free. Forever.
            </h2>
            <p className={`${styles.pricingMessage} mt-6 text-xl leading-relaxed md:text-2xl`}>
              Skills Board is free to use and open source.
            </p>
            <p className={`${styles.pricingNote} mt-8 border-t border-primary-foreground/30 pt-5 text-sm font-semibold`}>
              No trial. No credit card. No paid tier.
            </p>
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="border-b border-border/70"
      >
        <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(16rem,0.75fr)_minmax(28rem,1.25fr)] lg:gap-20">
          <div>
            <h2
              id="faq-heading"
              className="max-w-[14ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl"
            >
              Common questions
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Straight answers about what Skills Board is, how it fits mixed agent setups, and what “recommended” means.
            </p>
          </div>

          <div className="divide-y divide-border/80 border-y border-border/80">
            {landingFaqs.map((faq) => (
              <details key={faq.question} className="faq-disclosure group py-6">
                <summary className="cursor-pointer list-none rounded-lg text-xl font-semibold tracking-[-0.03em] marker:content-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-6">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-primary transition-transform duration-150 group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div
          className="mx-auto flex w-full max-w-[1440px] flex-col items-start px-4 py-20 md:px-8 md:py-28"
          data-motion-group="closing"
        >
          <h2 className={`${styles.closingHeading} max-w-[18ch] text-balance text-[clamp(2.75rem,6vw,5.75rem)] font-semibold leading-[0.96] tracking-display`}>
            Answer “which skill should I use?” <span className="text-primary">once.</span>
          </h2>
          <p className={`${styles.closingCopy} mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground`}>
            Save the recommendation where the whole team can find it. The next person can get started without asking where to look.
          </p>
          <div className={`${styles.closingCta} mt-8`}>
            <Suspense fallback={<HomeCtaFallback />}>
              <HomeFinalActions />
            </Suspense>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <Brand />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end">
            <nav aria-label="Footer" className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
              <a href="#faq" className="transition-colors hover:text-foreground">
                FAQ
              </a>
            </nav>
            <p className="max-w-md text-sm text-muted-foreground md:text-right">
              Built for teams that work across different agents.
            </p>
            <a
              href="https://github.com/TommyBez/skillsboard"
              target="_blank"
              rel="noreferrer"
              aria-label="Skills Board on GitHub"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <GitHubMark />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
