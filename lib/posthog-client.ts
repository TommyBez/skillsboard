"use client"

import type posthogJs from "posthog-js"

import {
  sanitizeAnalyticsUrl,
  sanitizePostHogUrlProperties,
} from "@/lib/analytics-url-privacy"

type PostHogClient = typeof posthogJs

let ready: Promise<PostHogClient | null> | null = null

/**
 * Loads and initializes the PostHog singleton on demand.
 *
 * posthog-js is ~70 kB gzipped. Imported statically from
 * `instrumentation-client.ts` it sat in every page's entry bundle — including
 * the landing page's, where it was the largest unused chunk on the critical
 * path. The dynamic import keeps it out of the initial bundle while still
 * starting during app startup, so pageview/session capture behave as before.
 *
 * Every call site chains on this one promise: init runs in the first `.then`
 * ever registered (app startup, via `instrumentation-client.ts`), so captures
 * and identifies registered later are guaranteed to run after init — events
 * fired during the fetch are queued, not dropped. Without a project token
 * (local dev, previews) it resolves to null and all calls no-op, matching the
 * previous behaviour.
 */
export function posthogReady(): Promise<PostHogClient | null> {
  if (!ready) {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    ready = token
      ? import("posthog-js").then(({ default: posthog }) => {
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
          return posthog
        })
      : Promise.resolve(null)
  }
  return ready
}
