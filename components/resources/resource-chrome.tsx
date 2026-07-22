import { Suspense } from "react"
import Link from "next/link"
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getSession } from "@/lib/session"
import type { GuidePath } from "@/lib/seo/guides"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

type ResourceLandingPath = GuidePath | typeof resourcePaths.index
type ResourceHeaderLocation = "guide_header" | "resources_header"
type ResourceCtaLocation = "guide_inline" | "guide_closing" | "resources_closing"

function ctaProperties(
  landingPath: ResourceLandingPath,
  signedIn: boolean,
  location: ResourceHeaderLocation | ResourceCtaLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  return {
    destination: signedIn ? "/library" : "/sign-up",
    landing_path: landingPath,
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}

function ResourceCtaView({
  landingPath,
  signedIn,
  location,
}: {
  landingPath: ResourceLandingPath
  signedIn: boolean
  location: ResourceCtaLocation
}) {
  const href = signedIn ? "/library" : "/sign-up"

  return (
    <Button
      size="lg"
      className="rounded-[3px]"
      nativeButton={false}
      render={(
        <TrackedLink
          href={href}
          analytics={{
            event: "landing_cta_clicked",
            properties: ctaProperties(landingPath, signedIn, location),
          }}
        />
      )}
    >
      {signedIn ? "Open your team library" : "Create your team library"}
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}

async function ResourceCtaContent({
  landingPath,
  location,
}: {
  landingPath: ResourceLandingPath
  location: ResourceCtaLocation
}) {
  const session = await getSession()

  return (
    <ResourceCtaView
      landingPath={landingPath}
      signedIn={Boolean(session?.user)}
      location={location}
    />
  )
}

export function ResourceCta({
  landingPath,
  location,
}: {
  landingPath: ResourceLandingPath
  location: ResourceCtaLocation
}) {
  return (
    <Suspense fallback={<Skeleton className="h-11 w-56 rounded-[3px]" aria-busy="true" />}>
      <ResourceCtaContent landingPath={landingPath} location={location} />
    </Suspense>
  )
}

function ResourceHeaderActionsView({
  landingPath,
  location,
  signedIn,
}: {
  landingPath: ResourceLandingPath
  location: ResourceHeaderLocation
  signedIn: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Link
        href={resourcePaths.index}
        aria-current={landingPath === resourcePaths.index ? "page" : undefined}
        className="rounded-[3px] px-2 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3 sm:text-xs sm:tracking-[0.16em]"
      >
        Resources
      </Link>
      <ThemeToggle />
      {!signedIn ? (
        <Button
          size="sm"
          variant="ghost"
          className="hidden rounded-[3px] md:inline-flex"
          nativeButton={false}
          render={<Link href="/sign-in" />}
        >
          Sign in
        </Button>
      ) : null}
      <Button
        size="sm"
        className="rounded-[3px] px-2.5 sm:px-3"
        nativeButton={false}
        render={(
          <TrackedLink
            href={signedIn ? "/library" : "/sign-up"}
            analytics={{
              event: "landing_cta_clicked",
              properties: ctaProperties(landingPath, signedIn, location),
            }}
          />
        )}
      >
        <span className="sm:hidden">{signedIn ? "Open" : "Start"}</span>
        <span className="hidden sm:inline">{signedIn ? "Open library" : "Create library"}</span>
      </Button>
    </div>
  )
}

async function ResourceHeaderActions({
  landingPath,
  location,
}: {
  landingPath: ResourceLandingPath
  location: ResourceHeaderLocation
}) {
  const session = await getSession()

  return (
    <ResourceHeaderActionsView
      landingPath={landingPath}
      location={location}
      signedIn={Boolean(session?.user)}
    />
  )
}

export function ResourceHeader({
  landingPath,
  location,
}: {
  landingPath: ResourceLandingPath
  location: ResourceHeaderLocation
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 md:px-10">
        <Brand compactOnMobile />
        <Suspense
          fallback={(
            <div className="flex items-center gap-1.5">
              <Link
                href={resourcePaths.index}
                className="px-2 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-3 sm:text-xs"
              >
                Resources
              </Link>
              <ThemeToggle />
              <Skeleton className="h-8 w-14 rounded-[3px] sm:w-28" aria-busy="true" />
            </div>
          )}
        >
          <ResourceHeaderActions landingPath={landingPath} location={location} />
        </Suspense>
      </div>
    </header>
  )
}

export function ResourceFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-9 md:flex-row md:items-center md:justify-between md:px-10">
        <Brand />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <nav
            aria-label="Resource footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Link href={resourcePaths.index} className="transition-colors hover:text-foreground">
              Resources
            </Link>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </nav>
          <p className="text-sm text-muted-foreground">
            © 2026 {siteConfig.name}. Free and open source.
          </p>
        </div>
      </div>
    </footer>
  )
}
