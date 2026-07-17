"use client"

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next"

import {
  isSensitiveAnalyticsUrl,
  sanitizeAnalyticsUrl,
} from "@/lib/posthog-client-privacy"

function beforeSend(event: BeforeSendEvent) {
  if (isSensitiveAnalyticsUrl(event.url)) return null

  return {
    ...event,
    url: sanitizeAnalyticsUrl(event.url),
  }
}

export function PrivacySafeVercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />
}
