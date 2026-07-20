"use client"

import { useEffect, useRef } from "react"

import { captureAnalyticsEvent } from "@/lib/analytics-client"
import type { LibraryFilterState } from "@/lib/library-view-state"

interface TeamLibraryAnalyticsProps {
  filterState: LibraryFilterState
  navigationKey: string
  skillCount: number
  teamId: string
}

export function TeamLibraryAnalytics({
  filterState,
  navigationKey,
  skillCount,
  teamId,
}: TeamLibraryAnalyticsProps) {
  const lastCapturedRouteState = useRef<string | null>(null)

  useEffect(() => {
    const routeState = `${teamId}\u0000${navigationKey}`
    if (lastCapturedRouteState.current === routeState) return
    lastCapturedRouteState.current = routeState

    captureAnalyticsEvent("team_library_viewed", {
      filter_state: filterState,
      has_skills: skillCount > 0,
      skill_count: skillCount,
      team_id: teamId,
    })
  }, [filterState, navigationKey, skillCount, teamId])

  return null
}
