# Client JS performance: −23% critical-path JavaScript

July 2026. Every route was shipping 290–433 kB (gzip) of critical-path client
JavaScript. Three changes cut the total across all prerendered routes by
**23.0%**, with the signed-in app surfaces down 23–26% and the SEO guide pages
down 28%. No feature was removed — heavy code moved off the critical path into
lazily loaded chunks.

## How to measure

The measurement is reproducible from a production build:

```sh
pnpm build
node scripts/measure-bundles.mjs        # per-route table, sorted by gzip size
node scripts/measure-bundles.mjs --json # machine-readable snapshot
```

The script reads each prerendered route's HTML in `.next/server/app` and sums
the raw and gzip sizes of every `<script src>` chunk the document references —
i.e. exactly the JavaScript a browser downloads before the page is
interactive. Compare two snapshots (baseline commit vs. working tree) to get
per-route deltas.

## What changed

1. **PostHog off the critical path.** `posthog-js` was statically imported by
   `instrumentation-client.ts` and the analytics helpers, bundling the full
   SDK — including the session-recorder and surveys extensions (~222 kB raw,
   ~72 kB gzip) — into every route. Now:
   - `next.config.ts` aliases `posthog-js` to `posthog-js/dist/module.slim`,
     so optional extensions (recorder, surveys, dead clicks, …) load on
     demand through the existing `/ingest/static` rewrite instead of being
     bundled.
   - All consumers go through `lib/posthog-browser.ts`, which dynamically
     imports the SDK once. `instrumentation-client.ts` kicks the import off
     at startup, so `init()` still runs immediately after the chunk arrives
     and captures the initial pageview itself; capture/identify/reset calls
     await the same shared promise, preserving ordering.

2. **Motion behind `LazyMotion`.** Components imported the full-featured
   `motion` proxy (~135 kB raw / ~44 kB gzip on 14 routes). All consumers now
   render `m.*` components (`motion/react-m`), and `MotionProvider` in the
   root layout loads the `domMax` feature set asynchronously
   (`lib/motion-features.ts`), so the animation runtime ships as its own
   deferred chunk. `ReorderList` still needs the eager `Reorder` API, so
   `prompt-examples-editor.tsx` lazy-loads it only when several prompts
   exist.

3. **⌘K palette split.** `components/command-menu.tsx` is now only the
   controller (global shortcut + open state); the palette surface and the
   dialogs its actions open live in `components/command-menu-body.tsx`,
   loaded lazily and warmed during browser idle time so the first ⌘K still
   feels instant.

## Results (kB gzip, critical-path JS per route)

| Route | Before | After | Δ |
| --- | ---: | ---: | ---: |
| /guides/* (8 routes) | 336.5 | 241.9 | −28.1% |
| /settings/mcp | 433.4 | 320.6 | −26.0% |
| /settings/organization | 426.4 | 315.6 | −26.0% |
| /collections | 425.1 | 317.2 | −25.4% |
| /collections/[collectionId] | 430.2 | 324.0 | −24.7% |
| /discover | 432.7 | 329.6 | −23.8% |
| /library | 432.0 | 331.4 | −23.3% |
| /resources | 291.3 | 234.1 | −19.6% |
| / (home variants) | 293.9 | 236.7 | −19.5% |
| /privacy, /terms, /contact | 297.6 | 240.4 | −19.2% |
| /onboarding | 307.4 | 250.1 | −18.6% |
| /sign-in, /sign-up | 331.4 | 274.0 | −17.3% |
| /settings/email | 352.9 | 295.6 | −16.2% |
| **Total (30 prerendered routes)** | **9862.4** | **7591.5** | **−23.0%** |

Baseline: commit `585ac7e`. Both builds measured with
`scripts/measure-bundles.mjs` on the same machine, `next build` production
output.

## Verified

- `pnpm check` (typecheck + 71 unit/pulse tests) passes.
- Headless-Chromium smoke test against `next start`: /privacy, /resources,
  /guides/share-agent-skills-with-your-team, /contact, /sign-in,
  /email/unsubscribe all render without console or page errors, and the
  deferred motion features chunk activates scroll/entrance animations.
