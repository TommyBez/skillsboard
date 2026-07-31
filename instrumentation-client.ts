import {
  sanitizeAnalyticsUrl,
  sanitizePostHogUrlProperties,
} from "@/lib/analytics-url-privacy"
import { loadPostHog } from "@/lib/posthog-browser"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
if (token) {
  // Deferred so the SDK loads as its own chunk instead of blocking every
  // route's critical JS. init() still runs during startup, immediately after
  // the chunk arrives, and captures the initial pageview itself.
  void loadPostHog().then((posthog) => {
    posthog.init(token, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      before_send: (capture) => {
        if (!capture) return null

        return {
          ...capture,
          properties: sanitizePostHogUrlProperties(capture.properties),
          $set: sanitizePostHogUrlProperties(capture.$set),
          $set_once: sanitizePostHogUrlProperties(capture.$set_once),
        }
      },
      capture_pageview: "history_change",
      defaults: "2026-01-30",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      respect_dnt: true,
      session_recording: {
        maskCapturedNetworkRequestFn: (request) => ({
          ...request,
          name: sanitizeAnalyticsUrl(request.name),
        }),
        recordBody: false,
        recordHeaders: false,
      },
    })
  })
}
