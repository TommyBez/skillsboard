import { posthogReady } from "@/lib/posthog-client"

// Kick off the lazy load once the browser is idle; see lib/posthog-client.ts
// for why posthog-js is no longer part of the entry bundle. Starting at idle
// rather than at hydration keeps the ~70 kB fetch and its evaluation out of
// the critical first-paint window on slow connections. Captures fired before
// init resolves are queued by the promise chain, so nothing is dropped — the
// initial pageview is still captured at init, a beat later than before.
if (typeof window.requestIdleCallback === "function") {
  window.requestIdleCallback(() => void posthogReady(), { timeout: 2000 })
} else {
  window.setTimeout(() => void posthogReady(), 800)
}
