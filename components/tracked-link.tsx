"use client"

import type { ComponentProps } from "react"
import Link from "next/link"

import {
  createAnalyticsClickHandler,
  type ClientAnalyticsEvent,
} from "@/lib/analytics-client"

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  analytics?: ClientAnalyticsEvent
}

export function TrackedLink({
  analytics,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={createAnalyticsClickHandler(analytics, onClick)}
    />
  )
}
