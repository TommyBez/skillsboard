"use client"

import { useLayoutEffect } from "react"

import { registerPostHogIdentity } from "@/lib/posthog-scope"

interface PostHogIdentityProps {
  teamId?: string
  /** `null` resolves optional-user without changing a persisted PostHog user. */
  userId: string | null
}

export function PostHogIdentity({ teamId, userId }: PostHogIdentityProps) {
  useLayoutEffect(
    () => registerPostHogIdentity({ teamId, userId }),
    [teamId, userId],
  )

  return null
}
