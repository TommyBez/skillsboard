"use client"

import { useEffect } from "react"

import { loadPostHog } from "@/lib/posthog-browser"

interface PostHogIdentityProps {
  userId: string
}

export function PostHogIdentity({ userId }: PostHogIdentityProps) {
  useEffect(() => {
    void loadPostHog().then((posthog) => posthog.identify(userId))
  }, [userId])

  return null
}
