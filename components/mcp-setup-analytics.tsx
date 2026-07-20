"use client"

import { useEffect } from "react"

import { captureAnalyticsEvent } from "@/lib/analytics-client"

export function McpSetupAnalytics() {
  useEffect(() => {
    captureAnalyticsEvent("mcp_setup_viewed")
  }, [])

  return null
}
