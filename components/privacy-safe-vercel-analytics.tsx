"use client"

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next"

import { sanitizeAnalyticsUrl } from "@/lib/posthog-client-privacy"

function beforeSend(event: BeforeSendEvent) {
  return {
    ...event,
    url: sanitizeAnalyticsUrl(event.url),
  }
}

export function PrivacySafeVercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />
}
