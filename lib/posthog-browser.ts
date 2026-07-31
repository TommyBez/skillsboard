// Single lazy entry point for the browser PostHog instance. Every consumer
// awaits the same dynamic import, so the SDK stays out of route bundles and
// loads once as its own chunk (kicked off at startup by
// instrumentation-client.ts).
let posthogModule: Promise<typeof import("posthog-js").default> | null = null

export function loadPostHog() {
  posthogModule ??= import("posthog-js").then((mod) => mod.default)
  return posthogModule
}
