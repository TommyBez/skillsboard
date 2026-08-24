"use client"

import { useEffect } from "react"

import { captureAnalyticsEvent } from "@/lib/analytics-client"

/**
 * The view of `/connect`, the authenticated page where an agent gets
 * connected.
 *
 * Team scoped: `/connect` lives behind the session now, so the team is always
 * known by the time this fires, the same as the first run on `/start`. The
 * property stays optional on the event itself (see `analytics/posthog/events.ts`)
 * so a future surface that has not resolved a team yet can still send it.
 */
export function McpSetupAnalytics({ teamId }: { teamId: string }) {
  useEffect(() => {
    captureAnalyticsEvent("mcp_setup_viewed", { team_id: teamId })
  }, [teamId])

  return null
}
