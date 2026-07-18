"use client"

import type { AnchorHTMLAttributes } from "react"

import {
  createAnalyticsClickHandler,
  type ClientAnalyticsEvent,
} from "@/lib/analytics-client"

interface TrackedAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  analytics?: ClientAnalyticsEvent
}

export function TrackedAnchor({
  analytics,
  onClick,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={createAnalyticsClickHandler(analytics, onClick)}
    />
  )
}
