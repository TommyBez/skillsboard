import { ArrowRightIcon, CableIcon } from "lucide-react"
import Link from "next/link"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { TrackedLink } from "@/components/tracked-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"

/**
 * Where in a page a call to action sits. Every marketing surface uses the same
 * four slots, and which page it was is read from `$pathname` on the event
 * rather than spelled a second time in this union.
 */
export type CtaLocation = "header" | "hero" | "inline" | "closing"

/**
 * The landing page's one action, stated once.
 *
 * It used to branch on the session: signed-in visitors were offered "Open your
 * library" instead. That made every call to action on the page an async,
 * session-dependent render — three Suspense boundaries, three skeletons, and a
 * fallback that had to be a *working* link because it was the no-script final
 * render. The landing page is the acquisition surface: the invitation is the
 * same for everyone, and a signed-in visitor who takes it lands in their
 * library anyway. One label, no session read, no streaming hole.
 */
export const primaryAction = {
  href: "/sign-up",
  label: "Create your team library",
} as const

export function primaryCtaEventProperties(
  location: CtaLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  return {
    destination: primaryAction.href,
    location,
  }
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
export function HomeHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle chrome="marketing" className="size-8 sm:size-9" />
      <nav className="flex items-center gap-2" aria-label="Main navigation">
        <Button
          size="sm"
          variant="ghost"
          className="lp-cta lp-cta-ghost relative hidden h-9 min-h-11 sm:inline-flex"
          nativeButton={false}
          render={<Link href="/sign-in" />}
        >
          Sign in
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="lp-cta lp-cta-header-action relative min-h-11 sm:h-9"
          nativeButton={false}
          render={(
            <TrackedLink
              href={primaryAction.href}
              analytics={{
                event: "landing_cta_clicked",
                properties: primaryCtaEventProperties("header"),
              }}
            />
          )}
        >
          {/* "Sign up", not "Start": Lighthouse flags "Start" as
              non-descriptive link text, and it names the destination. */}
          <span className="sm:hidden">Sign up</span>
          <span className="hidden sm:inline">{primaryAction.label}</span>
          <ArrowRightIcon
            className="lp-cta-arrow hidden sm:block"
            data-icon="inline-end"
          />
        </Button>
      </nav>
    </div>
  )
}

export function HomeHeroActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="lp-magnetic inline-flex" data-magnetic>
        <Button
          size="lg"
          className="lp-cta lp-cta-primary relative"
          nativeButton={false}
          render={(
            <TrackedLink
              href={primaryAction.href}
              analytics={{
                event: "landing_cta_clicked",
                properties: primaryCtaEventProperties("hero"),
              }}
            />
          )}
        >
          {primaryAction.label}
          <ArrowRightIcon className="lp-cta-arrow" data-icon="inline-end" />
        </Button>
      </span>
      <Button
        size="lg"
        variant="outline"
        className="lp-cta lp-cta-secondary relative"
        nativeButton={false}
        render={(
          <TrackedLink
            href="#mcp"
            analytics={{
              event: "mcp_entry_clicked",
              properties: mcpEntryEventProperties("landing_hero", "#mcp"),
            }}
          />
        )}
      >
        See MCP access
        <ArrowRightIcon className="lp-cta-arrow" data-icon="inline-end" />
      </Button>
    </div>
  )
}

export function HomeMcpActions() {
  return (
    <span className="lp-magnetic inline-flex" data-magnetic>
      <Button
        size="lg"
        className="lp-cta lp-cta-primary relative"
        nativeButton={false}
        render={(
          <TrackedLink
            href={primaryAction.href}
            analytics={{
              event: "mcp_entry_clicked",
              properties: mcpEntryEventProperties(
                "landing_section",
                primaryAction.href,
              ),
            }}
          />
        )}
      >
        <CableIcon data-icon="inline-start" />
        Create a library to connect
        <ArrowRightIcon className="lp-cta-arrow" data-icon="inline-end" />
      </Button>
    </span>
  )
}

export function HomeFinalActions() {
  return (
    <span className="lp-magnetic inline-flex" data-magnetic>
      <Button
        size="lg"
        className="lp-cta lp-cta-primary relative"
        nativeButton={false}
        render={(
          <TrackedLink
            href={primaryAction.href}
            analytics={{
              event: "landing_cta_clicked",
              properties: primaryCtaEventProperties("closing"),
            }}
          />
        )}
      >
        {primaryAction.label}
        <ArrowRightIcon className="lp-cta-arrow" data-icon="inline-end" />
      </Button>
    </span>
  )
}
