"use client"

import { useEffect } from "react"

import { posthogReady } from "@/lib/posthog-client"

interface PostHogIdentityProps {
  userId: string
}

export function PostHogIdentity({ userId }: PostHogIdentityProps) {
  useEffect(() => {
    void posthogReady().then((posthog) => posthog?.identify(userId))
  }, [userId])

  return null
}
