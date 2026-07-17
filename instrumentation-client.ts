import posthog from "posthog-js"

import {
  getAnalyticsDeploymentEnvironment,
  sanitizeAnalyticsUrl,
  sanitizePostHogUrlProperties,
} from "@/lib/posthog-client-privacy"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    before_send: (capture) => {
      if (!capture) return null

      return {
        ...capture,
        properties: {
          ...sanitizePostHogUrlProperties(capture.properties),
          analytics_schema_version: 2,
          deployment_environment: getAnalyticsDeploymentEnvironment(),
        },
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
}
