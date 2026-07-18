"use client"

import type { MouseEventHandler } from "react"
import posthog from "posthog-js"

import type {
  AnalyticsCapturedEventCapture,
  AnalyticsCapturedEventPropertiesArgs,
  CapturableAnalyticsEventName,
} from "@/analytics/posthog/events"

export type ClientAnalyticsEvent = AnalyticsCapturedEventCapture

export function captureAnalyticsEvent<EventName extends CapturableAnalyticsEventName>(
  event: EventName,
  ...args: AnalyticsCapturedEventPropertiesArgs<EventName>
) {
  posthog.capture(event, args[0])
}

export function captureClientAnalyticsEvent(analytics: ClientAnalyticsEvent) {
  posthog.capture(
    analytics.event,
    "properties" in analytics ? analytics.properties : undefined,
  )
}

export function createAnalyticsClickHandler<Element extends HTMLElement>(
  analytics: ClientAnalyticsEvent | undefined,
  onClick?: MouseEventHandler<Element>,
): MouseEventHandler<Element> | undefined {
  if (!analytics && !onClick) return undefined

  return (event) => {
    if (analytics) captureClientAnalyticsEvent(analytics)
    onClick?.(event)
  }
}
