"use client"

import type { AnchorHTMLAttributes } from "react"
import posthog from "posthog-js"

interface TrackedAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string
  eventProperties?: Record<string, string | number | boolean | null>
}

export function TrackedAnchor({
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        posthog.capture(eventName, eventProperties)
        onClick?.(event)
      }}
    />
  )
}
