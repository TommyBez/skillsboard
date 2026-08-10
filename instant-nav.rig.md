# instant-nav rig: skillsboard

- BUILD: local production build — `EXPOSE_TESTING_API=1 pnpm exec next build`
  (loads `.env.local`, so it measures against the Neon `development` branch).
  Serve it with `EXPOSE_TESTING_API=1 VERCEL_ENV=development pnpm exec next start -p 3100`.
  `VERCEL_ENV=development` turns on the Better Auth dev OTP bypass and loopback
  trusted origins in the measured server; it stays a real production bundle.
- EXPOSE: `EXPOSE_TESTING_API=1` at BOTH build and `next start` for the local
  rig — `next start` re-evaluates `next.config.ts`, so without it the server
  boots with `exposeTestingApiInProductionBuild: false`: the client bundle
  still gates soft navigations, but MPA/initial loads serve the full dynamic
  page (no shell-only document, no `__next_instant_test` bootstrap) and every
  initial-load guard fails open. On Vercel, `VERCEL_ENV === 'preview'` covers
  both (wired in `next.config.ts` →
  `experimental.exposeTestingApiInProductionBuild`). Never set in production.
- RUN: `BASE_URL=http://localhost:3100 pnpm exec playwright test`
  (`playwright.config.ts`, specs in `e2e/`).
- TEST USER: `instant-nav-e2e@example.com`, signed in by `e2e/global-setup.ts`
  through the Better Auth HTTP API (dev OTP bypass: any 6-digit code verifies).
  The setup gives it one organization (`Instant Nav E2E Team`, owner role), one
  seeded skill, one seeded collection, and one published collection release
  (share id in `e2e/.auth/fixtures.json`), then saves the session to
  `e2e/.auth/user.json` for the app spec. No feature flags exist in this app.
- DRIFT: the test user sees seeded-but-minimal data (one skill, one collection)
  where the author's account may have many; the Discover catalog (skills.sh via
  Vercel OIDC) can be unavailable locally, in which case `/discover` streams the
  "catalog is unavailable" notice instead of results — both render paths carry
  the `discover-content` marker. PostHog analytics is disabled outside Vercel
  production. The suite always runs as the test user, never the author's
  session.
- LOOP: build → start on :3100 (fresh process every run) → `playwright test` →
  read failures → fix → rebuild. Fully agent-drivable; nothing to push, no
  secrets beyond `.env.local`, no deploy wait. Stop any previous `next start`
  on :3100 first; a fresh start also empties the in-memory `use cache` (see
  WALLS). The user's dev server may hold :3000 — the rig stays on :3100.
- LIVENESS: n/a for local `build && start` — the artifact under test is the one
  freshly built. For Vercel previews, poll the deployment until it serves
  `HEAD` before trusting a verdict.
- WALLS:
  - Org data reads (`listOrganizationSkills`, `listOrganizationCollections`,
    distribution state) use `use cache` with `cacheLife("hours")`. Seed
    fixtures only against a freshly started server (global setup runs before
    the first test request); seeding a warm server leaves fixtures invisible
    for hours.
  - `/settings/email` throws when the user has no product-email preference row;
    global setup passes `skillsboardProductCommunicationsChoice: false` at
    first sign-up so the auth hook creates it. If the test user was ever
    created without it, delete the user row and re-run.
  - Dev-mode auth cookies are `sameSite: none; secure: true` over plain http;
    Chromium treats localhost as trustworthy, so the session still sticks. Do
    not measure with a non-Chromium browser against the local rig.
  - `next build` loads `.env.local` automatically; keep `EXPOSE_TESTING_API`
    out of `.env.local` so production Vercel builds never expose the API.
