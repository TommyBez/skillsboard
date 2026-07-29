import "server-only"

import { and, eq, inArray, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  emailConsentEvent,
  emailProviderContactState,
  emailProactiveDelivery,
  emailPreference,
  emailSuppression,
  user,
} from "@/lib/db/schema"
import {
  canLiftProviderUnsubscribe,
  evaluateProductCommunicationsEligibility,
  isAutonomouslyLiftableSuppression,
  isPermanentDeliverySuppression,
  normalizeEmailAddress,
  planProviderContactEvent,
  PRODUCT_COMMUNICATIONS_DISCLOSURE,
  PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
  PRODUCT_COMMUNICATIONS_TOPIC,
  shouldApplyProviderContactState,
  type EmailPreferenceSource,
  type EmailSuppressionReason,
  type EmailSuppressionScope,
} from "@/lib/email/product-communications"
import {
  createProductCommunicationsUnsubscribeToken,
  hashEmailAddress,
  hashEmailAddressCandidates,
} from "@/lib/email/email-privacy"
import { absoluteUrl } from "@/lib/site"

const LIFTABLE_SUPPRESSION_REASONS = ["unsubscribe"] as const
const PERMANENT_SUPPRESSION_REASONS = ["complaint", "hard_bounce", "provider_suppressed"] as const

