import { spawn } from "node:child_process"
import { setTimeout as delay } from "node:timers/promises"

// Runtime auth boot smoke. Starts the production build (`next start`) and
// asserts the Better Auth routes answer 200. Better Auth 1.7.3+ validates the
// database schema on its first request, in every environment, and fails every
// auth route with a 500 when it drifts, so this catches a schema/library
// mismatch that typecheck, `db:check`, and `next build` all miss.
//
// Prerequisites: `pnpm build` has run, and DATABASE_URL points at a database
// with every migration in drizzle/ applied (`pnpm db:migrate`). Use dummy,
// non-secret values only; with VERCEL_ENV=development no email is ever sent.
//
// Usage: node scripts/auth-boot-smoke.mjs  (PORT defaults to 3200)

const port = process.env.PORT?.trim() || "3200"
const origin = `http://localhost:${port}`
const startupTimeoutMs = 60_000

const checks = [
  {
    path: "/api/auth/ok",
    validate: (body) => body?.ok === true,
  },
  {
    path: "/api/auth/get-session",
    // Anonymous request: Better Auth answers 200 with a null session.
    validate: (body) => body === null || typeof body === "object",
  },
  {
    path: "/.well-known/oauth-authorization-server",
    validate: (body) => body?.issuer === `${origin}/api/auth` && typeof body?.token_endpoint === "string",
  },
]

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is required (a migrated, disposable database).")
  process.exit(1)
}

const serverLog = []
// Own process group, so stopping the smoke also stops any worker next spawns.
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", port], {
  env: { ...process.env, PORT: port, BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? origin },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
})
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => serverLog.push(chunk.toString()))
}

let serverExited = false
server.on("exit", () => {
  serverExited = true
})

function stopServer() {
  if (serverExited) return
  try {
    process.kill(-server.pid, "SIGTERM")
  } catch {
    server.kill("SIGTERM")
  }
}

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs
  while (Date.now() < deadline) {
    if (serverExited) throw new Error("next start exited before accepting requests")
    try {
      await fetch(origin, { method: "HEAD" })
      return
    } catch {
      await delay(500)
    }
  }
  throw new Error(`next start did not accept requests within ${startupTimeoutMs / 1000}s`)
}

let failed = false
try {
  await waitForServer()
  for (const { path, validate } of checks) {
    const response = await fetch(origin + path, { headers: { accept: "application/json" } })
    const text = await response.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = undefined
    }
    const passed = response.status === 200 && validate(body)
    failed ||= !passed
    console.log(`${passed ? "PASS" : "FAIL"} ${response.status} GET ${path}`)
    if (!passed) console.log(`  body: ${text.slice(0, 500)}`)
  }
} catch (error) {
  failed = true
  console.error(`FAIL ${error instanceof Error ? error.message : error}`)
} finally {
  stopServer()
}

if (failed) {
  console.error("\nAuth boot smoke failed. Server output:\n")
  console.error(serverLog.join("").slice(-8000))
  process.exit(1)
}
console.log("Auth boot smoke passed.")
