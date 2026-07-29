import { ArrowRightIcon, CableIcon } from "lucide-react"
import Link from "next/link"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import base from "@/components/landing/styles/base.module.css"
import { TrackedLink } from "@/components/tracked-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"
import { getSession } from "@/lib/session"

export type CtaLocation = "header" | "hero" | "closing" | "launch_demo"

export function primaryAction(signedIn: boolean): {
  href: "/library" | "/sign-up"
  label: string
} {
  return signedIn
    ? { href: "/library", label: "Open your library" }
    : { href: "/sign-up", label: "Create your team library" }
}

export function primaryCtaEventProperties(
  signedIn: boolean,
  location: CtaLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  const primary = primaryAction(signedIn)
  return {
    destination: primary.href,
    landing_path: "/",
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}

export function HomeHeaderActionsFallback() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle className={`${base.headerToggle} size-8 sm:size-9`} />
      <nav className="flex items-center gap-2" aria-label="Main navigation" aria-busy="true">
        <Skeleton className="hidden h-9 w-[4.75rem] rounded-[3px] sm:block" />
        <Skeleton className="h-8 w-14 rounded-[3px] sm:h-9 sm:w-[13.5rem]" />
      </nav>
    </div>
  )
}

export function HomeCtaFallback() {
  return <Skeleton className="h-12 w-56 rounded-[3px]" aria-busy="true" />
}

function HomeHeaderActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle className={`${base.headerToggle} size-8 sm:size-9`} />
      <nav className="flex items-center gap-2" aria-label="Main navigation">
        {!signedIn ? (
          <Button
            size="sm"
            variant="ghost"
            className={`${base.ctaButton} ${base.ctaGhost} hidden h-9 px-3.5 sm:inline-flex`}
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            Sign in
          </Button>
        ) : null}
        <Button
          size="sm"
          className={`${base.ctaButton} ${base.ctaPrimary} px-2.5 sm:h-9 sm:px-4`}
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
            className={`${base.ctaArrow} hidden sm:block`}
            data-icon="inline-end"
          />
        </Button>
      </nav>
    </div>
  )
}

export async function HomeHeaderActions() {
  const session = await getSession()
  return <HomeHeaderActionsView signedIn={Boolean(session?.user)} />
}

function HomeHeroActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <div className="flex flex-wrap gap-3">
      <span className={base.magnetic} data-magnetic>
        <Button
          size="lg"
          className={`${base.ctaButton} ${base.ctaPrimary}`}
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
          <ArrowRightIcon className={base.ctaArrow} data-icon="inline-end" />
        </Button>
      </span>
      <Button
        size="lg"
        variant="outline"
        className={`${base.ctaButton} ${base.ctaSecondary}`}
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
        <ArrowRightIcon className={base.ctaArrow} data-icon="inline-end" />
      </Button>
    </div>
  )
}

export async function HomeHeroActions() {
  const session = await getSession()
  return <HomeHeroActionsView signedIn={Boolean(session?.user)} />
}

function HomeMcpActionsView({ signedIn }: { signedIn: boolean }) {
  const href = signedIn ? "/settings/mcp" : "/sign-up"

  return (
    <span className={base.magnetic} data-magnetic>
      <Button
        size="lg"
        className={`${base.ctaButton} ${base.ctaPrimary}`}
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
        <ArrowRightIcon className={base.ctaArrow} data-icon="inline-end" />
      </Button>
    </span>
  )
}

export async function HomeMcpActions() {
  const session = await getSession()
  return <HomeMcpActionsView signedIn={Boolean(session?.user)} />
}

function HomeFinalActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <span className={base.magnetic} data-magnetic>
      <Button
        size="lg"
        className={`${base.ctaButton} ${base.ctaPrimary}`}
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
        <ArrowRightIcon className={base.ctaArrow} data-icon="inline-end" />
      </Button>
    </span>
  )
}

export async function HomeFinalActions() {
  const session = await getSession()
  return <HomeFinalActionsView signedIn={Boolean(session?.user)} />
}

function HomeLaunchActionsView({ signedIn }: { signedIn: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <Button
      size="lg"
      className={`${base.ctaButton} ${base.ctaPrimary}`}
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
      <ArrowRightIcon className={base.ctaArrow} data-icon="inline-end" />
    </Button>
  )
}

export async function HomeLaunchActions() {
  const session = await getSession()
  return <HomeLaunchActionsView signedIn={Boolean(session?.user)} />
}
