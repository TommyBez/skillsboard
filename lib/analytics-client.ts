"use client"

import type { MouseEventHandler } from "react"
import type { CaptureOptions } from "posthog-js"

import type {
  AnalyticsEventCapture,
  AnalyticsEventProperties,
  CapturableAnalyticsEventName,
  RequiredAnalyticsPropertyKeys,
} from "@/analytics/posthog/events"
import { posthogReadyForAnalyticsCapture } from "@/lib/posthog-scope"

export type ClientAnalyticsEvent = AnalyticsEventCapture

type ClientAnalyticsCaptureArgs<EventName extends CapturableAnalyticsEventName> =
  RequiredAnalyticsPropertyKeys<AnalyticsEventProperties<EventName>> extends never
    ? [properties?: AnalyticsEventProperties<EventName>, options?: CaptureOptions]
    : [properties: AnalyticsEventProperties<EventName>, options?: CaptureOptions]

export function captureAnalyticsEvent<EventName extends CapturableAnalyticsEventName>(
  event: EventName,
  ...args: ClientAnalyticsCaptureArgs<EventName>
) {
  void posthogReadyForAnalyticsCapture().then((posthog) =>
    posthog?.capture(event, args[0], args[1]),
  )
}

export function captureClientAnalyticsEvent(analytics: ClientAnalyticsEvent) {
  void posthogReadyForAnalyticsCapture().then((posthog) =>
    posthog?.capture(
      analytics.event,
      "properties" in analytics ? analytics.properties : undefined,
    )
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
