"use client"

import type posthogJs from "posthog-js"

import {
  sanitizeAnalyticsUrl,
  sanitizePostHogUrlProperties,
} from "@/lib/analytics-url-privacy"

type PostHogClient = typeof posthogJs

export interface PostHogIdentity {
  teamId?: string | null
  userId: string | null
}

let ready: Promise<PostHogClient | null> | null = null

/** Applies the app identity and active team using native PostHog state. */
export function applyPostHogIdentity(
  posthog: PostHogClient,
  { teamId = null, userId }: PostHogIdentity,
) {
  if (userId) {
    const identifiedUser = posthog.get_property("$user_id")
    if (
      typeof identifiedUser === "string" &&
      identifiedUser.length > 0 &&
      identifiedUser !== userId
    ) {
      posthog.reset()
    }
    if (posthog.get_property("$user_id") !== userId) posthog.identify(userId)
  }

  const registeredTeam = posthog.get_property("team_id")
  if (teamId && registeredTeam !== teamId) {
    posthog.register({ team_id: teamId })
  } else if (!teamId && registeredTeam != null) {
    posthog.unregister("team_id")
  }
}

/**
 * Loads and initializes the PostHog singleton on demand.
 *
 * posthog-js is ~70 kB gzipped. Imported statically from
 * `instrumentation-client.ts` it sat in every page's entry bundle — including
 * the landing page's, where it was the largest unused chunk on the critical
 * path. The dynamic import keeps it out of the initial bundle; the route
 * tracker starts it after hydration, or the first custom capture starts it on
 * demand.
 *
 * Route tracking and custom events share this singleton. Routes apply identity
 * before their pageview; later browser events inherit PostHog's registered
 * properties. Without a project token (local dev, previews) it resolves to
 * null and all calls no-op.
 */
export function posthogReady(): Promise<PostHogClient | null> {
  if (!ready) {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    ready = token
      ? import("posthog-js")
          .then(({ default: posthog }) => {
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
              // A single route tracker captures `$pageview` only after the
              // current user/team scope has been applied. SDK-owned pageviews
              // would race the streamed authenticated shell and duplicate it.
              capture_pageview: false,
              // Manual `$pageview` events still need SDK-owned duration and
              // leave tracking; the default disables it with auto views off.
              capture_pageleave: true,
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
          // Analytics is optional: a failed chunk load or init must not leave
          // `ready` rejected, or call sites like sign-out would hang forever.
          .catch(() => null)
      : Promise.resolve(null)
  }
  return ready
}
