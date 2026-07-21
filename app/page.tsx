import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, CableIcon, ShieldCheckIcon } from "lucide-react"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { Brand } from "@/components/brand"
import { JsonLd } from "@/components/json-ld"
import { HeroBoard } from "@/components/landing/hero-board"
import { LandingMotionController } from "@/components/landing/landing-motion-controller"
import styles from "@/components/landing/landing-motion.module.css"
import { McpSchematic } from "@/components/landing/mcp-schematic"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"
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
    title: "Skills Board: Your team’s skills. All in one place.",
    description: siteConfig.ogDescription,
  },
}

function primaryAction(signedIn: boolean): {
  href: "/library" | "/sign-up"
  label: string
} {
  return signedIn
    ? { href: "/library", label: "Open your library" }
    : { href: "/sign-up", label: "Create your team library" }
}

function HomeHeaderActionsFallback() {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <nav className="flex items-center gap-1.5" aria-label="Main navigation" aria-busy="true">
        <Skeleton className="hidden h-8 w-16 rounded-[3px] sm:block" />
        <Skeleton className="h-8 w-28 rounded-[3px] sm:h-10 sm:w-40" />
      </nav>
    </div>
  )
}

function HomeCtaFallback() {
  return <Skeleton className="h-12 w-56 rounded-[3px]" aria-busy="true" />
}

function primaryCtaEventProperties(
  signedIn: boolean,
  location: "header" | "hero" | "closing",
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  const primary = primaryAction(signedIn)
  return {
    destination: primary.href,
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
            className="hidden rounded-[3px] sm:inline-flex"
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
    <div className="flex flex-wrap gap-3">
      <span className={styles.magnetic} data-magnetic>
        <Button
          size="lg"
          className={styles.ctaButton}
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
      </span>
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
    <span className={styles.magnetic} data-magnetic>
      <Button
        size="lg"
        className={styles.ctaButton}
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
    </span>
  )
}

async function HomeMcpActions() {
  const session = await getSession()
  return <HomeMcpActionsView signedIn={Boolean(session?.user)} />
}

function HomeFinalActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <span className={styles.magnetic} data-magnetic>
      <Button
        size="lg"
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
    </span>
  )
}

async function HomeFinalActions() {
  const session = await getSession()
  return <HomeFinalActionsView signedIn={Boolean(session?.user)} />
}

const railChapters = [
  { id: "intro", label: "Library" },
  { id: "flow", label: "Workflow" },
  { id: "mcp", label: "MCP" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "start", label: "Start" },
] as const

