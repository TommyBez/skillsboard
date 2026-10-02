#!/usr/bin/env node
/**
 * One-shot welcome and first-skill reminder for teams created before the
 * Resend automation was enabled. The reminder is skipped when the library
 * already has a skill.
 *
 * Dry-run by default. The Next.js app must be reachable: the script calls
 * `/api/activation-backfill` with CRON_SECRET so the send path stays in-app.
 *
 *   node scripts/backfill-activation-emails.mjs
 *   node scripts/backfill-activation-emails.mjs --send
 *   node scripts/backfill-activation-emails.mjs --send --before=2026-09-08T20:00:00.000Z
 */

import { config } from "dotenv"
import { resolve } from "node:path"

config({ path: resolve(process.cwd(), ".env.local") })

function argValue(name) {
  const prefixed = process.argv.find((entry) => entry.startsWith(`${name}=`))
  if (prefixed) return prefixed.slice(name.length + 1)
  const index = process.argv.indexOf(name)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

const send = process.argv.includes("--send")
const before = argValue("--before")
const baseUrl = (
  process.env.ACTIVATION_BACKFILL_URL
  || process.env.BETTER_AUTH_URL
  || "http://localhost:3000"
).replace(/\/$/, "")
const cronSecret = process.env.CRON_SECRET?.trim()

if (!cronSecret) {
  console.error("CRON_SECRET is not set. Add it to .env.local.")
  process.exit(1)
}

const url = new URL("/api/activation-backfill", `${baseUrl}/`)
if (send) url.searchParams.set("send", "true")
if (before) url.searchParams.set("before", before)

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${cronSecret}`,
  },
})

const body = await response.text()
let parsed = body
try {
  parsed = JSON.stringify(JSON.parse(body), null, 2)
} catch {
  // Keep the raw body when the server did not return JSON.
}

if (!response.ok) {
  console.error(`Backfill failed (${response.status})\n${parsed}`)
  process.exit(1)
}

console.log(parsed)
if (!send) {
  console.log("\nDry run. Re-run with --send to deliver the welcome and first-skill emails.")
}