export type EmailPreferenceTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function lockEmailHash(tx: EmailPreferenceTransaction, emailHash: string): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${emailHash}, 0))`)
}

async function lockEmailHashes(tx: EmailPreferenceTransaction, emailHashes: readonly string[]): Promise<void> {
  for (const emailHash of [...new Set(emailHashes)].sort()) {
    await lockEmailHash(tx, emailHash)
  }
}

export class EmailPreferenceBlockedError extends Error {
  constructor(message = "Email delivery is unavailable for this address") {
    super(message)
    this.name = "EmailPreferenceBlockedError"
  }
}

export interface ProductCommunicationsPreferenceView {
  activeSuppressionReasons: string[]
  consentedAt: Date | null
  effectiveSubscribed: boolean
  email: string
  eligibleForCampaign: boolean
  eligibilityReason: ReturnType<typeof evaluateProductCommunicationsEligibility>["reason"]
  noticeText: string | null
  noticeVersion: string | null
  subscribed: boolean
  withdrawnAt: Date | null
}

async function getUserIdentity(userId: string) {
  const [identity] = await db
    .select({
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return identity ?? null
}

export async function getProductCommunicationsPreference(
  userId: string,
): Promise<ProductCommunicationsPreferenceView | null> {
  const identity = await getUserIdentity(userId)
  if (!identity) return null

  const currentEmailHashes = hashEmailAddressCandidates(identity.email)
  const [[preference], suppressions] = await Promise.all([
    db
      .select({
        consentedAt: emailPreference.consentedAt,
        emailHash: emailPreference.emailHash,
        noticeText: emailPreference.noticeText,
        noticeVersion: emailPreference.noticeVersion,
        subscribed: emailPreference.subscribed,
        withdrawnAt: emailPreference.withdrawnAt,
      })
      .from(emailPreference)
      .where(and(
        eq(emailPreference.userId, userId),
        eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
      ))
      .limit(1),
    db
      .select({ reason: emailSuppression.reason })
      .from(emailSuppression)
      .where(and(
        inArray(emailSuppression.emailHash, currentEmailHashes),
        eq(emailSuppression.active, true),
        inArray(emailSuppression.scope, ["all", "marketing"]),
      )),
  ])
  const activeSuppressionReasons = suppressions.map((item) => item.reason)
  const eligibility = evaluateProductCommunicationsEligibility({
    activeSuppressionReasons,
    currentEmailHashes,
    emailVerified: identity.emailVerified,
    preferenceEmailHash: preference?.emailHash ?? null,
    preferenceNoticeText: preference?.noticeText ?? null,
    preferenceNoticeVersion: preference?.noticeVersion ?? null,
    subscribed: preference?.subscribed ?? false,
  })
  const emailMatches = Boolean(preference?.emailHash && currentEmailHashes.includes(preference.emailHash))
  const noticeIsCurrent = preference?.noticeVersion === PRODUCT_COMMUNICATIONS_NOTICE_VERSION
    && preference.noticeText === PRODUCT_COMMUNICATIONS_DISCLOSURE
  const effectiveSubscribed = Boolean(
    preference?.subscribed
    && emailMatches
    && noticeIsCurrent
    && identity.emailVerified
    && activeSuppressionReasons.length === 0,
  )

  return {
    activeSuppressionReasons,
    consentedAt: preference?.consentedAt ?? null,
    effectiveSubscribed,
    email: identity.email,
    eligibleForCampaign: eligibility.eligible,
    eligibilityReason: eligibility.reason,
    noticeText: preference?.noticeText ?? null,
    noticeVersion: preference?.noticeVersion ?? null,
    subscribed: preference?.subscribed ?? false,
    withdrawnAt: preference?.withdrawnAt ?? null,
  }
}

export async function setProductCommunicationsPreference(input: {
  source: Extract<EmailPreferenceSource, "existing_user_prompt" | "settings" | "signup">
  subscribed: boolean
  userId: string
}): Promise<ProductCommunicationsPreferenceView> {
  const now = new Date()

  await db.transaction(async (tx) => {
    const [identity] = await tx
      .select({ email: user.email, emailVerified: user.emailVerified })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1)

    if (!identity?.emailVerified) throw new Error("A verified account is required to update email preferences")

    const emailHashes = hashEmailAddressCandidates(identity.email)
    const emailHash = emailHashes[0]
    await lockEmailHashes(tx, emailHashes)
    const [current] = await tx
      .select({
        consentedAt: emailPreference.consentedAt,
        emailHash: emailPreference.emailHash,
        noticeVersion: emailPreference.noticeVersion,
        noticeText: emailPreference.noticeText,
        subscribed: emailPreference.subscribed,
        unsubscribeToken: emailPreference.unsubscribeToken,
        withdrawnAt: emailPreference.withdrawnAt,
      })
      .from(emailPreference)
      .where(and(
        eq(emailPreference.userId, input.userId),
        eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
      ))
      .limit(1)

    if (input.subscribed) {
      const permanentBlocks = await tx
        .select({ reason: emailSuppression.reason })
        .from(emailSuppression)
        .where(and(
          inArray(emailSuppression.emailHash, emailHashes),
          eq(emailSuppression.active, true),
          inArray(emailSuppression.reason, [...PERMANENT_SUPPRESSION_REASONS]),
        ))
        .limit(1)
      if (permanentBlocks.length > 0) throw new EmailPreferenceBlockedError()

      await tx
        .update(emailSuppression)
        .set({ active: false, liftedAt: now, liftedSource: input.source })
        .where(and(
          inArray(emailSuppression.emailHash, emailHashes),
          eq(emailSuppression.active, true),
          inArray(emailSuppression.reason, [...LIFTABLE_SUPPRESSION_REASONS]),
        ))
    }

    const changed = !current
      || current.emailHash !== emailHash
      || current.subscribed !== input.subscribed
      || current.noticeVersion !== PRODUCT_COMMUNICATIONS_NOTICE_VERSION
      || current.noticeText !== PRODUCT_COMMUNICATIONS_DISCLOSURE
    const unsubscribeToken = current?.emailHash === emailHash && current.unsubscribeToken
      ? current.unsubscribeToken
      : createProductCommunicationsUnsubscribeToken({ emailHash, userId: input.userId })
    const consentedAt = input.subscribed
      ? changed ? now : current?.consentedAt ?? now
      : null
    const withdrawnAt = input.subscribed
      ? null
      : changed ? now : current?.withdrawnAt ?? now

    await tx
      .insert(emailPreference)
      .values({
        userId: input.userId,
        topic: PRODUCT_COMMUNICATIONS_TOPIC,
        emailHash,
        subscribed: input.subscribed,
        source: input.source,
        noticeVersion: PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
        noticeText: PRODUCT_COMMUNICATIONS_DISCLOSURE,
        unsubscribeToken,
        consentedAt,
        withdrawnAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [emailPreference.userId, emailPreference.topic],
        set: {
          emailHash,
          subscribed: input.subscribed,
          source: input.source,
          noticeVersion: PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
          noticeText: PRODUCT_COMMUNICATIONS_DISCLOSURE,
          unsubscribeToken,
          consentedAt,
          withdrawnAt,
          updatedAt: now,
        },
      })

    if (!input.subscribed) {
      await tx
        .insert(emailSuppression)
        .values({
          emailHash,
          scope: "marketing",
          reason: "unsubscribe",
          source: input.source,
          active: true,
          createdAt: now,
          lastSeenAt: now,
        })
        .onConflictDoUpdate({
          target: [emailSuppression.emailHash, emailSuppression.scope, emailSuppression.reason],
          set: {
            active: true,
            lastSeenAt: now,
            liftedAt: null,
            liftedSource: null,
            source: input.source,
            sourceReference: null,
          },
        })
    }

    const eventAction = input.subscribed && changed
      ? "granted"
      : !input.subscribed && current?.subscribed === true
        ? "withdrawn"
        : !input.subscribed && !current
          ? "declined"
          : null

    if (eventAction) {
      await tx.insert(emailConsentEvent).values({
        userId: input.userId,
        emailHash,
        topic: PRODUCT_COMMUNICATIONS_TOPIC,
        action: eventAction,
        source: input.source,
        noticeVersion: PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
        noticeText: PRODUCT_COMMUNICATIONS_DISCLOSURE,
        occurredAt: now,
      })
    }
  })

  const updated = await getProductCommunicationsPreference(input.userId)
  if (!updated) throw new Error("Unable to read the updated email preference")
  return updated
}

export interface ApplyEmailSuppressionInput {
  email: string
  providerOccurredAt: Date
  providerReference?: string
  reason: Extract<EmailSuppressionReason, "complaint" | "hard_bounce" | "provider_suppressed" | "provider_unsubscribe">
  source: "resend_webhook"
}

export async function recordProviderContactStateInTransaction(
  tx: EmailPreferenceTransaction,
  input: {
    email: string
    providerOccurredAt: Date
    providerReference?: string
    unsubscribed: boolean
  },
) {
  if (Number.isNaN(input.providerOccurredAt.getTime())) throw new Error("InvalidProviderEventTimestamp")
  const now = new Date()
  const emailHashes = hashEmailAddressCandidates(input.email)
  const currentEmailHash = emailHashes[0]

  await lockEmailHashes(tx, emailHashes)
  const states = await tx
    .select({
      providerOccurredAt: emailProviderContactState.providerOccurredAt,
      providerReference: emailProviderContactState.providerReference,
      unsubscribed: emailProviderContactState.unsubscribed,
    })
    .from(emailProviderContactState)
    .where(and(
      eq(emailProviderContactState.provider, "resend"),
      inArray(emailProviderContactState.emailHash, emailHashes),
    ))
  const latestState = states.reduce<(typeof states)[number] | null>(
    (latest, state) => !latest || state.providerOccurredAt > latest.providerOccurredAt ? state : latest,
    null,
  )

  const plan = planProviderContactEvent({
    current: latestState,
    incoming: {
      providerOccurredAt: input.providerOccurredAt,
      providerReference: input.providerReference,
      unsubscribed: input.unsubscribed,
    },
  })
  if (!plan.appliesAsCurrent) return plan

  await tx
    .update(emailProviderContactState)
    .set({
      unsubscribed: input.unsubscribed,
      providerReference: input.providerReference,
      providerOccurredAt: input.providerOccurredAt,
      observedAt: now,
    })
    .where(and(
      eq(emailProviderContactState.provider, "resend"),
      inArray(emailProviderContactState.emailHash, emailHashes),
    ))

  await tx
    .insert(emailProviderContactState)
    .values({
      provider: "resend",
      emailHash: currentEmailHash,
      unsubscribed: input.unsubscribed,
      providerReference: input.providerReference,
      providerOccurredAt: input.providerOccurredAt,
      observedAt: now,
    })
    .onConflictDoUpdate({
      target: [emailProviderContactState.provider, emailProviderContactState.emailHash],
      set: {
        unsubscribed: input.unsubscribed,
        providerReference: input.providerReference,
        providerOccurredAt: input.providerOccurredAt,
        observedAt: now,
      },
    })

  return plan
}

export async function applyEmailSuppressionInTransaction(
  tx: EmailPreferenceTransaction,
  input: ApplyEmailSuppressionInput,
): Promise<void> {
  const now = new Date()
  const normalizedEmail = normalizeEmailAddress(input.email)
  const emailHashes = hashEmailAddressCandidates(normalizedEmail)
  const emailHash = emailHashes[0]
  const scope: EmailSuppressionScope = input.reason === "provider_unsubscribe" ? "marketing" : "all"
  if (Number.isNaN(input.providerOccurredAt.getTime())) throw new Error("InvalidProviderEventTimestamp")

  await lockEmailHashes(tx, emailHashes)
  const existingSuppressions = await tx
    .select({
      id: emailSuppression.id,
      lastSeenAt: emailSuppression.lastSeenAt,
    })
    .from(emailSuppression)
    .where(and(
      inArray(emailSuppression.emailHash, emailHashes),
      eq(emailSuppression.scope, scope),
      eq(emailSuppression.reason, input.reason),
    ))
  const newestExistingSuppression = existingSuppressions.reduce<Date | null>(
    (latest, item) => !latest || item.lastSeenAt > latest ? item.lastSeenAt : latest,
    null,
  )
  if (newestExistingSuppression && newestExistingSuppression > input.providerOccurredAt) return

  if (existingSuppressions.length > 0) {
    await tx
      .update(emailSuppression)
      .set({
        active: true,
        lastSeenAt: input.providerOccurredAt,
        liftedAt: null,
        liftedSource: null,
        source: input.source,
        sourceReference: input.providerReference,
      })
      .where(and(
        inArray(emailSuppression.emailHash, emailHashes),
        eq(emailSuppression.scope, scope),
        eq(emailSuppression.reason, input.reason),
      ))
  }

  await tx
    .insert(emailSuppression)
    .values({
      emailHash,
      scope,
      reason: input.reason,
      source: input.source,
      sourceReference: input.providerReference,
      active: true,
      createdAt: now,
      lastSeenAt: input.providerOccurredAt,
    })
    .onConflictDoUpdate({
      target: [emailSuppression.emailHash, emailSuppression.scope, emailSuppression.reason],
      set: {
        active: true,
        lastSeenAt: input.providerOccurredAt,
        liftedAt: null,
        liftedSource: null,
        source: input.source,
        sourceReference: input.providerReference,
      },
    })

  const [identity] = await tx
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalizedEmail}`)
    .limit(1)
  if (!identity) return

  const [current] = await tx
    .select({
      noticeVersion: emailPreference.noticeVersion,
      noticeText: emailPreference.noticeText,
      consentedAt: emailPreference.consentedAt,
      emailHash: emailPreference.emailHash,
      subscribed: emailPreference.subscribed,
    })
    .from(emailPreference)
    .where(and(
      eq(emailPreference.userId, identity.id),
      eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
      inArray(emailPreference.emailHash, emailHashes),
    ))
    .limit(1)

  if (!current?.subscribed) return
  if (
    input.reason === "provider_unsubscribe"
    && current.consentedAt
    && current.consentedAt > input.providerOccurredAt
  ) {
    // Preserve the later explicit local grant while keeping the provider
    // suppression active until a newer signed provider event confirms it.
    return
  }

  await tx
    .update(emailPreference)
    .set({
      subscribed: false,
      source: input.source,
      withdrawnAt: input.providerOccurredAt,
      updatedAt: now,
    })
    .where(and(
      eq(emailPreference.userId, identity.id),
      eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
    ))

  await tx.insert(emailConsentEvent).values({
    userId: identity.id,
    emailHash: current.emailHash,
    topic: PRODUCT_COMMUNICATIONS_TOPIC,
    action: input.reason === "provider_unsubscribe" ? "withdrawn" : "suppressed",
    source: input.source,
    noticeVersion: current.noticeVersion,
    noticeText: current.noticeText,
    providerReference: input.providerReference,
    occurredAt: input.providerOccurredAt,
  })
}

