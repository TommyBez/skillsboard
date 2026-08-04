"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { getGuideBySlug, type GuidePath } from "@/lib/seo/guides"
import { resourcePaths } from "@/lib/seo/resources"

type ResourceHeaderLocation = "guide_header" | "resources_header"
type ResourceLandingPath = GuidePath | typeof resourcePaths.index

function resolveLandingPath(pathname: string): ResourceLandingPath {
  if (pathname === resourcePaths.index) return resourcePaths.index
  if (pathname.startsWith("/guides/")) {
    const slug = pathname.slice("/guides/".length)
    const guide = getGuideBySlug(slug)
    if (guide) return guide.path
  }
  return resourcePaths.index
}

function resolveLocation(pathname: string): ResourceHeaderLocation {
  return pathname.startsWith("/guides/") ? "guide_header" : "resources_header"
}

function ctaProperties(
  landingPath: ResourceLandingPath,
  signedIn: boolean,
  location: ResourceHeaderLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  return {
    destination: signedIn ? "/library" : "/sign-up",
    landing_path: landingPath,
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}

export function ResourceHeaderActions() {
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()
  const landingPath = resolveLandingPath(pathname)
  const location = resolveLocation(pathname)
  const onResourcesIndex = pathname === resourcePaths.index

  if (isPending) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={resourcePaths.index}
          aria-current={onResourcesIndex ? "page" : undefined}
          className="px-2 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-3 sm:text-xs"
        >
          Resources
        </Link>
        <ThemeToggle />
        <Skeleton className="h-8 w-14 rounded-[3px] sm:w-28" aria-busy="true" />
      </div>
    )
  }

  const signedIn = Boolean(session?.user)

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Link
        href={resourcePaths.index}
        aria-current={onResourcesIndex ? "page" : undefined}
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
