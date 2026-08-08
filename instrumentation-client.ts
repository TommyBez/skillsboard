import { isInstallableCollectionPathname } from "@/lib/analytics-url-privacy"
import {
  posthogReady,
  startPostHogRouteTransition,
} from "@/lib/posthog-client"

const isBrowser = typeof window !== "undefined"
let idleCallbackId: number | null = null
let timeoutId: number | null = null

function cancelScheduledPostHog() {
  if (!isBrowser) return

  if (idleCallbackId !== null) {
    window.cancelIdleCallback(idleCallbackId)
    idleCallbackId = null
  }
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
}

function schedulePostHog() {
  if (!isBrowser || isInstallableCollectionPathname(window.location.pathname)) return

  cancelScheduledPostHog()
  if (typeof window.requestIdleCallback === "function") {
    idleCallbackId = window.requestIdleCallback(() => {
      idleCallbackId = null
      void posthogReady()
    }, { timeout: 2000 })
  } else {
    timeoutId = window.setTimeout(() => {
      timeoutId = null
      void posthogReady()
    }, 800)
  }
}

// Kick off the lazy load once the browser is idle; see lib/posthog-client.ts
// for why posthog-js is no longer part of the entry bundle. Starting at idle
// rather than at hydration keeps the ~70 kB fetch and its evaluation out of
// the critical first-paint window on slow connections. Captures fired before
// init resolves are queued by the promise chain, so nothing is dropped — the
// initial pageview is still captured at init, a beat later than before.
// Installable collection URLs are bearer-like unlisted links. The shared gate
// in lib/posthog-client.ts re-checks the current route when this callback runs.
schedulePostHog()

export function onRouterTransitionStart(url: string) {
  if (!isBrowser) return

  try {
    const destination = new URL(url, window.location.href)
    if (destination.origin === window.location.origin) {
      const destinationIsBearer = isInstallableCollectionPathname(destination.pathname)
      if (destinationIsBearer) cancelScheduledPostHog()
      if (startPostHogRouteTransition(destination.pathname)) schedulePostHog()
    }
  } catch {
    // Next.js supplies valid URLs. A malformed third-party navigation hook
    // should not interfere with routing or initialize analytics early.
  }
}
