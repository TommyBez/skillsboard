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
import { withPostHogEventScope } from "@/lib/posthog-scope-state"

export type ClientAnalyticsEvent = AnalyticsEventCapture

type ClientAnalyticsCaptureArgs<EventName extends CapturableAnalyticsEventName> =
  RequiredAnalyticsPropertyKeys<AnalyticsEventProperties<EventName>> extends never
    ? [properties?: AnalyticsEventProperties<EventName>, options?: CaptureOptions]
    : [properties: AnalyticsEventProperties<EventName>, options?: CaptureOptions]

export function captureAnalyticsEvent<EventName extends CapturableAnalyticsEventName>(
  event: EventName,
  ...args: ClientAnalyticsCaptureArgs<EventName>
) {
  const capture = posthogReadyForAnalyticsCapture()
  const timestamp = new Date()
  void capture.then((ready) =>
    ready?.posthog.capture(
      event,
      withPostHogEventScope(
        args[0] as Record<string, unknown> | undefined,
        ready.eventScope,
      ),
      { ...args[1], timestamp: args[1]?.timestamp ?? timestamp },
    ),
  )
}

export function captureClientAnalyticsEvent(analytics: ClientAnalyticsEvent) {
  const capture = posthogReadyForAnalyticsCapture()
  const timestamp = new Date()
  void capture.then((ready) =>
    ready?.posthog.capture(
      analytics.event,
      withPostHogEventScope(
        "properties" in analytics
          ? (analytics.properties as Record<string, unknown>)
          : undefined,
        ready.eventScope,
      ),
      { timestamp },
    ),
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
