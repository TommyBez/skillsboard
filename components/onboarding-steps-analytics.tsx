"use client"

import { useEffect } from "react"

import { captureAnalyticsEvent } from "@/lib/analytics-client"

/**
 * The denominator of the first-run funnel: how many new teams saw the three
 * steps, against how many of them connected an agent or sent an invitation.
 */
export function OnboardingStepsAnalytics({ teamId }: { teamId: string }) {
  useEffect(() => {
    captureAnalyticsEvent("onboarding_steps_viewed", { team_id: teamId })
  }, [teamId])

  return null
}
