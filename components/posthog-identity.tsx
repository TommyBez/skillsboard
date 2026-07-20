"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

interface PostHogIdentityProps {
  userId: string
}

export function PostHogIdentity({ userId }: PostHogIdentityProps) {
  useEffect(() => {
    posthog.identify(userId)
  }, [userId])

  return null
}