export async function confirmProviderResubscriptionInTransaction(
  tx: EmailPreferenceTransaction,
  input: {
    email: string
    providerOccurredAt: Date
    providerReference?: string
  },
): Promise<void> {
  if (Number.isNaN(input.providerOccurredAt.getTime())) throw new Error("InvalidProviderEventTimestamp")
  const now = new Date()
  const normalizedEmail = normalizeEmailAddress(input.email)
  const emailHashes = hashEmailAddressCandidates(normalizedEmail)

  await lockEmailHashes(tx, emailHashes)
  const suppressions = await tx
    .select({
      active: emailSuppression.active,
      id: emailSuppression.id,
      lastSeenAt: emailSuppression.lastSeenAt,
    })
    .from(emailSuppression)
    .where(and(
      inArray(emailSuppression.emailHash, emailHashes),
      eq(emailSuppression.scope, "marketing"),
      eq(emailSuppression.reason, "provider_unsubscribe"),
    ))
  const activeSuppressions = suppressions.filter((item) => item.active)
  const newestSuppression = activeSuppressions.reduce<Date | null>(
    (latest, item) => !latest || item.lastSeenAt > latest ? item.lastSeenAt : latest,
    null,
  )
  if (!newestSuppression) return

  const [identity] = await tx
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalizedEmail}`)
    .limit(1)
  if (!identity) return

  const [current] = await tx
    .select({
      consentedAt: emailPreference.consentedAt,
      emailHash: emailPreference.emailHash,
      noticeText: emailPreference.noticeText,
      noticeVersion: emailPreference.noticeVersion,
      subscribed: emailPreference.subscribed,
    })
    .from(emailPreference)
    .where(and(
      eq(emailPreference.userId, identity.id),
      eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
      inArray(emailPreference.emailHash, emailHashes),
    ))
    .limit(1)

  if (!current || !canLiftProviderUnsubscribe({
    consentedAt: current.consentedAt,
    providerOptOutAt: newestSuppression,
    providerReSubscribedAt: input.providerOccurredAt,
    subscribed: current.subscribed,
  })) return

  await tx
    .update(emailSuppression)
    .set({
      active: false,
      liftedAt: now,
      liftedSource: "resend_webhook",
      sourceReference: input.providerReference,
    })
    .where(and(
      inArray(emailSuppression.emailHash, emailHashes),
      eq(emailSuppression.scope, "marketing"),
      eq(emailSuppression.reason, "provider_unsubscribe"),
      eq(emailSuppression.active, true),
    ))

  await tx.insert(emailConsentEvent).values({
    userId: identity.id,
    emailHash: current.emailHash,
    topic: PRODUCT_COMMUNICATIONS_TOPIC,
    action: "provider_reconciled",
    source: "resend_webhook",
    noticeVersion: current.noticeVersion,
    noticeText: current.noticeText,
    providerReference: input.providerReference,
    occurredAt: input.providerOccurredAt,
  })
}

export async function applyEmailSuppression(input: ApplyEmailSuppressionInput): Promise<void> {
  await db.transaction((tx) => applyEmailSuppressionInTransaction(tx, input))
}

export async function recordProductCommunicationsDeliveryInTransaction(
  tx: EmailPreferenceTransaction,
  input: {
    emails: readonly string[]
    providerBroadcastId: string
    providerEmailId: string
    sentAt: Date
  },
): Promise<void> {
  const emailHashes = [...new Set(
    input.emails
      .map(normalizeEmailAddress)
      .filter(Boolean)
      .map(hashEmailAddress),
  )]
  if (emailHashes.length === 0) return

  await tx
    .insert(emailProactiveDelivery)
    .values(emailHashes.map((emailHash) => ({
      providerEmailId: input.providerEmailId,
      emailHash,
      providerBroadcastId: input.providerBroadcastId,
      sentAt: input.sentAt,
    })))
    .onConflictDoNothing()
}

export async function withdrawProductCommunicationsByToken(input: {
  emailHash: string
  userId: string
}): Promise<{ alreadyUnsubscribed: boolean }> {
  const now = new Date()
  let alreadyUnsubscribed = false

  await db.transaction(async (tx) => {
    const [identity] = await tx
      .select({ email: user.email, id: user.id })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1)
    const currentEmailHashes = identity ? hashEmailAddressCandidates(identity.email) : null
    const tokenMatchesCurrentEmail = Boolean(currentEmailHashes?.includes(input.emailHash))
    const relevantHashes = tokenMatchesCurrentEmail && currentEmailHashes
      ? [...new Set([input.emailHash, ...currentEmailHashes])]
      : [input.emailHash]

    await lockEmailHashes(tx, relevantHashes)
    const [current] = await tx
      .select({
        emailHash: emailPreference.emailHash,
        noticeVersion: emailPreference.noticeVersion,
        noticeText: emailPreference.noticeText,
        subscribed: emailPreference.subscribed,
      })
      .from(emailPreference)
      .where(and(
        eq(emailPreference.userId, input.userId),
        eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
      ))
      .limit(1)
    const currentPreferenceMatches = Boolean(
      current
      && currentEmailHashes?.includes(current.emailHash)
      && tokenMatchesCurrentEmail,
    )
    const canonicalHashes = currentPreferenceMatches && currentEmailHashes && current
      ? [...new Set([input.emailHash, currentEmailHashes[0], current.emailHash])]
      : [input.emailHash]
    const existingSuppressions = await tx
      .select({ active: emailSuppression.active })
      .from(emailSuppression)
      .where(and(
        inArray(emailSuppression.emailHash, canonicalHashes),
        eq(emailSuppression.scope, "marketing"),
        eq(emailSuppression.reason, "unsubscribe"),
      ))

    alreadyUnsubscribed = (!currentPreferenceMatches || current?.subscribed !== true)
      && existingSuppressions.some((suppression) => suppression.active)

    await tx
      .insert(emailSuppression)
      .values(canonicalHashes.map((emailHash) => ({
        emailHash,
        scope: "marketing",
        reason: "unsubscribe",
        source: "one_click_unsubscribe",
        active: true,
        createdAt: now,
        lastSeenAt: now,
      })))
      .onConflictDoUpdate({
        target: [emailSuppression.emailHash, emailSuppression.scope, emailSuppression.reason],
        set: {
          active: true,
          lastSeenAt: now,
          liftedAt: null,
          liftedSource: null,
          source: "one_click_unsubscribe",
          sourceReference: null,
        },
      })

    if (currentPreferenceMatches && current) {
      await tx
        .update(emailPreference)
        .set({
          subscribed: false,
          source: "one_click_unsubscribe",
          withdrawnAt: now,
          updatedAt: now,
        })
        .where(and(
          eq(emailPreference.userId, input.userId),
          eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
          eq(emailPreference.emailHash, current.emailHash),
        ))
    }

    if (currentPreferenceMatches && current?.subscribed === true) {
      await tx.insert(emailConsentEvent).values({
        userId: identity?.id ?? null,
        emailHash: current.emailHash,
        topic: PRODUCT_COMMUNICATIONS_TOPIC,
        action: "withdrawn",
        source: "one_click_unsubscribe",
        noticeVersion: current.noticeVersion,
        noticeText: current.noticeText,
        occurredAt: now,
      })
    }
  })

  return { alreadyUnsubscribed }
}

export async function isProductCommunicationsUnsubscribed(input: {
  emailHash: string
  userId: string
}): Promise<boolean> {
  const identity = await getUserIdentity(input.userId)
  const currentEmailHashes = identity ? hashEmailAddressCandidates(identity.email) : null
  const relevantHashes = currentEmailHashes?.includes(input.emailHash)
    ? [...new Set([input.emailHash, ...currentEmailHashes])]
    : [input.emailHash]
  const [[preference], [suppression]] = await Promise.all([
    db
      .select({ subscribed: emailPreference.subscribed })
      .from(emailPreference)
      .where(and(
        eq(emailPreference.userId, input.userId),
        eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
        inArray(emailPreference.emailHash, relevantHashes),
      ))
      .limit(1),
    db
      .select({ active: emailSuppression.active })
      .from(emailSuppression)
      .where(and(
        inArray(emailSuppression.emailHash, relevantHashes),
        eq(emailSuppression.active, true),
        eq(emailSuppression.scope, "marketing"),
        eq(emailSuppression.reason, "unsubscribe"),
      ))
      .limit(1),
  ])

  return preference?.subscribed !== true && suppression?.active === true
}

export async function assertTransactionalEmailAllowed(email: string): Promise<void> {
  const emailHashes = hashEmailAddressCandidates(email)
  const [block] = await db
    .select({ reason: emailSuppression.reason })
    .from(emailSuppression)
    .where(and(
      inArray(emailSuppression.emailHash, emailHashes),
      eq(emailSuppression.active, true),
      eq(emailSuppression.scope, "all"),
      inArray(emailSuppression.reason, [...PERMANENT_SUPPRESSION_REASONS]),
    ))
    .limit(1)

  if (block) throw new EmailPreferenceBlockedError("Email delivery is suppressed for this address")
}

export async function getProductCommunicationsUnsubscribeUrls(userId: string): Promise<{
  oneClickUrl: string
  preferencesUrl: string
  unsubscribeUrl: string
}> {
  const identity = await getUserIdentity(userId)
  if (!identity) throw new Error("User not found")
  const currentEmailHashes = hashEmailAddressCandidates(identity.email)
  const [preference] = await db
    .select({
      emailHash: emailPreference.emailHash,
      unsubscribeToken: emailPreference.unsubscribeToken,
    })
    .from(emailPreference)
    .where(and(
      eq(emailPreference.userId, userId),
      eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
    ))
    .limit(1)
  if (!preference || !preference.unsubscribeToken || !currentEmailHashes.includes(preference.emailHash)) {
    throw new Error("No current product communications preference was found")
  }
  const token = preference.unsubscribeToken

  return {
    oneClickUrl: absoluteUrl(`/api/email/unsubscribe?token=${encodeURIComponent(token)}`),
    preferencesUrl: absoluteUrl("/settings/email"),
    unsubscribeUrl: absoluteUrl(`/email/unsubscribe?token=${encodeURIComponent(token)}`),
  }
}

export async function getProductCommunicationsProviderCandidate(userId: string): Promise<{
  email: string
  locallyEligibleForIntersection: boolean
  providerSubscriptionDirective: "preserve_current"
  unsubscribeToken: string
} | null> {
  const [identity, preference, [tokenRecord]] = await Promise.all([
    getUserIdentity(userId),
    getProductCommunicationsPreference(userId),
    db
      .select({
        emailHash: emailPreference.emailHash,
        unsubscribeToken: emailPreference.unsubscribeToken,
      })
      .from(emailPreference)
      .where(and(
        eq(emailPreference.userId, userId),
        eq(emailPreference.topic, PRODUCT_COMMUNICATIONS_TOPIC),
      ))
      .limit(1),
  ])
  if (!identity || !preference || !tokenRecord?.unsubscribeToken) return null
  if (!hashEmailAddressCandidates(identity.email).includes(tokenRecord.emailHash)) return null

  return {
    email: identity.email,
    locallyEligibleForIntersection: preference.eligibleForCampaign,
    // Local consent can add a contact to the candidate set, but must never
    // overwrite a stricter topic state read from Resend.
    providerSubscriptionDirective: "preserve_current",
    unsubscribeToken: tokenRecord.unsubscribeToken,
  }
}

export function describeSuppressionReason(reason: string): string {
  if (reason === "complaint") return "A previous message was reported as spam."
  if (reason === "hard_bounce") return "The address previously rejected email permanently."
  if (reason === "provider_suppressed") return "The email provider has suppressed delivery to this address."
  if (reason === "provider_unsubscribe" || reason === "unsubscribe") return "Product emails are unsubscribed."
  return "Email delivery is unavailable."
}

export function canExplicitConsentLiftSuppression(reason: string): boolean {
  return isAutonomouslyLiftableSuppression(reason)
}

export function suppressionBlocksAllDelivery(reason: string): boolean {
  return isPermanentDeliverySuppression(reason)
}
