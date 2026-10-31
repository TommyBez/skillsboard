import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

const source = await readFile(new URL("../lib/auth-environment.ts", import.meta.url), "utf8")
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const {
  PREVIEW_TEST_SIGN_IN_EMAIL,
  getPreviewTestSignInOtp,
  getPreviewTestSignInSecret,
  isPreviewTestSignInEmail,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)

const secret = "test-only-not-a-real-secret-0123456789"
const signIn = { email: PREVIEW_TEST_SIGN_IN_EMAIL, type: "sign-in" }

test("enabled on a preview deployment with a long secret", () => {
  const env = { VERCEL_ENV: "preview", PREVIEW_TEST_SIGN_IN_SECRET: secret }
  assert.equal(getPreviewTestSignInSecret(env), secret)
  assert.equal(getPreviewTestSignInOtp(signIn, env), secret)
})

test("disabled in production, even with the secret set", () => {
  for (const NODE_ENV of ["production", "development", undefined]) {
    const env = { VERCEL_ENV: "production", NODE_ENV, PREVIEW_TEST_SIGN_IN_SECRET: secret }
    assert.equal(getPreviewTestSignInSecret(env), undefined)
    assert.equal(getPreviewTestSignInOtp(signIn, env), undefined)
  }
})

test("disabled in development, even with the secret set", () => {
  const env = { VERCEL_ENV: "development", NODE_ENV: "development", PREVIEW_TEST_SIGN_IN_SECRET: secret }
  assert.equal(getPreviewTestSignInSecret(env), undefined)
  assert.equal(getPreviewTestSignInOtp(signIn, env), undefined)
})

test("fails closed when VERCEL_ENV is missing or empty, without a NODE_ENV fallback", () => {
  for (const NODE_ENV of ["production", "development", "test", undefined]) {
    for (const VERCEL_ENV of [undefined, ""]) {
      const env = { VERCEL_ENV, NODE_ENV, PREVIEW_TEST_SIGN_IN_SECRET: secret }
      assert.equal(getPreviewTestSignInSecret(env), undefined, `${VERCEL_ENV}/${NODE_ENV}`)
      assert.equal(getPreviewTestSignInOtp(signIn, env), undefined)
    }
  }
})

test("fails closed on unexpected VERCEL_ENV values", () => {
  for (const VERCEL_ENV of ["Preview", "PREVIEW", " preview", "preview ", "staging", "test", "true", "1"]) {
    const env = { VERCEL_ENV, PREVIEW_TEST_SIGN_IN_SECRET: secret }
    assert.equal(getPreviewTestSignInSecret(env), undefined, JSON.stringify(VERCEL_ENV))
    assert.equal(getPreviewTestSignInOtp(signIn, env), undefined)
  }
})

test("disabled on preview when the secret is missing, empty or too short", () => {
  for (const PREVIEW_TEST_SIGN_IN_SECRET of [undefined, "", "   ", "123456", "x".repeat(31)]) {
    const env = { VERCEL_ENV: "preview", PREVIEW_TEST_SIGN_IN_SECRET }
    assert.equal(getPreviewTestSignInSecret(env), undefined, JSON.stringify(PREVIEW_TEST_SIGN_IN_SECRET))
    assert.equal(getPreviewTestSignInOtp(signIn, env), undefined)
  }
})

test("only the reserved test identity's sign-in OTP is affected", () => {
  const env = { VERCEL_ENV: "preview", PREVIEW_TEST_SIGN_IN_SECRET: secret }
  for (const email of ["tommaso@productbuild.io", "demo-video@skillsboard.sh", "demo-video@skillsboard.invalid.com"]) {
    assert.equal(getPreviewTestSignInOtp({ email, type: "sign-in" }, env), undefined, email)
  }
  for (const type of ["email-verification", "forget-password", "change-email"]) {
    assert.equal(getPreviewTestSignInOtp({ email: PREVIEW_TEST_SIGN_IN_EMAIL, type }, env), undefined, type)
  }
})

test("the test identity is a reserved, undeliverable address", () => {
  assert.equal(PREVIEW_TEST_SIGN_IN_EMAIL, "demo-video@skillsboard.invalid")
  assert.equal(isPreviewTestSignInEmail(" Demo-Video@SkillsBoard.Invalid "), true)
  assert.equal(isPreviewTestSignInEmail("tommaso@productbuild.io"), false)
})
