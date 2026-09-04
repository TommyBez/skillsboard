import { Suspense } from "react"
import Link from "next/link"
import { connection } from "next/server"
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { Brand } from "@/components/brand"
import { FooterNavColumns } from "@/components/footer-nav"
import type { CtaLocation } from "@/components/landing/landing-ctas"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

/**
 * The one action these pages offer.
 *
 * Guides and the resource index used to branch on the session — "Open your
 * team library" for signed-in readers, "Create your team library" for everyone
 * else — which made the header and every inline CTA an async, session-reading
 * render behind a skeleton. These are acquisition pages; the invitation is the
 * same for every reader, and a signed-in one who takes it lands in their
 * library regardless.
 */
const ctaHref = "/sign-up" as const

async function CurrentYear() {
  await connection()

  return <span className="tabular-nums">{new Date().getFullYear()}</span>
}

function ctaProperties(
  location: CtaLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  return {
    destination: ctaHref,
    location,
  }
}

export function ResourceCta({ location }: { location: CtaLocation }) {
  return (
    <Button
      size="lg"
      className="rounded-[3px]"
      nativeButton={false}
      render={(
        <TrackedLink
          href={ctaHref}
          analytics={{
            event: "landing_cta_clicked",
            properties: ctaProperties(location),
          }}
        />
      )}
    >
      Create your team library
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}

function ResourceHeaderActions({ atResourceIndex }: { atResourceIndex: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Link
        href={resourcePaths.index}
        aria-current={atResourceIndex ? "page" : undefined}
        className="inline-flex min-h-11 items-center rounded-[3px] px-2 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3 sm:text-xs sm:tracking-[0.16em]"
      >
        Resources
      </Link>
      {/* Marketing chrome, sized to the controls beside it — the buttons in
          this header are `size="sm"`, so 32px, where the landing's are 36. */}
      <ThemeToggle chrome="marketing" className="size-8" />
      <Button
        size="sm"
        variant="ghost"
        className="hidden min-h-11 rounded-[3px] md:inline-flex"
        nativeButton={false}
        render={<Link href="/sign-in" />}
      >
        Sign in
      </Button>
      <Button
        size="sm"
        className="min-h-11 rounded-[3px] px-2.5 sm:px-3"
        nativeButton={false}
        render={(
          <TrackedLink
            href={ctaHref}
            analytics={{
              event: "landing_cta_clicked",
              properties: ctaProperties("header"),
            }}
          />
        )}
      >
        <span className="sm:hidden">Start</span>
        <span className="hidden sm:inline">Create library</span>
      </Button>
    </div>
  )
}

export function ResourceHeader({
  atResourceIndex = false,
}: {
  atResourceIndex?: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 md:px-10">
        <Brand compactOnMobile />
        <ResourceHeaderActions atResourceIndex={atResourceIndex} />
      </div>
    </header>
  )
}

/**
 * The chrome every resource page shares, so the layouts that mount it are the
 * three lines they should be and no page renders its own header or footer.
 */
export function ResourceShell({
  atResourceIndex = false,
  children,
}: {
  /** The resource index marks its own nav link, and only it does. */
  atResourceIndex?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ResourceHeader atResourceIndex={atResourceIndex} />
      <main
        id="main-content"
        className="[&_nav[aria-label=Breadcrumb]_a]:-mx-2 [&_nav[aria-label=Breadcrumb]_a]:-my-2 [&_nav[aria-label=Breadcrumb]_a]:inline-flex [&_nav[aria-label=Breadcrumb]_a]:min-h-11 [&_nav[aria-label=Breadcrumb]_a]:items-center [&_nav[aria-label=Breadcrumb]_a]:px-2"
      >
        {children}
      </main>
      <ResourceFooter />
    </div>
  )
}

/**
 * The resource colophon.
 *
 * Same three groups as the landing footer, from `components/footer-nav`, in
 * this surface's own type. It used to be one wrapping row of seven links plus
 * a second row of legal ones, which on a phone was a paragraph of tracked caps
 * with no order in it. The FAQ entry is absent because `#faq` is a section of
 * the home page and there is nothing here for it to scroll to.
 */
export function ResourceFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-10 px-5 py-10 md:px-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <div className="flex min-w-0 flex-col items-start gap-4">
          <Brand />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
            <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
          </a>
          <p className="text-sm text-muted-foreground">
            ©{" "}
            <Suspense
              fallback={<span className="inline-block w-[4ch]" aria-hidden="true" />}
            >
              <CurrentYear />
            </Suspense>{" "}
            {siteConfig.name}. Free and open source.
          </p>
        </div>
        <FooterNavColumns
          ariaLabel="Resource footer"
          className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:w-auto lg:gap-x-14"
          titleClassName="text-[0.675rem] tracking-[0.2em] text-foreground"
          linkClassName="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-foreground"
        />
      </div>
    </footer>
  )
}
