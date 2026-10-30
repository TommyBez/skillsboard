#!/usr/bin/env node
// Runtime boot smoke: start the built app and ask the auth stack to answer.
//
// `/api/health` only proves the process is up; Better Auth validates the
// database schema lazily, on the first request it handles, so a schema it
// rejects (a NOT NULL column it never writes, say) passes the build and the
// typecheck and only breaks once real traffic reaches `/api/auth/*`. This
// boots `next start` against whatever DATABASE_URL the caller migrated and
// requires the two auth routes an MCP client meets first to answer 200.
//
// Usage: DATABASE_URL=... BETTER_AUTH_SECRET=... VERCEL_ENV=development \
//   pnpm exec next build && node scripts/runtime-boot-smoke.mjs

import { spawn } from "node:child_process"
import path from "node:path"

const port = process.env.SMOKE_PORT ?? "3200"
const baseURL = `http://localhost:${port}`
const bootTimeoutMs = 60_000

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required: point it at a throwaway, fully migrated database.")
  process.exit(2)
}

const checks = [
  {
    path: "/api/auth/ok",
    verify: (body) => body?.ok === true || "expected { ok: true }",
  },
  {
    path: "/.well-known/oauth-authorization-server",
    verify: (body) =>
      body?.issuer === `${baseURL}/api/auth` || `expected issuer ${baseURL}/api/auth, got ${body?.issuer}`,
  },
]

const log = []
const server = spawn(path.join("node_modules", ".bin", "next"), ["start", "-p", port], {
  env: { ...process.env, PORT: port, BETTER_AUTH_URL: baseURL },
  stdio: ["ignore", "pipe", "pipe"],
})
server.stdout.on("data", (chunk) => log.push(chunk.toString()))
server.stderr.on("data", (chunk) => log.push(chunk.toString()))

let failed = false
try {
  await waitForLiveness()
  for (const check of checks) {
    const response = await fetch(`${baseURL}${check.path}`)
    const text = await response.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = undefined
    }
    const verdict = response.status === 200 ? check.verify(body) : `status ${response.status}`
    if (verdict === true) {
      console.log(`ok   ${check.path} → ${response.status}`)
    } else {
      failed = true
      console.error(`FAIL ${check.path} → ${verdict}`)
    }
  }
} catch (error) {
  failed = true
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`)
} finally {
  server.kill("SIGTERM")
}

if (failed) {
  console.error("\n--- next start output ---\n" + log.join("").slice(-6_000))
  process.exit(1)
}

async function waitForLiveness() {
  const deadline = Date.now() + bootTimeoutMs
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start exited with ${server.exitCode}`)
    try {
      const response = await fetch(`${baseURL}/api/health`)
      if (response.ok) return
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`next start did not answer /api/health within ${bootTimeoutMs / 1000}s`)
}
