import { ArrowRightIcon, CableIcon } from "lucide-react"
import Link from "next/link"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import base from "@/components/landing/styles/base.module.css"
import { TrackedLink } from "@/components/tracked-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
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

/**
 * Streaming placeholder for the command strip. Same reasoning as
 * `HomeCtaFallback`: without script this is the final render, so it has to be
 * the working anonymous strip rather than two grey boxes.
 */
export function HomeHeaderActionsFallback() {
  return <HomeHeaderActionsView signedIn={false} />
}

/**
 * Streaming placeholder for a primary action.
 *
 * A Suspense fallback is only ever replaced by script, so without JavaScript
 * this is the final render — a skeleton would leave the page's main action as
 * a dead grey box. Render the anonymous action instead: it is a working link
 * to the same place the resolved button sends a signed-out visitor, and for a
 * signed-in one it is replaced the moment the session lands.
 *
 * It carries `ctaPrimary` for the same reason it carries an href: without
 * script this is what a visitor sees, and it has to be the same button as the
 * one beside it. Without that class it rendered as the bare filled variant —
 * fill clipped to the padding box, so two pixels shorter than its neighbours,
 * and with no lit top edge — three chapters' primary actions quietly a
 * different control from the hero's.
 */
export function HomeCtaFallback({ className }: { className?: string }) {
  const primary = primaryAction(false)

  return (
    <Button
      size="lg"
      className={`${base.ctaButton} ${base.ctaPrimary} ${className ?? ""}`}
      nativeButton={false}
      render={<Link href={primary.href} />}
    >
      {primary.label}
      <ArrowRightIcon className={base.ctaArrow} data-icon="inline-end" />
    </Button>
  )
}

/**
 * The command strip's controls.
 *
 * The strip's action is the *same* action as the hero's, with the same fixed
 * label, and for four rounds it was the same filled slab too — two solid green
 * calls to action 570px apart in one fold, the header instance carrying 64% of
 * the hero instance's luminance mass and 60% of its green. Two independent
 * reviews measured that and called it a competition rather than a hierarchy.
 *
 * A sticky header action is a deliberate conversion surface, so it is not
 * deleted and not shrunk (the label is fixed copy, so it cannot be). It is
 * demoted: `variant="outline"` for the geometry and `ctaHeaderAction` for the
 * accent, which keeps the shape, the size, the press model, the arrow and the
 * green — as a 45% edge and a 12% field rather than as 7,164 square pixels of
 * fill. Measured after: 9% of the hero action's green excess, and a painted
 * extent that is exactly its box, so it finally shares the theme toggle's 36
 * rows and its centre.
 */
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
            className={`${base.ctaButton} ${base.ctaGhost} hidden h-9 sm:inline-flex`}
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            Sign in
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className={`${base.ctaButton} ${base.ctaHeaderAction} sm:h-9`}
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

/**
 * The hero offers two actions, so its placeholder has to as well — the generic
 * one renders a single button, which without script left the hero permanently
 * missing its secondary route into the MCP chapter.
 */
export function HomeHeroActionsFallback() {
  return <HomeHeroActionsView signedIn={false} />
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
