import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { transpileTs } from "./transpile-ts.mjs"

async function transpiledModule(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8")
  return `data:text/javascript;base64,${Buffer.from(transpileTs(source)).toString("base64")}`
}

const productModuleUrl = await transpiledModule("../lib/email/product-communications.ts")
const productCommunications = await import(productModuleUrl)
const {
  PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
  canConfirmProductCommunicationsUnsubscribe,
  canLiftProviderUnsubscribe,
  evaluateProductCommunicationsEligibility,
  isProductCommunicationsSender,
  isExplicitConsentLiftableSuppression,
  isPermanentDeliverySuppression,
  normalizeEmailAddress,
  planProviderContactEvent,
  shouldApplyProviderContactState,
} = productCommunications

const baseEligibility = {
  activeSuppressionReasons: [],
  currentEmailHashes: ["current-hash"],
  emailVerified: true,
  preferenceEmailHash: "current-hash",
  preferenceNoticeText: productCommunications.PRODUCT_COMMUNICATIONS_DISCLOSURE,
  preferenceNoticeVersion: PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
  subscribed: true,
}

test("normalizes email addresses before hashing or comparison", () => {
  assert.equal(normalizeEmailAddress("  Person@Example.COM  "), "person@example.com")
})

test("allows a verified account with current affirmative consent", () => {
  assert.deepEqual(evaluateProductCommunicationsEligibility(baseEligibility), {
    eligible: true,
    reason: null,
  })
})

test("does not add signup-age or arbitrary contact-frequency gates", () => {
  const now = new Date("2026-07-29T12:00:00.000Z")
  assert.deepEqual(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    accountCreatedAt: now,
    lastProactiveEmailAt: now,
    now,
  }), {
    eligible: true,
    reason: null,
  })
})

test("keeps consent eligible while a previous email-hash root is retained", () => {
  assert.deepEqual(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    currentEmailHashes: ["replacement-hash", "current-hash"],
  }), {
    eligible: true,
    reason: null,
  })
})

test("fails closed for missing consent, changed email, verification, or suppression", () => {
  assert.equal(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    subscribed: false,
  }).reason, "not_subscribed")
  assert.equal(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    preferenceEmailHash: "old-hash",
  }).reason, "email_changed")
  assert.equal(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    preferenceNoticeVersion: "outdated-notice",
  }).reason, "notice_outdated")
  assert.equal(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    preferenceNoticeText: "different disclosure",
  }).reason, "notice_outdated")
  assert.equal(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    emailVerified: false,
  }).reason, "email_unverified")
  assert.equal(evaluateProductCommunicationsEligibility({
    ...baseEligibility,
    activeSuppressionReasons: ["complaint"],
  }).reason, "suppressed")
})

test("only explicit unsubscribe suppressions are liftable by explicit consent", () => {
  assert.equal(isExplicitConsentLiftableSuppression("unsubscribe"), true)
  assert.equal(isExplicitConsentLiftableSuppression("provider_unsubscribe"), false)
  assert.equal(isExplicitConsentLiftableSuppression("complaint"), false)
  assert.equal(isPermanentDeliverySuppression("hard_bounce"), true)
  assert.equal(isPermanentDeliverySuppression("provider_suppressed"), true)
})

test("does not confirm an unsubscribe for a stale email token", () => {
  assert.equal(canConfirmProductCommunicationsUnsubscribe({
    activeUnsubscribeSuppression: true,
    preferenceSubscribed: null,
    tokenMatchesCurrentEmail: false,
  }), false)
  assert.equal(canConfirmProductCommunicationsUnsubscribe({
    activeUnsubscribeSuppression: true,
    preferenceSubscribed: false,
    tokenMatchesCurrentEmail: true,
  }), true)
  assert.equal(canConfirmProductCommunicationsUnsubscribe({
    activeUnsubscribeSuppression: true,
    preferenceSubscribed: true,
    tokenMatchesCurrentEmail: true,
  }), false)
  assert.equal(canConfirmProductCommunicationsUnsubscribe({
    activeUnsubscribeSuppression: false,
    preferenceSubscribed: false,
    tokenMatchesCurrentEmail: true,
  }), false)
})

test("lifts a provider unsubscribe only after later local consent and signed provider confirmation", () => {
  const providerOptOutAt = new Date("2026-07-29T12:00:00.000Z")
  const consentedAt = new Date("2026-07-29T12:01:00.000Z")
  assert.equal(canLiftProviderUnsubscribe({
    consentedAt,
    providerOptOutAt,
    providerReSubscribedAt: consentedAt,
    subscribed: true,
  }), true)
  assert.equal(canLiftProviderUnsubscribe({
    consentedAt: providerOptOutAt,
    providerOptOutAt,
    providerReSubscribedAt: consentedAt,
    subscribed: true,
  }), false)
  assert.equal(canLiftProviderUnsubscribe({
    consentedAt,
    providerOptOutAt,
    providerReSubscribedAt: providerOptOutAt,
    subscribed: true,
  }), false)
})

