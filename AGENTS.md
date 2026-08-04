# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`skillsboard` is a single Next.js 16 (App Router, Turbopack) app — UI + API routes in one process. Its backing store is a **Neon PostgreSQL** database (pulled from Vercel; see below). Auth is Better Auth (email OTP via Resend + organizations + OAuth/MCP provider). There is no separate backend to run.

### Running locally
- Environment lives in `.env.local` (gitignored, so it is not in the repo). Populate it from Vercel (`VERCEL_TOKEN` is provided as a secret): the project is linked to `tommasos-projects-bb9d6551/skillsboard`. Pull the Development variables (Neon Postgres `DATABASE_URL` / `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `VERCEL_OIDC_TOKEN`, etc.) with:
  `npx vercel env pull .env.local --environment=development --yes`
  (run `npx vercel link --yes --project skillsboard --scope tommasos-projects-bb9d6551` first if `.vercel/project.json` is absent). This points the app at the persistent Neon `development` branch, isolated from Production's `main` branch. Preview deployments use Neon-managed ephemeral branches. Set `BETTER_AUTH_URL=http://localhost:3000` in `.env.local` for local auth callbacks. PostHog variables are scoped to Vercel Production and analytics is intentionally disabled in local development and Preview deployments.
- Dev server: `pnpm dev` (serves `http://localhost:3000`). Standard scripts live in `package.json`.
- After changing `.env.local`, restart `pnpm dev` so the `pg` pool in `lib/db/index.ts` (created at module load) picks up the new `DATABASE_URL`.

### Database schema
The schema lives in `lib/db/schema.ts` and is managed with versioned Drizzle migrations committed in `drizzle/` (see `docs/database-migrations.md`). After editing the schema, run `pnpm db:generate --name <description>` and commit the generated SQL together with the schema change — do not hand-edit `drizzle/meta/`. Vercel builds apply pending migrations automatically (`vercel-build` runs `pnpm db:migrate` before `next build`): preview builds against the Neon `preview/<git-branch>` database branch, production builds against Neon `main`. Drizzle uses the direct `DATABASE_URL_UNPOOLED`; the app continues to use pooled `DATABASE_URL`. To align the database in `.env.local` (normally the Neon `development` branch), run `pnpm db:migrate`. `pnpm db:push` remains for throwaway prototyping only; never push to a migration-managed database, or the next `db:migrate` will fail on drift.

### Gotchas
- `pnpm lint` runs `eslint .`, but ESLint is **not** a declared dependency and there is no ESLint config, so it fails out of the box (not a code problem). For type checking use `npx tsc --noEmit`.
- `drizzle-kit@0.31.10` mis-introspects empty PostgreSQL array defaults. A repeated `pnpm db:push -- --strict --verbose` may propose only idempotent `SET DEFAULT '{}'` statements for `skill.tags` and `skill.examplePrompts` even when both defaults are already correct. Abort if it proposes anything else.
- Skill metadata is fetched live from the GitHub REST API. It works unauthenticated; set `GITHUB_TOKEN` to avoid rate limits.
- In development Better Auth sets cookies with `sameSite: "none"; secure: true` (see `lib/auth.ts`), which can affect session behavior on plain `http://localhost` in some browsers.
- In development, email OTP skips Resend and accepts any 6-digit code after the “Continue” step (see `lib/auth.ts`). Preview/production send real codes via Resend.
- The Discover/catalog feature calls the external skills.sh API via Vercel OIDC; it degrades gracefully (shows "catalog unavailable") when unavailable locally and does not block the core flow.
- TypeScript 7 is a native binary and no longer exports `transpileModule`/`ModuleKind` from the `typescript` package entry. The unit tests in `tests/` therefore type-strip sources with esbuild through the shared `tests/load-ts-module.mjs` helper — reach for that instead of importing `typescript` in a test. The editor-only `{ "name": "next" }` tsconfig plugin is also a TypeScript 5 feature; `tsc --noEmit` ignores plugins, so type checking is unaffected.
- `next.config.ts` turns on `partialPrefetching`, so `next dev` reports any navigation that cannot show instant UI ("Next.js encountered runtime data during prerendering"). The usual fix is to wrap the data access in `<Suspense>` or mark it `'use cache'`. `export const instant = false` is not a general escape hatch; per the `instant` reference it exists to exempt navigations passing through a blocking *ancestor* of a segment you have marked instant.
- **Check whether the flagged path is reachable before adding a boundary.** A `<Suspense>` boundary is not free on a route whose params are all prerendered: it splits the prerendered HTML into shell-then-content, so a direct visit paints the fallback and swaps. `/guides/[slug]` was flagged only for slugs outside `generateStaticParams`, and `proxy.ts` now 404s those before the route renders — so the boundary bought nothing and cost every guide a skeleton and 5.4 KB. Measure `.next/server/app/**/<page>.html` (look for the fallback markup and React's `$RC(` swap script) before and after, rather than trusting that the warning clearing means the page got faster.
- The guide-slug existence check lives in `proxy.ts` rather than in the page for two reasons: it makes the blocking case above unreachable, and it is the only place a real 404 status can still be set — a `notFound()` raised after a response has begun streaming lands as a soft 404. Keep such checks to cheap in-memory lookups.
- `/guides/[slug]` renders straight from `params` with no boundary, so Partial Prefetching has no shared route shell to hand out. Guide links therefore carry `<Link prefetch>`; without it a guide click waits on a server hop.
- `next dev` writes and maintains the `nextjs-agent-rules` block at the bottom of this file, pointing agents at the version-matched docs in `node_modules/next/dist/docs/`. Commit it with your work rather than reverting it, or it just comes back as an uncommitted change (`agentRules: false` in `next.config.ts` disables it).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
