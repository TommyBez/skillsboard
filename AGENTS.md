# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`skillsboard` is a single Next.js 16 (App Router, Turbopack) app — UI + API routes in one process. It has one required backing service: **PostgreSQL**. Auth is Better Auth (email/password + organizations + OAuth/MCP provider). There is no separate backend to run.

### Running locally
- PostgreSQL is installed but is **not started automatically** on a fresh VM. Start it before running the app or tests:
  `sudo pg_ctlcluster 16 main start`
- Dev server: `pnpm dev` (serves `http://localhost:3000`). Standard scripts live in `package.json`.
- Environment lives in `.env.local` (gitignored, so it is not in the repo). If it is missing, recreate it with:
  ```
  DATABASE_URL=postgres://skillsboard:skillsboard@127.0.0.1:5432/skillsboard
  BETTER_AUTH_SECRET=<any 32-byte base64 string, e.g. `openssl rand -base64 32`>
  BETTER_AUTH_URL=http://localhost:3000
  ```
  The local dev database is `skillsboard` owned by role `skillsboard` (password `skillsboard`).

### Database schema (only needed for a brand-new/empty database)
There is **no drizzle-kit or migration pipeline**. Tables were created once and persist in the DB. To rebuild on a fresh database:
1. Better Auth tables: `npx @better-auth/cli@latest migrate` (reads `lib/auth.ts`; needs the env vars loaded).
2. Custom `skill` table: create it manually to match `lib/db/schema.ts` (drizzle is ORM-only here).
3. Then apply `scripts/fix-oauth-client-schema.sql` (idempotent OAuth column alignment).

### Gotchas
- `pnpm lint` runs `eslint .`, but ESLint is **not** a declared dependency and there is no ESLint config, so it fails out of the box (not a code problem). For type checking use `npx tsc --noEmit`.
- Skill metadata is fetched live from the GitHub REST API. It works unauthenticated; set `GITHUB_TOKEN` to avoid rate limits.
- In development Better Auth sets cookies with `sameSite: "none"; secure: true` (see `lib/auth.ts`), which can affect session behavior on plain `http://localhost` in some browsers.
- The Discover/catalog feature calls the external skills.sh API via Vercel OIDC; it degrades gracefully (shows "catalog unavailable") when unavailable locally and does not block the core flow.
