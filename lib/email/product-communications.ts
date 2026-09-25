export const PRODUCT_COMMUNICATIONS_TOPIC = "product_communications"
export const PRODUCT_COMMUNICATIONS_NOTICE_VERSION = "2026-07-29"
export const PRODUCT_COMMUNICATIONS_SENDER_EMAIL = "tommaso@skillsboard.sh"
export const PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN_PROPERTY =
  "PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN"

export const PRODUCT_COMMUNICATIONS_DISCLOSURE =
  "Send me occasional Skills Board product updates, launch news, practical guides, and research invitations from Tommaso. Optional. Unsubscribe anytime."

export type EmailPreferenceSource =
  | "signup"
  | "settings"
  | "existing_user_prompt"
  | "one_click_unsubscribe"
  | "resend_contact_unsubscribe"
  | "resend_webhook"

export type EmailSuppressionScope = "all" | "marketing"

export type EmailSuppressionReason =
  | "complaint"
  | "hard_bounce"
  | "provider_suppressed"
  | "provider_unsubscribe"
  | "unsubscribe"

export type ProductCommunicationsIneligibilityReason =
  | "email_changed"
  | "email_unverified"
  | "not_subscribed"
  | "notice_outdated"
  | "suppressed"

export interface ProductCommunicationsEligibilityInput {
  activeSuppressionReasons: readonly string[]
  currentEmailHashes: readonly string[]
  emailVerified: boolean
  preferenceNoticeText: string | null
  preferenceNoticeVersion: string | null
  preferenceEmailHash: string | null
  subscribed: boolean
}

export type ProductCommunicationsEligibility =
  | { eligible: true; reason: null }
  | { eligible: false; reason: ProductCommunicationsIneligibilityReason }

export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase()
}

export function isProductCommunicationsSender(mailbox: string): boolean {
  const bracketedAddress = mailbox.match(/<([^<>]+)>/)?.[1]
  return normalizeEmailAddress(bracketedAddress ?? mailbox) === PRODUCT_COMMUNICATIONS_SENDER_EMAIL
}

export function evaluateProductCommunicationsEligibility({
  activeSuppressionReasons,
  currentEmailHashes,
  emailVerified,
  preferenceNoticeText,
  preferenceNoticeVersion,
  preferenceEmailHash,
  subscribed,
}: ProductCommunicationsEligibilityInput): ProductCommunicationsEligibility {
  if (!emailVerified) return { eligible: false, reason: "email_unverified" }
  if (!subscribed) return { eligible: false, reason: "not_subscribed" }
  if (
    preferenceNoticeVersion !== PRODUCT_COMMUNICATIONS_NOTICE_VERSION
    || preferenceNoticeText !== PRODUCT_COMMUNICATIONS_DISCLOSURE
  ) {
    return { eligible: false, reason: "notice_outdated" }
  }
  if (!preferenceEmailHash || !currentEmailHashes.includes(preferenceEmailHash)) {
    return { eligible: false, reason: "email_changed" }
  }
  if (activeSuppressionReasons.length > 0) {
    return { eligible: false, reason: "suppressed" }
  }
  return { eligible: true, reason: null }
}

/**
 * The optional email question is part of account creation, so an account that
 * was just created has either answered it or was never meant to see the
 * backfill prompt during its first session. The prompt waits this long before
 * treating an account as one of the older ones it was written for.
 */
export const EXISTING_USER_EMAIL_CONSENT_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000

export interface ExistingUserEmailConsentPromptInput {
  accountCreatedAt: Date | null
  activeSuppressionReasons: readonly string[]
  eligibilityReason: ProductCommunicationsIneligibilityReason | null
  noticeText: string | null
  noticeVersion: string | null
  now: Date
  subscribed: boolean
}

export function shouldShowExistingUserEmailConsentPrompt(
  input: ExistingUserEmailConsentPromptInput,
): boolean {
  if (input.activeSuppressionReasons.length > 0) return false
  if (
    input.accountCreatedAt
    && input.now.getTime() - input.accountCreatedAt.getTime() < EXISTING_USER_EMAIL_CONSENT_GRACE_PERIOD_MS
  ) {
    return false
  }

  const currentNotice = input.noticeVersion === PRODUCT_COMMUNICATIONS_NOTICE_VERSION
    && input.noticeText === PRODUCT_COMMUNICATIONS_DISCLOSURE
  const retainedNegativeChoice = !input.subscribed && input.noticeVersion !== null
  const affirmativeChoiceMatchesCurrentEmail = input.eligibilityReason !== "email_changed"
  return !((currentNotice && affirmativeChoiceMatchesCurrentEmail) || retainedNegativeChoice)
}

export function isExplicitConsentLiftableSuppression(reason: string): boolean {
  return reason === "unsubscribe"
}

export function isPermanentDeliverySuppression(reason: string): boolean {
  return reason === "complaint" || reason === "hard_bounce" || reason === "provider_suppressed"
}

export function canConfirmProductCommunicationsUnsubscribe(input: {
  activeUnsubscribeSuppression: boolean
  preferenceSubscribed: boolean | null
  tokenMatchesCurrentEmail: boolean
}): boolean {
  return input.tokenMatchesCurrentEmail
    && input.preferenceSubscribed !== true
    && input.activeUnsubscribeSuppression
}

export function canLiftProviderUnsubscribe(input: {
  consentedAt: Date | null
  providerOptOutAt: Date
  providerReSubscribedAt: Date
  subscribed: boolean
}): boolean {
  return Boolean(
    input.subscribed
    && input.consentedAt
    && input.consentedAt > input.providerOptOutAt
    && input.providerReSubscribedAt >= input.consentedAt,
  )
}

export function shouldApplyProviderContactState(input: {
  current: { providerOccurredAt: Date; unsubscribed: boolean } | null
  incoming: { providerOccurredAt: Date; unsubscribed: boolean }
}): boolean {
  if (!input.current) return true
  const timestampDifference = input.incoming.providerOccurredAt.getTime()
    - input.current.providerOccurredAt.getTime()
  if (timestampDifference > 0) return true
  if (timestampDifference < 0) return false
  return input.incoming.unsubscribed || !input.current.unsubscribed
}

export interface ProviderContactStateSnapshot {
  providerOccurredAt: Date
  providerReference?: string | null
  unsubscribed: boolean
}

export function planProviderContactEvent(input: {
  current: ProviderContactStateSnapshot | null
  incoming: ProviderContactStateSnapshot
}): {
  appliesAsCurrent: boolean
  authoritativeState: ProviderContactStateSnapshot
  reconcileWith: ProviderContactStateSnapshot | null
  recordIncomingOptOut: boolean
} {
  const appliesAsCurrent = shouldApplyProviderContactState(input)
  const authoritativeState = appliesAsCurrent ? input.incoming : input.current ?? input.incoming
  const reconcileWith = !authoritativeState.unsubscribed
    && (appliesAsCurrent || input.incoming.unsubscribed)
    ? authoritativeState
    : null

  return {
    appliesAsCurrent,
    authoritativeState,
    reconcileWith,
    recordIncomingOptOut: input.incoming.unsubscribed,
  }
}
