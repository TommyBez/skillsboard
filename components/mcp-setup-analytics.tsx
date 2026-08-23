"use client"

import { useEffect } from "react"

import { captureAnalyticsEvent } from "@/lib/analytics-client"

/**
 * The view of `/connect`, the public page where an agent gets connected.
 *
 * Not team scoped: the page is readable before an account exists, so most of
 * these views have no team behind them, and asking for one would have meant
 * reading the session on a page that has to stay prerendered. The team scoped
 * half of the funnel lives on `/start`, where the team is already known.
 */
export function McpSetupAnalytics() {
  useEffect(() => {
    captureAnalyticsEvent("mcp_setup_viewed")
  }, [])

  return null
}
