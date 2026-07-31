import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

// `drizzle-kit generate` is offline and works without a database. Commands
// that connect (`db:migrate`, `db:push`) fail with this message if the URL is
// missing. On Vercel, DATABASE_URL is injected per environment (production DB
// on production builds, the Neon preview branch on preview builds).
const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  "postgres://DATABASE_URL-is-not-set:5432/add-it-to-.env.local-or-the-environment"

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: { url: databaseUrl },
})
