"use client"

import { useLayoutEffect, useRef } from "react"
import {
  usePathname,
  useSelectedLayoutSegment,
} from "next/navigation"

import { sanitizeAnalyticsUrl } from "@/lib/analytics-url-privacy"
import { applyPostHogIdentity, posthogReady } from "@/lib/posthog-client"

const scopedRootSegments = new Set([
  "(account)",
  "(app)",
  "consent",
  "onboarding",
])

function usePostHogPageView({
  enabled = true,
  teamId = null,
  userId,
}: {
  enabled?: boolean
  teamId?: string | null
  userId: string | null
}) {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useLayoutEffect(() => {
    const capturePageView = previousPathname.current !== pathname
    previousPathname.current = pathname
    if (!enabled) return

    const timestamp = new Date()
    const url = sanitizeAnalyticsUrl(window.location.href)
    void posthogReady().then((posthog) => {
      if (!posthog) return

      // `team_id` is managed beside `identify`, as PostHog context for every
      // subsequent event. The pageview is the only event that must wait for it.
      applyPostHogIdentity(posthog, { teamId, userId })
      if (!capturePageView) return

      posthog.capture(
        "$pageview",
        {
          $current_url: url,
          $pathname: pathname,
          team_id: teamId,
        },
        { timestamp },
      )
    })
  }, [enabled, pathname, teamId, userId])
}

/** Tracks public routes; scoped routes supply identity from their own layout. */
export function PostHogNavigation() {
  const rootSegment = useSelectedLayoutSegment()
  usePostHogPageView({
    enabled: !rootSegment || !scopedRootSegments.has(rootSegment),
    userId: null,
  })
  return null
}

/** Identifies the person/team and emits the route's one canonical pageview. */
export function PostHogRoute({
  teamId,
  userId,
}: {
  teamId?: string
  userId: string | null
}) {
  usePostHogPageView({ teamId, userId })
  return null
}