test("keeps the newest signed provider contact state when webhooks arrive out of order", () => {
  const earlier = new Date("2026-07-29T12:00:00.000Z")
  const later = new Date("2026-07-29T12:05:00.000Z")
  assert.equal(shouldApplyProviderContactState({
    current: { providerOccurredAt: later, unsubscribed: false },
    incoming: { providerOccurredAt: earlier, unsubscribed: true },
  }), false)
  assert.equal(shouldApplyProviderContactState({
    current: { providerOccurredAt: earlier, unsubscribed: true },
    incoming: { providerOccurredAt: later, unsubscribed: false },
  }), true)
  assert.equal(shouldApplyProviderContactState({
    current: { providerOccurredAt: later, unsubscribed: true },
    incoming: { providerOccurredAt: later, unsubscribed: false },
  }), false)

  const historicalOptOut = planProviderContactEvent({
    current: {
      providerOccurredAt: later,
      providerReference: "provider-resubscription",
      unsubscribed: false,
    },
    incoming: {
      providerOccurredAt: earlier,
      providerReference: "provider-opt-out",
      unsubscribed: true,
    },
  })
  assert.equal(historicalOptOut.appliesAsCurrent, false)
  assert.equal(historicalOptOut.recordIncomingOptOut, true)
  assert.deepEqual(historicalOptOut.reconcileWith, {
    providerOccurredAt: later,
    providerReference: "provider-resubscription",
    unsubscribed: false,
  })
})

test("recognizes the exact founder sender address regardless of display-name casing", () => {
  assert.equal(isProductCommunicationsSender("Tommaso from Skills Board <tommaso@skillsboard.sh>"), true)
  assert.equal(isProductCommunicationsSender("TOMMASO@SKILLSBOARD.SH"), true)
  assert.equal(isProductCommunicationsSender("login@skillsboard.sh"), false)
})

test("unsubscribe tokens are encrypted, randomized, and contain no raw email address", async () => {
  const originalRoot = Buffer.alloc(32, 17).toString("base64")
  const replacementRoot = Buffer.alloc(32, 29).toString("base64")
  process.env.EMAIL_PRIVACY_SECRET = originalRoot
  const privacySource = (await readFile(
    new URL("../lib/email/email-privacy.ts", import.meta.url),
    "utf8",
  )).replace('import "server-only"', "")
  const outputText = transpileTs(privacySource)
  const privacyModuleUrl = `data:text/javascript;base64,${Buffer.from(
    outputText.replace('"@/lib/email/product-communications"', JSON.stringify(productModuleUrl)),
  ).toString("base64")}`
  const {
    createProductCommunicationsUnsubscribeToken,
    hashEmailAddress,
    hashEmailAddressCandidates,
    verifyProductCommunicationsUnsubscribeToken,
  } = await import(privacyModuleUrl)
  const email = "person@example.com"
  const emailHash = hashEmailAddress(email)
  const token = createProductCommunicationsUnsubscribeToken({
    emailHash,
    userId: "user-123",
  })
  const secondToken = createProductCommunicationsUnsubscribeToken({
    emailHash,
    userId: "user-123",
  })

  assert.equal(token.includes(email), false)
  assert.notEqual(token, secondToken)
  assert.deepEqual(verifyProductCommunicationsUnsubscribeToken(token), {
    emailHash,
    topic: "product_communications",
    userId: "user-123",
    version: 1,
  })
  const tokenParts = token.split(".")
  const authTag = tokenParts.at(-1)
  tokenParts[tokenParts.length - 1] = `${authTag.slice(0, -1)}${authTag.endsWith("A") ? "B" : "A"}`
  assert.equal(verifyProductCommunicationsUnsubscribeToken(tokenParts.join(".")), null)

  process.env.EMAIL_PRIVACY_SECRET = replacementRoot
  process.env.EMAIL_PRIVACY_SECRET_PREVIOUS = JSON.stringify([originalRoot])
  const replacementHash = hashEmailAddress(email)
  assert.notEqual(replacementHash, emailHash)
  assert.equal(hashEmailAddressCandidates(email).includes(emailHash), true)
  assert.deepEqual(verifyProductCommunicationsUnsubscribeToken(token), {
    emailHash,
    topic: "product_communications",
    userId: "user-123",
    version: 1,
  })
  delete process.env.EMAIL_PRIVACY_SECRET_PREVIOUS
  process.env.EMAIL_PRIVACY_SECRET = "too-short"
  assert.throws(
    () => verifyProductCommunicationsUnsubscribeToken(token),
    /EMAIL_PRIVACY_SECRET must contain at least 32 bytes/,
  )
})
