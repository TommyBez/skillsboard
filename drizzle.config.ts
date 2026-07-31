import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL?.trim()

// drizzle-kit passes its subcommand as the first CLI argument. `generate` (and
// the other offline commands) only diff lib/db/schema.ts against drizzle/meta/
// and never connect, so only commands that reach a database need DATABASE_URL.
const command = process.argv[2] ?? ""
const offlineCommands = new Set(["generate", "check", "up", "export"])

if (!databaseUrl && !offlineCommands.has(command)) {
  throw new Error(
    `DATABASE_URL is required for \`drizzle-kit ${command || "<command>"}\`. Add it to .env.local or the environment.`,
  )
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: { url: databaseUrl ?? "postgres://offline-placeholder" },
})
