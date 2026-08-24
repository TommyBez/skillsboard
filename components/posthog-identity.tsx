"use client"

import { useEffect } from "react"

import { syncPostHogIdentity } from "@/lib/posthog-client"

interface PostHogIdentityProps {
  teamId?: string | null
  userId: string | null
}

/** Keeps PostHog's native person and event context aligned with the app. */
export function PostHogIdentity({ teamId, userId }: PostHogIdentityProps) {
  useEffect(() => {
    void syncPostHogIdentity({ teamId, userId })
  }, [teamId, userId])

  return null
}
