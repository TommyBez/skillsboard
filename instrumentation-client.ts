import posthog from "posthog-js"

import {
  getAnalyticsDeploymentEnvironment,
  isSensitiveAnalyticsUrl,
  sanitizeAnalyticsUrl,
  sanitizeAnalyticsValue,
} from "@/lib/posthog-client-privacy"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    autocapture: false,
    before_send: (capture) => {
      if (!capture) return null
      const currentUrl = capture.properties?.$current_url
      if (
        (capture.event === "$pageview" || capture.event === "$pageleave")
        && typeof currentUrl === "string"
        && isSensitiveAnalyticsUrl(currentUrl)
      ) {
        return null
      }

      return {
        ...capture,
        properties: {
          ...sanitizeAnalyticsValue(capture.properties),
          analytics_schema_version: 2,
          deployment_environment: getAnalyticsDeploymentEnvironment(),
        },
        $set: capture.$set ? sanitizeAnalyticsValue(capture.$set) : capture.$set,
        $set_once: capture.$set_once ? sanitizeAnalyticsValue(capture.$set_once) : capture.$set_once,
      }
    },
    capture_pageview: "history_change",
    defaults: "2026-01-30",
    capture_exceptions: false,
    debug: process.env.NODE_ENV === "development",
    disable_session_recording: true,
    get_current_url: sanitizeAnalyticsUrl,
    respect_dnt: true,
  })
}
