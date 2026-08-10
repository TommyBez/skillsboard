import { defineConfig } from "@playwright/test"

// Instant-navigation e2e guards (@next/playwright instant()). Run against a
// production build started with VERCEL_ENV=development — see instant-nav.rig.md.
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  workers: 2,
  // instant() guards are deterministic; a retry would mask the regression they catch.
  retries: 0,
  globalSetup: "./e2e/global-setup.ts",
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
  },
})
