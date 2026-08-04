import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./load-ts-module.mjs"

const { createEmailIdempotencyKey } = await loadTsModule(
  "../lib/email/idempotency.ts",
  (source) => source.replace('import "server-only"', ""),
)

test("email idempotency keys are deterministic HMACs without raw correlators", () => {
  process.env.BETTER_AUTH_SECRET = "test-only-better-auth-secret-with-at-least-32-bytes"
  const first = createEmailIdempotencyKey("sign-in-otp", ["person@example.com", "482913"])
  const second = createEmailIdempotencyKey("sign-in-otp", ["person@example.com", "482913"])

  assert.equal(first, second)
  assert.match(first, /^sign-in-otp\/[a-f0-9]{32}$/)
  assert.equal(first.includes("person@example.com"), false)
  assert.equal(first.includes("482913"), false)
})

test("email idempotency keys fail closed with a weak server secret", () => {
  process.env.BETTER_AUTH_SECRET = "short"
  assert.throws(
    () => createEmailIdempotencyKey("team-invitation", ["invitation-bearer-id"]),
    /BETTER_AUTH_SECRET must contain at least 32 bytes/,
  )
})
