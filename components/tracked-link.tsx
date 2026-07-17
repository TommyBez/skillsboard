"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import posthog from "posthog-js"

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  eventName: string
  eventProperties?: Record<string, string | number | boolean | null>
}

export function TrackedLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        posthog.capture(eventName, eventProperties)
        onClick?.(event)
      }}
    />
  )
}
