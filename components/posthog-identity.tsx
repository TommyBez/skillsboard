"use client"

import { useEffect } from "react"
import { useSelectedLayoutSegment } from "next/navigation"

import { posthogReady, syncPostHogIdentity } from "@/lib/posthog-client"

const identityScopedRootSegments = new Set([
  "(account)",
  "(app)",
  "consent",
  "onboarding",
])

interface PostHogIdentityProps {
  teamId?: string | null
  userId: string | null
}

/** Starts native pageview tracking on routes that do not provide identity. */
export function PostHogBootstrap() {
  const rootSegment = useSelectedLayoutSegment()
  const isIdentityScoped =
    rootSegment !== null && identityScopedRootSegments.has(rootSegment)

  useEffect(() => {
    if (!isIdentityScoped) void posthogReady()
  }, [isIdentityScoped])

  return null
}

/** Keeps PostHog's native person and event context aligned with the app. */
export function PostHogIdentity({ teamId, userId }: PostHogIdentityProps) {
  useEffect(() => {
    void syncPostHogIdentity({ teamId, userId })
  }, [teamId, userId])

  return null
}
