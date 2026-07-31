# Client performance: −28–41% main-thread blocking, −8–15% load time

July 2026. Every route was shipping 290–433 kB (gzip) of critical-path client
JavaScript, and page loads on a throttled median device spent 200–450 ms in
long main-thread tasks after first paint. Three changes moved heavy code off
the critical path without removing any feature. Measured on real Chromium
page loads (4× CPU throttle, slow-4G network emulation, cold cache, medians
of 9 interleaved runs per route per build):

- **Total Blocking Time: −28% to −41% on every measured route** — the lab
  metric behind interactivity/INP.
- **Fully-loaded time: −8% to −15%** on all but one route.
- FCP/LCP: roughly flat (−1–3%), as expected — first paint on these
  server-rendered pages is HTML/CSS-bound, so the JS wins land on
  interactivity and load completion.
- Critical-path client JS: −14% overall (−16–19% on the app's core routes).

## Runtime benchmark (the primary measurement)

Baseline commit `585ac7e` and the optimized build were served side by side
(`next start`, same machine, same seeded Postgres database, same session).
Each run used a fresh browser context with CDP throttling: 4× CPU, 1.6 Mbps
down / 150 ms RTT. Runs were interleaved base/optimized to cancel drift;
values are medians of 9 runs. TBT sums long-task time over 50 ms between
first contentful paint and a fixed 4 s settle window, so the cost of every
deferred chunk this change introduces is counted against it. Benchmark
scripts live in the session scratchpad and are reproducible with Playwright
against any two builds.

Signed-in app routes (12-skill library, 3 collections):

| Route | TBT base → opt | Load base → opt |
| --- | --- | --- |
| /library | 445 → 284 ms (−36%) | 3719 → 3290 ms (−12%) |
| /discover | 217 → 141 ms (−35%) | 3370 → 3020 ms (−10%) |
| /collections | 221 → 151 ms (−32%) | 3333 → 2961 ms (−11%) |
| /settings/mcp | 211 → 151 ms (−28%) | 3392 → 2987 ms (−12%) |

Public routes:

| Route | TBT base → opt | Load base → opt |
| --- | --- | --- |
| /guides/share-agent-skills… | 256 → 151 ms (−41%) | 2992 → 2532 ms (−15%) |
| /sign-in | 229 → 144 ms (−37%) | 2985 → 2737 ms (−8%) |
| /privacy | 218 → 143 ms (−34%) | 2759 → 2547 ms (−8%) |
| /resources | 221 → 157 ms (−29%) | 2751 → 2515 ms (−9%) |

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

2. **Motion behind `LazyMotion` with static `domMax`.** Components imported
   the full-featured `motion` proxy (~135 kB raw / ~44 kB gzip on 14
   routes). All consumers now render `m.*` components (`motion/react-m`)
   under a root `LazyMotion features={domMax}` provider. The features are
   loaded statically on purpose: an earlier async-features variant re-created
   every motion element when the deferred bundle landed, which benchmarked as
   a +135% TBT regression on the card-heavy library page — measuring runtime,
   not just bundle size, caught it. `ReorderList` still needs the eager
   `Reorder` API, so `prompt-examples-editor.tsx` lazy-loads it only when
   several prompts exist.

3. **⌘K palette split.** `components/command-menu.tsx` is now only the
   controller (global shortcut + open state); the palette surface and the
   dialogs its actions open live in `components/command-menu-body.tsx`,
   loaded lazily and warmed during browser idle time so the first ⌘K still
   feels instant.

## Bundle sizes (supporting metric)

Reproducible from a production build:

```sh
pnpm build
node scripts/measure-bundles.mjs        # per-route table, sorted by gzip size
node scripts/measure-bundles.mjs --json # machine-readable snapshot
```

The script reads each prerendered route's HTML in `.next/server/app` and
sums the raw and gzip sizes of every `<script src>` chunk the document
references — the JavaScript a browser downloads before the page is
interactive. Selected routes (kB gzip):

| Route | Before | After | Δ |
| --- | ---: | ---: | ---: |
| /guides/* (8 routes) | 336.5 | 271.3 | −19.4% |
| /settings/mcp | 433.4 | 350.5 | −19.1% |
| /settings/organization | 426.4 | 345.2 | −19.0% |
| /collections | 425.1 | 346.8 | −18.4% |
| /discover | 432.7 | 359.3 | −17.0% |
| /library | 432.0 | 361.1 | −16.4% |
| /privacy, /terms, /contact | 297.6 | 272.3 | −8.5% |
| /sign-in, /sign-up | 331.4 | 306.0 | −7.7% |
| **Total (30 prerendered routes)** | **9862.4** | **8452.1** | **−14.3%** |

Static pages carry `domMax` they may not animate with; that is the
deliberate trade described above — it costs ~30 kB gzip on those routes but
avoids the post-load re-render stall, and their runtime numbers still came
out −29–37% TBT.

## Verified

- `pnpm check` (typecheck + 71 unit/pulse tests) passes.
- Headless-Chromium smoke test against `next start`: /privacy, /resources,
  /guides/share-agent-skills-with-your-team, /contact, /sign-in,
  /email/unsubscribe render without console or page errors.
- Authenticated flows exercised against a seeded local Postgres: sign-up via
  email OTP, onboarding, /library with 12 skill cards, ⌘K palette opens
  lazily and filters skills, with zero page errors.
