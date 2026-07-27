import { Suspense } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { launchPath } from "@/lib/launch"
import { getSession } from "@/lib/session"

type LaunchCtaLocation =
  | "launch_header"
  | "launch_hero"
  | "launch_closing"
  | "launch_footer"

function primaryAction(signedIn: boolean): {
  href: "/library" | "/sign-up"
  label: string
} {
  return signedIn
    ? { href: "/library", label: "Open your team library" }
    : { href: "/sign-up", label: "Create your team library" }
}

function ctaProperties(
  signedIn: boolean,
  location: LaunchCtaLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  const primary = primaryAction(signedIn)

  return {
    destination: primary.href,
    landing_path: launchPath,
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}

function LaunchCtaView({
  location,
  signedIn,
}: {
  location: LaunchCtaLocation
  signedIn: boolean
}) {
  const primary = primaryAction(signedIn)

  return (
    <Button
      size="lg"
      className="rounded-[3px]"
      nativeButton={false}
      render={(
        <TrackedLink
          href={primary.href}
          analytics={{
            event: "landing_cta_clicked",
            properties: ctaProperties(signedIn, location),
          }}
        />
      )}
    >
      {primary.label}
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}

async function LaunchCtaContent({ location }: { location: LaunchCtaLocation }) {
  const session = await getSession()

  return <LaunchCtaView location={location} signedIn={Boolean(session?.user)} />
}

export function LaunchCta({ location }: { location: LaunchCtaLocation }) {
  return (
    <Suspense fallback={<Skeleton className="h-11 w-60 rounded-[3px]" aria-busy="true" />}>
      <LaunchCtaContent location={location} />
    </Suspense>
  )
}

function LaunchFooterLinkView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <TrackedLink
      href={primary.href}
      analytics={{
        event: "landing_cta_clicked",
        properties: ctaProperties(signedIn, "launch_footer"),
      }}
      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
    >
      {signedIn ? "Open library" : "Create library"}
      <ArrowRightIcon className="size-3.5" aria-hidden="true" />
    </TrackedLink>
  )
}

async function LaunchFooterLinkContent() {
  const session = await getSession()

  return <LaunchFooterLinkView signedIn={Boolean(session?.user)} />
}

export function LaunchFooterLink() {
  return (
    <Suspense fallback={<span className="inline-block h-4 w-24" aria-hidden="true" />}>
      <LaunchFooterLinkContent />
    </Suspense>
  )
}

async function LaunchHeaderActions() {
  const session = await getSession()
  const signedIn = Boolean(session?.user)

  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
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
        className="rounded-[3px] px-2.5 sm:px-3"
        nativeButton={false}
        render={(
          <TrackedLink
            href={signedIn ? "/library" : "/sign-up"}
            analytics={{
              event: "landing_cta_clicked",
              properties: ctaProperties(signedIn, "launch_header"),
            }}
          />
        )}
      >
        <span className="sm:hidden">{signedIn ? "Open" : "Start"}</span>
        <span className="hidden sm:inline">
          {signedIn ? "Open library" : "Create library"}
        </span>
      </Button>
    </div>
  )
}

export function LaunchHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center justify-between gap-4 px-5 md:px-10">
        <Brand compactOnMobile />
        <Suspense
          fallback={(
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Skeleton className="h-8 w-16 rounded-[3px] sm:w-28" aria-busy="true" />
            </div>
          )}
        >
          <LaunchHeaderActions />
        </Suspense>
      </div>
    </header>
  )
}
