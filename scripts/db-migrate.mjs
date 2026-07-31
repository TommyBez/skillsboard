// Runs `drizzle-kit migrate` while holding a Postgres advisory lock, so
// concurrent processes pointing at the same database (e.g. overlapping Vercel
// builds of the same branch) serialize instead of racing on the migrations
// table. drizzle-kit itself has no cross-process locking.
//
// Usage: node scripts/db-migrate.mjs   (DATABASE_URL from env or .env.local)

import { spawnSync } from "node:child_process"
import { config } from "dotenv"
import pg from "pg"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error("DATABASE_URL is required. Add it to .env.local or the environment.")
  process.exit(1)
}

// App-wide constant identifying "schema migrations" among advisory locks.
const MIGRATION_LOCK_KEY = 727_001_080

const client = new pg.Client({ connectionString: databaseUrl })
await client.connect()

let exitCode = 1
try {
  console.log("Acquiring migration advisory lock...")
  await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY])
  const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
    stdio: "inherit",
  })
  exitCode = result.status ?? 1
} finally {
  // Ending the session releases the advisory lock.
  await client.end()
}
process.exit(exitCode)
