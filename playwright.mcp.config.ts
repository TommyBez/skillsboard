import { defineConfig } from "@playwright/test"

const baseURL = process.env.BASE_URL ?? "http://localhost:3100"
const port = new URL(baseURL).port || "3100"

// MCP runtime suite: a real OAuth connect and real JSON-RPC calls against a
// production build. The server must run with VERCEL_ENV=development (dev OTP
// bypass, no Resend) against a throwaway database; see e2e/mcp/README.md.
export default defineConfig({
  testDir: "./e2e/mcp",
  timeout: 90_000,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm exec next start -p ${port}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
})
