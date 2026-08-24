"use client"

import { useLayoutEffect } from "react"

import { registerPostHogIdentity } from "@/lib/posthog-scope"

interface PostHogIdentityProps {
  teamId?: string
  userId: string
}

export function PostHogIdentity({ teamId, userId }: PostHogIdentityProps) {
  useLayoutEffect(
    () => registerPostHogIdentity({ teamId, userId }),
    [teamId, userId],
  )

  return null
}
