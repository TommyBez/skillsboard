"use client"

import type posthogJs from "posthog-js"

import {
  initialPostHogRoutePrivacyState,
  isInstallableCollectionPathname,
  type PostHogRoutePrivacyEffect,
  type PostHogRoutePrivacyState,
  sanitizeAnalyticsUrl,
  sanitizePostHogUrlProperties,
  transitionPostHogRoutePrivacy,
} from "@/lib/analytics-url-privacy"

type PostHogClient = typeof posthogJs

let client: PostHogClient | null = null
let loading: Promise<PostHogClient | null> | null = null
let unavailable = false
let routePrivacyState: PostHogRoutePrivacyState = initialPostHogRoutePrivacyState(
  typeof window === "undefined" ? "" : window.location.pathname,
)

function currentRouteIsBlocked() {
  return typeof window !== "undefined"
    && isInstallableCollectionPathname(window.location.pathname)
}

function shouldBlockPostHog() {
  return routePrivacyState !== "active" || currentRouteIsBlocked()
}

function suspendPostHog(posthog: PostHogClient) {
  posthog.stopSessionRecording()
  posthog.set_config({
    autocapture: false,
    capture_exceptions: false,
    capture_pageleave: false,
    capture_pageview: false,
  })
}

function resumePostHog(posthog: PostHogClient, capturePageview: boolean) {
  posthog.set_config({
    autocapture: true,
    capture_exceptions: true,
    capture_pageleave: "if_capture_pageview",
    capture_pageview: "history_change",
  })
  posthog.startSessionRecording()
  if (capturePageview) posthog.capture("$pageview")
}

function applyRoutePrivacyEffect(effect: PostHogRoutePrivacyEffect) {
  if (effect === "suspend") {
    if (client) suspendPostHog(client)
    return false
  }
  if (effect === "resume" || effect === "resume-with-pageview") {
    if (client) {
      resumePostHog(client, effect === "resume-with-pageview")
      return false
    }
    return true
  }
  return false
}

/**
 * Applies the privacy state before an App Router navigation. Returning true
 * asks the caller to restore an idle initialization cancelled by an earlier,
 * superseded bearer navigation.
 */
export function startPostHogRouteTransition(destinationPathname: string) {
  const currentPathname = typeof window === "undefined" ? "" : window.location.pathname
  const transition = transitionPostHogRoutePrivacy(routePrivacyState, {
    type: "navigation-start",
    currentPathname,
    destinationPathname,
  })
  routePrivacyState = transition.state
  return applyRoutePrivacyEffect(transition.effect)
}

/**
 * Reconciles the analytics state after Next.js commits a pathname change.
 * Keeping this separate from the transition-start hook prevents PostHog from
 * resuming while the previous bearer page is still mounted.
 */
export function setPostHogCommittedPathname(pathname: string) {
  const transition = transitionPostHogRoutePrivacy(routePrivacyState, {
    type: "navigation-commit",
    pathname,
  })
  routePrivacyState = transition.state
  if (applyRoutePrivacyEffect(transition.effect)) void posthogReady()
}

/**
 * Loads and initializes the PostHog singleton on demand.
 *
 * posthog-js is ~70 kB gzipped. Imported statically from
 * `instrumentation-client.ts` it sat in every page's entry bundle — including
 * the landing page's, where it was the largest unused chunk on the critical
 * path. The dynamic import keeps it out of the initial bundle while still
 * starting during app startup, so pageview/session capture behave as before.
 *
 * Every call site shares the same in-flight promise, so captures and identifies
 * registered during the import run after init. Bearer-link collection routes
 * return null both before loading and immediately before init; this second
 * check closes the race where navigation happens while the chunk is loading.
 * Without a project token (local dev, previews), all calls no-op.
 */
export function posthogReady(): Promise<PostHogClient | null> {
  if (shouldBlockPostHog() || unavailable) return Promise.resolve(null)
  if (client) return Promise.resolve(client)
  if (loading) return loading

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  if (!token) return Promise.resolve(null)

  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      if (shouldBlockPostHog()) return null

      posthog.init(token, {
        api_host: "/ingest",
        ui_host: "https://eu.posthog.com",
        before_send: (capture) => {
          if (!capture || shouldBlockPostHog()) return null

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
      client = posthog
      return posthog
    })
    // Analytics is optional: a failed chunk load or init must not leave the
    // shared promise rejected, or call sites like sign-out would hang forever.
    .catch(() => {
      unavailable = true
      return null
    })
    .finally(() => {
      loading = null
    })

  return loading
}
