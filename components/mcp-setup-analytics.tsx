"use client"

import { useEffect } from "react"

import { captureAnalyticsEvent } from "@/lib/analytics-client"

/**
 * Team-scoped so it can act as the denominator of the MCP funnel:
 * `mcp_setup_viewed` → `mcp_config_copied` grouped by `team_id`. Without
 * the team on both ends every view lands in the null-team bucket.
 */
export function McpSetupAnalytics({ teamId }: { teamId: string }) {
  useEffect(() => {
    captureAnalyticsEvent("mcp_setup_viewed", { team_id: teamId })
  }, [teamId])

  return null
}
