# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`skillsboard` is a single Next.js 16 (App Router, Turbopack) app — UI + API routes in one process. Its backing store is a **Neon PostgreSQL** database (pulled from Vercel; see below). Auth is Better Auth (email/password + organizations + OAuth/MCP provider). There is no separate backend to run.

### Running locally
- Environment lives in `.env.local` (gitignored, so it is not in the repo). Populate it from Vercel (`VERCEL_TOKEN` is provided as a secret): the project is linked to `tommasos-projects-bb9d6551/skillsboard`. Pull the development variables (Neon Postgres `DATABASE_URL`, `BETTER_AUTH_SECRET`, `VERCEL_OIDC_TOKEN`, etc.) with:
  `npx vercel env pull .env.local --environment=development --yes`
  (run `npx vercel link --yes --project skillsboard --scope tommasos-projects-bb9d6551` first if `.vercel/project.json` is absent). This points the app at the shared Neon dev database, which is reachable from the VM and already migrated — no local database or schema setup is needed. Set `BETTER_AUTH_URL=http://localhost:3000` in `.env.local` for local auth callbacks.
- Dev server: `pnpm dev` (serves `http://localhost:3000`). Standard scripts live in `package.json`.
- After changing `.env.local`, restart `pnpm dev` so the `pg` pool in `lib/db/index.ts` (created at module load) picks up the new `DATABASE_URL`.

### Database schema
The Neon dev database is already migrated, so no schema work is normally required. For a new database, `pnpm db:push` reads `.env.local` through `drizzle.config.ts` and pushes every table defined in `lib/db/schema.ts`, including Better Auth and the custom `skill` table. The SQL files under `scripts/` are idempotent alignment fixes retained for older databases; they are not part of a fresh setup.

### Gotchas
- `pnpm lint` runs `eslint .`, but ESLint is **not** a declared dependency and there is no ESLint config, so it fails out of the box (not a code problem). For type checking use `npx tsc --noEmit`.
- Skill metadata is fetched live from the GitHub REST API. It works unauthenticated; set `GITHUB_TOKEN` to avoid rate limits.
- In development Better Auth sets cookies with `sameSite: "none"; secure: true` (see `lib/auth.ts`), which can affect session behavior on plain `http://localhost` in some browsers.
- The Discover/catalog feature calls the external skills.sh API via Vercel OIDC; it degrades gracefully (shows "catalog unavailable") when unavailable locally and does not block the core flow.
