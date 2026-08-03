# Database migrations (Drizzle + Neon + Vercel)

The database schema is managed with versioned Drizzle migrations committed in
`drizzle/`. Migrations are applied automatically by Vercel builds, using the
Neon <> Vercel integration's database branching:

| Event | Database | How migrations run |
| --- | --- | --- |
| Push to any branch | Neon preview branch `preview/<git-branch>` | Vercel preview build runs `vercel-build` (`scripts/db-migrate.mjs` then `next build`) with the branch URLs injected by the Neon integration |
| Merge to `main` | Neon `main` branch (production) | Vercel production build runs the same `vercel-build` with the production URLs |
| PR merged | — | `.github/workflows/neon-preview-cleanup.yml` deletes the `preview/<git-branch>` Neon branch |

Because every Neon preview branch is a copy-on-write fork of production, it
already contains production's applied-migrations table, so `drizzle-kit
migrate` on a preview build only applies the migrations added on that git
branch.

## Day-to-day workflow

1. Edit `lib/db/schema.ts`.
2. Generate a migration: `pnpm db:generate --name <short-description>`.
3. Review the SQL in `drizzle/`, commit it together with the schema change, and push.
4. The Vercel preview build applies it to that branch's Neon preview database;
   after merge, the production build applies it to production.

`pnpm db:check` validates the migration history and fails if
`lib/db/schema.ts` is ahead of the committed Drizzle snapshots. CI runs this on
every pull request.

To apply migrations to the database in your `.env.local` (normally the Neon
`development` branch): `pnpm db:migrate`.

The app uses pooled `DATABASE_URL`; database commands and the advisory lock use
direct `DATABASE_URL_UNPOOLED`. For local non-pooled Postgres, both variables
may contain the same URL.

`pnpm db:push` still exists for quick local prototyping against a throwaway
branch, but never push to a database that is migration-managed — schema drift
will make the next `db:migrate` fail. When a prototype settles, express it as
a generated migration instead.

## One-time setup

### 1. Existing databases (no action needed)

The Neon branches predate versioned migrations and were initially managed with
`db:push`. `0000_init` is therefore guarded so it records the baseline without
recreating objects that already exist, while still creating the complete schema
on a fresh database. This includes the six email-consent tables.

The baseline guards tables (`IF NOT EXISTS`), indexes (`IF NOT EXISTS`), and
foreign keys (`duplicate_object` handlers). On an existing table the body is
skipped, so its columns, in-table constraints, and defaults must already match.
That assumption was verified against the live branches and holds because the
existing objects and the baseline were derived from the same
`lib/db/schema.ts`. Migrations after `0000` must not use blanket guards. The
known cosmetic `skill.tags` / `skill.examplePrompts` empty-array-default
mis-introspection noted in `AGENTS.md` does not affect this stored schema.

### 2. Neon integration on Vercel

In the Vercel dashboard -> Storage -> your Neon database -> Settings, make sure:

- **Preview branches** ("Create a database branch for every preview
  deployment") is enabled. Neon then creates/reuses a branch named
  `preview/<git-branch>` and injects `DATABASE_URL` plus the direct
  `DATABASE_URL_UNPOOLED` into preview builds.
- Optionally enable automatic deletion of obsolete preview branches; the
  GitHub workflow below covers the merge case regardless.

No Vercel build-command change is needed: Vercel automatically prefers the
`vercel-build` script in `package.json` over `build`.

### 3. GitHub repository settings

For `.github/workflows/neon-preview-cleanup.yml`:

- Repository **variable** `NEON_PROJECT_ID`: Neon console -> Project settings -> General.
- Repository **secret** `NEON_API_KEY`: Neon console -> Account settings -> API keys.

Also consider enabling GitHub's "Automatically delete head branches" on merge.

The workflow only runs for same-repository PRs: fork PRs don't receive
`NEON_API_KEY`, and Vercel only builds fork previews after maintainer
authorization. If a fork PR does leave a `preview/*` branch behind, delete it
from the Neon console or rely on the integration's obsolete-branch cleanup.

## Notes

- `drizzle-kit generate` is offline (it diffs `lib/db/schema.ts` against
  `drizzle/meta/`), so it needs no `DATABASE_URL`.
- `pnpm db:migrate` (used by `vercel-build` too) wraps `drizzle-kit migrate`
  in a Postgres advisory lock (`scripts/db-migrate.mjs`), so overlapping runs
  against the same database serialize instead of racing. Both the lock and
  Drizzle use `DATABASE_URL_UNPOOLED`: Neon PgBouncer transaction pooling does
  not preserve session-level advisory locks and is not appropriate for schema
  migrations.
- Migrations run at build time, before the new code is deployed, so they must
  be backward-compatible with the currently running code (expand/contract:
  add columns as nullable/with defaults first, remove in a later release).
- If a production build fails at the migrate step, the previous deployment
  stays live. With the `pg` driver, Drizzle applies the pending migration batch
  in one transaction, so a failure rolls that batch back. Inspect the database
  and `drizzle.__drizzle_migrations` before editing the migration and retrying.
