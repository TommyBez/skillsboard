// Marks every migration in drizzle/ as already applied WITHOUT executing any
// SQL. One-time use for databases whose schema was created with `pnpm db:push`
// before this repo switched to versioned migrations (e.g. the Neon `main` and
// `development` branches). After baselining, `pnpm db:migrate` only applies
// migrations newer than the baseline.
//
// Usage: DATABASE_URL must point at the target database (or live in .env.local).
//   pnpm db:baseline

import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { config } from "dotenv"
import pg from "pg"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error("DATABASE_URL is required. Add it to .env.local or the environment.")
  process.exit(1)
}

const migrationsDir = path.resolve(import.meta.dirname, "..", "drizzle")
const journal = JSON.parse(await readFile(path.join(migrationsDir, "meta", "_journal.json"), "utf8"))

if (!journal.entries?.length) {
  console.log("No migrations in drizzle/meta/_journal.json — nothing to baseline.")
  process.exit(0)
}

const client = new pg.Client({ connectionString: databaseUrl })
await client.connect()

try {
  // Same table drizzle-kit migrate uses to track applied migrations.
  await client.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `)

  const { rows } = await client.query(
    `SELECT created_at FROM "drizzle"."__drizzle_migrations"`,
  )
  const applied = new Set(rows.map((row) => String(row.created_at)))

  for (const entry of journal.entries) {
    if (applied.has(String(entry.when))) {
      console.log(`= ${entry.tag} already recorded, skipping`)
      continue
    }
    const sql = await readFile(path.join(migrationsDir, `${entry.tag}.sql`), "utf8")
    const hash = createHash("sha256").update(sql).digest("hex")
    await client.query(
      `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
      [hash, entry.when],
    )
    console.log(`+ ${entry.tag} recorded as applied (no SQL executed)`)
  }

  console.log("Baseline complete. Future `pnpm db:migrate` runs start from here.")
} finally {
  await client.end()
}
