"use client"

import type { MouseEventHandler } from "react"
import posthog from "posthog-js"
import type { CaptureOptions } from "posthog-js"

import type {
  AnalyticsCapturedEventCapture,
  AnalyticsCapturedEventProperties,
  CapturableAnalyticsEventName,
} from "@/analytics/posthog/events"

export type ClientAnalyticsEvent = AnalyticsCapturedEventCapture

type ClientAnalyticsCaptureArgs<EventName extends CapturableAnalyticsEventName> =
  keyof AnalyticsCapturedEventProperties<EventName> extends never
    ? [properties?: undefined, options?: CaptureOptions]
    : [properties: AnalyticsCapturedEventProperties<EventName>, options?: CaptureOptions]

export function captureAnalyticsEvent<EventName extends CapturableAnalyticsEventName>(
  event: EventName,
  ...args: ClientAnalyticsCaptureArgs<EventName>
) {
  posthog.capture(event, args[0], args[1])
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
