# Database migrations (Drizzle + Neon + Vercel)

The database schema is managed with versioned Drizzle migrations committed in
`drizzle/`. Migrations are applied automatically by Vercel builds, using the
Neon <> Vercel integration's database branching:

| Event | Database | How migrations run |
| --- | --- | --- |
| Push to any branch | Neon preview branch `preview/<git-branch>` | Vercel preview build runs `vercel-build` (`drizzle-kit migrate && next build`) with the branch `DATABASE_URL` injected by the Neon integration |
| Merge to `main` | Neon `main` branch (production) | Vercel production build runs the same `vercel-build` with the production `DATABASE_URL` |
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

To apply migrations to the database in your `.env.local` (normally the Neon
`development` branch): `pnpm db:migrate`.

`pnpm db:push` still exists for quick local prototyping against a throwaway
branch, but never push to a database that is migration-managed — schema drift
will make the next `db:migrate` fail. When a prototype settles, express it as
a generated migration instead.

## One-time setup

### 1. Existing databases (no action needed)

The Neon `main` and `development` branches were created with `db:push` before
migrations existed, so they already have the schema of `drizzle/0000_init.sql`.
That migration is written to be idempotent (`IF NOT EXISTS` on tables/indexes,
`duplicate_object` guards on foreign keys): the first `drizzle-kit migrate`
against such a database executes it as a no-op and records it as applied in
`drizzle.__drizzle_migrations`. Fresh databases get the full schema from the
same file. Later migrations do not need to be idempotent — only this baseline
one is.

### 2. Neon integration on Vercel

In the Vercel dashboard -> Storage -> your Neon database -> Settings, make sure:

- **Preview branches** ("Create a database branch for every preview
  deployment") is enabled. Neon then creates/reuses a branch named
  `preview/<git-branch>` and injects its `DATABASE_URL` into preview builds.
- Optionally enable automatic deletion of obsolete preview branches; the
  GitHub workflow below covers the merge case regardless.

No Vercel build-command change is needed: Vercel automatically prefers the
`vercel-build` script in `package.json` over `build`.

### 3. GitHub repository settings

For `.github/workflows/neon-preview-cleanup.yml`:

- Repository **variable** `NEON_PROJECT_ID`: Neon console -> Project settings -> General.
- Repository **secret** `NEON_API_KEY`: Neon console -> Account settings -> API keys.

Also consider enabling GitHub's "Automatically delete head branches" on merge.

## Notes

- `drizzle-kit generate` is offline (it diffs `lib/db/schema.ts` against
  `drizzle/meta/`), so it needs no `DATABASE_URL`.
- Migrations run at build time, before the new code is deployed, so they must
  be backward-compatible with the currently running code (expand/contract:
  add columns as nullable/with defaults first, remove in a later release).
- If a production build fails at the migrate step, the previous deployment
  stays live; fix the migration and push again.