function ChapterRail() {
  return (
    <nav className={styles.rail} aria-label="Page chapters">
      {railChapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          className={styles.railLink}
          data-rail-link={chapter.id}
          aria-current={chapter.id === "intro" ? "true" : undefined}
        >
          <span className={styles.railLabel}>{chapter.label}</span>
          <span className={styles.railTick} aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}

const flowSteps = [
  {
    title: "Save the skill",
    copy: "Paste a GitHub skill URL you want the team to reuse. Skills Board keeps the name, description, and install command tied to it.",
  },
  {
    title: "Find it later",
    copy: "One searchable library for the whole team—no more scrolling chat history for that one link somebody posted.",
  },
  {
    title: "Use it your way",
    copy: "Open the source, copy the install command, download a ZIP, or let your agent fetch it over MCP.",
  },
] as const

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
    <div
      className={`${styles.root} min-h-[100dvh] overflow-x-clip bg-background text-foreground`}
      data-landing-motion-root
    >
      <JsonLd data={buildLandingSchema()} />
      <LandingMotionController />
      <ChapterRail />

      <header className={styles.header}>
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
          <Brand />
          <Suspense fallback={<HomeHeaderActionsFallback />}>
            <HomeHeaderActions />
          </Suspense>
        </div>
        <span className={styles.scrollProgress} aria-hidden="true" />
      </header>

      <main>
        {/* Hero — sticky chapter: dossiers file into the team library */}
        <section
          id="intro"
          className={styles.hero}
          data-hero-scene
          data-chapter-target="intro"
        >
          <div className={`${styles.heroSticky} ${styles.grain}`}>
            <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center px-5 py-14 md:px-10 lg:py-16">
              <div className={styles.heroGridLines} aria-hidden="true" />

              <div className={`${styles.heroExit} relative z-0`}>
                <p className={styles.heroEyebrow} data-decode="">
                  Skills selected by your team
                </p>
                <h1
                  className={`${styles.heroHeadline} mt-6 text-[clamp(2.75rem,8.4vw,8.75rem)] font-semibold leading-[0.92] tracking-[-0.045em]`}
                >
                  <span className={styles.heroLineMask}>
                    <span className={`${styles.heroLine} ${styles.heroLineFirst}`}>
                      Your team&apos;s skills.
                    </span>
                  </span>
                  <span className={styles.heroLineMask}>
                    <span
                      className={`${styles.heroLine} ${styles.heroLineSecond} text-primary`}
                    >
                      All in one place.
                    </span>
                  </span>
                </h1>
              </div>

              <div
                className={`${styles.heroExit} relative z-10 mt-9 lg:mt-12 lg:max-w-[34rem]`}
              >
                <p
                  className={`${styles.heroCopy} max-w-[34rem] text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl`}
                >
                  Build a shared, searchable library so everyone knows which
                  skills to use and where to find them.
                </p>
                <div className={`${styles.heroCta} mt-7`}>
                  <Suspense fallback={<HomeCtaFallback />}>
                    <HomeHeroActions />
                  </Suspense>
                </div>
              </div>

              <HeroBoard />
            </div>
          </div>
        </section>

        {/* Workflow — three moves, indexed like a manual */}
        <section
          id="flow"
          aria-labelledby="flow-heading"
          className={`${styles.flowSection} scroll-mt-14`}
          data-chapter-target="flow"
        >
          <div
            className="relative mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24"
            data-motion-group="flow"
          >
            <div className={styles.flowHead}>
              <p className={`${styles.chapterMark} uppercase`} data-decode="">
                How it works
              </p>
              <h2
                id="flow-heading"
                className="mt-5 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
              >
                Save once. Find fast. Use it your way.
              </h2>
            </div>
            <ol className={styles.flowRows}>
              {flowSteps.map((step) => (
                <li key={step.title} className={styles.flowRow}>
                  <h3 className={styles.flowTitle}>{step.title}</h3>
                  <p className={styles.flowCopy}>{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* MCP — the signature routing chapter */}
        <section
          id="mcp"
          aria-labelledby="mcp-heading"
          className={`${styles.mcpChapter} scroll-mt-14 border-b border-border/70`}
          data-mcp-chapter
          data-chapter-target="mcp"
        >
          <div className={styles.mcpSticky}>
            <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16 lg:py-0">
              <div className="w-full">
                <p className={`${styles.chapterMark} uppercase`} data-decode="">
                  MCP access
                </p>
                <h2
                  id="mcp-heading"
                  className="mt-5 max-w-[16ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
                >
                  Bring your team&apos;s skills into your agent.
                </h2>
                <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                  Connect Skills Board through MCP. Your agent can search the
                  shared library, retrieve install commands, and save new
                  skills it discovers.
                </p>
                <div className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <ShieldCheckIcon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p>
                    Sign in securely through your browser—there&apos;s no API key
                    to copy.
                  </p>
                </div>
                <div className="mt-7">
                  <Suspense fallback={<HomeCtaFallback />}>
                    <HomeMcpActions />
                  </Suspense>
                </div>
              </div>

              <McpSchematic />
            </div>
          </div>
        </section>

        {/* Pricing — the zero monument */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          className={`${styles.pricingSection} ${styles.grain} scroll-mt-14`}
          data-motion-group="pricing"
          data-chapter-target="pricing"
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.65fr)] lg:items-end lg:gap-6">
            <div className={styles.pricingZeroWrap} aria-hidden="true">
              <p className={styles.pricingZero}>0</p>
              <p className={styles.pricingZeroLayer} data-layer="alert">
                0
              </p>
              <p className={styles.pricingZeroLayer} data-layer="ink">
                0
              </p>
            </div>

            <div className={`${styles.pricingCopy} mt-12 max-w-lg lg:mt-0 lg:pb-3`}>
              <h2
                id="pricing-heading"
                className={`${styles.pricingMessage} text-balance text-5xl font-semibold leading-[0.94] tracking-display md:text-7xl`}
              >
                Free. Forever.
              </h2>
              <p className={`${styles.pricingMessage} mt-6 text-xl leading-relaxed md:text-2xl`}>
                Skills Board is free to use and open source.
              </p>
              <p
                className={`${styles.pricingNote} ${styles.pricingNoteRule} mt-8 pt-5 font-mono text-sm font-semibold tracking-[0.02em]`}
              >
                No trial. No credit card. No paid tier.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ — technical index */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="scroll-mt-14 border-b border-border/70"
          data-chapter-target="faq"
        >
          <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(28rem,1.3fr)] lg:gap-20">
            <div>
              <h2
                id="faq-heading"
                className="max-w-[14ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
              >
                Common questions
              </h2>
              <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
                Straight answers about what Skills Board is, how it fits mixed
                agent setups, and what “recommended” means.
              </p>
            </div>

            <div className="border-t border-border/80">
              {landingFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className={`faq-disclosure ${styles.faqItem}`}
                >
                  <summary className={styles.faqSummary}>
                    <span className={styles.faqQuestion}>{faq.question}</span>
                    <span className={styles.faqGlyph} aria-hidden="true" />
                  </summary>
                  <p
                    className={`${styles.faqAnswer} max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground`}
                  >
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing — everything indexed, one final action */}
        <section
          id="start"
          className={`${styles.grain} scroll-mt-14`}
          data-motion-group="closing"
          data-chapter-target="start"
        >
          <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start px-5 py-20 md:px-10 md:py-32">
            <h2
              className={`${styles.closingHeading} max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,5.75rem)] font-semibold leading-[0.98] tracking-display`}
            >
              Answer “which skill should I use?”{" "}
              <span className={styles.onceStamp}>once.</span>
            </h2>
            <p
              className={`${styles.closingCopy} mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground`}
            >
              Save the recommendation where the whole team can find it. The next
              person can get started without asking where to look.
            </p>
            <div className={`${styles.closingCta} mt-8`}>
              <Suspense fallback={<HomeCtaFallback />}>
                <HomeFinalActions />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — open-source colophon */}
      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <Brand />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
            <nav
              aria-label="Footer"
              className="flex items-center gap-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              <a href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
              <a href="#faq" className="transition-colors hover:text-foreground">
                FAQ
              </a>
            </nav>
            <a
              href="https://github.com/TommyBez/skillsboard"
              target="_blank"
              rel="noreferrer"
              aria-label="Skills Board on GitHub"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <GitHubMark />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
