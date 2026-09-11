import "server-only"

import { and, eq } from "drizzle-orm"

import ActivationFirstSkill, { activationFirstSkillSubject } from "@/emails/activation-first-skill"
import ActivationWelcome, { activationWelcomeSubject } from "@/emails/activation-welcome"
import {
  ACTIVATION_FIRST_SKILL,
  ACTIVATION_WELCOME,
  type ActivationAutomationKey,
  type ActivationWelcomeVariant,
  activationCtaUrl,
  resolveActivationWelcomeVariant,
} from "@/lib/activation-emails"
import { db } from "@/lib/db"
import { countOrganizationSkills } from "@/lib/db/activation-candidates"
import { emailAutomationSend } from "@/lib/db/schema"
import { absoluteUrl } from "@/lib/site"

import {
  EmailPreferenceBlockedError,
  assertTransactionalEmailAllowed,
  getProductCommunicationsPreference,
  getProductCommunicationsUnsubscribeUrls,
} from "./email-preferences"
import { createProductCommunicationsUnsubscribeToken, hashEmailAddress } from "./email-privacy"
import { createEmailIdempotencyKey } from "./idempotency"
import { PRODUCT_COMMUNICATIONS_SENDER_EMAIL } from "./product-communications"
import { getResendClient } from "./resend"

/**
 * Account setup service email uses the founder identity, as the contract in
 * `.agents/product-marketing.md` prescribes for the category. It is not the
 * transactional identity used by sign-in codes and invitations.
 */
export const ACTIVATION_EMAIL_FROM =
  `Tommaso from Skills Board <${PRODUCT_COMMUNICATIONS_SENDER_EMAIL}>`

export const ACTIVATION_IDEMPOTENCY_NAMESPACE = "activation"

export type ActivationSendSkipReason =
  | "already_recorded"
  | "skill_already_saved"
  | "suppressed"
  | "unknown_user"

export type ActivationSendResult =
  | { providerEmailId: string | null; sent: true }
  | { reason: ActivationSendSkipReason; sent: false }

export interface SendActivationEmailInput {
  automationKey: ActivationAutomationKey
  /** Used with the current library size to pick the welcome wording. */
  daysSinceTeamCreated: number
  email: string
  firstName: string | null
  organizationId: string
  sentAt?: Date
  teamName: string
  userId: string
}

/**
 * The one-click unsubscribe link. A recipient who never answered the product
 * communications checkbox has no preference row and therefore no stored token,
 * so the same encrypted token is minted for the send. Following it writes the
 * same marketing suppression as any other unsubscribe, which also ends the
 * activation sequence for that person.
 */
async function activationUnsubscribeUrls(input: { email: string; userId: string }) {
  try {
    return await getProductCommunicationsUnsubscribeUrls(input.userId)
  } catch {
    const token = createProductCommunicationsUnsubscribeToken({
      emailHash: hashEmailAddress(input.email),
      userId: input.userId,
    })
    return {
      oneClickUrl: absoluteUrl(`/api/email/unsubscribe?token=${encodeURIComponent(token)}`),
      preferencesUrl: absoluteUrl("/settings/email"),
      unsubscribeUrl: absoluteUrl(`/email/unsubscribe?token=${encodeURIComponent(token)}`),
    }
  }
}

export async function sendActivationEmail(
  input: SendActivationEmailInput,
): Promise<ActivationSendResult> {
  // Bounce, complaint, and provider suppression block delivery. A marketing
  // opt-out does not: this is account setup service email, not a campaign.
  try {
    await assertTransactionalEmailAllowed(input.email)
  } catch (error) {
    if (error instanceof EmailPreferenceBlockedError) return { reason: "suppressed", sent: false }
    throw error
  }
  const preference = await getProductCommunicationsPreference(input.userId)
  if (!preference) return { reason: "unknown_user", sent: false }
  if (preference.eligibilityReason === "email_unverified") {
    return { reason: "suppressed", sent: false }
  }

  const sentAt = input.sentAt ?? new Date()
  const emailHash = hashEmailAddress(input.email)

  // Everything that can fail without reaching the provider is done before the
  // claim below, so a missing key or an unrenderable message can never consume
  // a claim it will not use.
  const client = getResendClient()

  // Library size is read here rather than at selection time: a team that saved
  // its first skill after the backfill list was built must not be told the
  // library is empty, and must not get the first-skill reminder.
  const skillCount = await countOrganizationSkills(input.organizationId)
  if (input.automationKey === ACTIVATION_FIRST_SKILL && skillCount > 0) {
    return { reason: "skill_already_saved", sent: false }
  }
  const variant: ActivationWelcomeVariant = input.automationKey === ACTIVATION_WELCOME
    ? resolveActivationWelcomeVariant({
      daysSinceTeamCreated: input.daysSinceTeamCreated,
      skillCount,
    })
    : "new"

  const urls = await activationUnsubscribeUrls({ email: input.email, userId: input.userId })
  const ctaUrl = activationCtaUrl(input.automationKey)
  const subject = input.automationKey === ACTIVATION_WELCOME
    ? activationWelcomeSubject(input.teamName)
    : activationFirstSkillSubject(input.teamName)

  // The row is claimed immediately before the send. The composite primary key
  // turns a concurrent or repeated run into a no-op instead of a second email.
  const claimed = await db
    .insert(emailAutomationSend)
    .values({
      userId: input.userId,
      automationKey: input.automationKey,
      organizationId: input.organizationId,
      emailHash,
      providerEmailId: null,
      sentAt,
    })
    .onConflictDoNothing()
    .returning({ userId: emailAutomationSend.userId })
  if (claimed.length === 0) return { reason: "already_recorded", sent: false }

  let sent: Awaited<ReturnType<typeof client.emails.send>>
  try {
    sent = await client.emails.send(
      {
        from: ACTIVATION_EMAIL_FROM,
        to: [input.email],
        subject,
        headers: {
          "List-Unsubscribe": `<${urls.oneClickUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        react: input.automationKey === ACTIVATION_FIRST_SKILL
          ? (
            <ActivationFirstSkill
              ctaUrl={ctaUrl}
              firstName={input.firstName}
              managePreferencesUrl={urls.preferencesUrl}
              teamName={input.teamName}
              unsubscribeUrl={urls.unsubscribeUrl}
            />
          )
          : (
            <ActivationWelcome
              ctaUrl={ctaUrl}
              firstName={input.firstName}
              managePreferencesUrl={urls.preferencesUrl}
              teamName={input.teamName}
              unsubscribeUrl={urls.unsubscribeUrl}
              variant={variant}
            />
          ),
      },
      {
        idempotencyKey: createEmailIdempotencyKey(ACTIVATION_IDEMPOTENCY_NAMESPACE, [
          input.userId,
          input.automationKey,
        ]),
      },
    )
  } catch (thrown) {
    // The claim stays. A request that throws is ambiguous: the message may have
    // been accepted before the connection failed. This category is at most once
    // on purpose, and an email that never arrives is a smaller failure than a
    // second copy of one that did, so the claim is never released here. The row
    // keeps its null provider id as the record of the ambiguous attempt.
    console.error("Activation email request failed before a provider answer", {
      automationKey: input.automationKey,
      name: thrown instanceof Error ? thrown.name : "UnknownError",
    })
    const requestError = new Error("Failed to send activation email")
    requestError.name = "EmailDeliveryError"
    throw requestError
  }

  const { data, error } = sent
  if (error) {
    // The provider answered and refused the message, so nothing was delivered
    // and the claim can be released for a later run. Only an answered refusal
    // releases it; the ambiguous case above keeps it.
    await db
      .delete(emailAutomationSend)
      .where(and(
        eq(emailAutomationSend.userId, input.userId),
        eq(emailAutomationSend.automationKey, input.automationKey),
      ))
    console.error("Failed to send activation email", {
      automationKey: input.automationKey,
      name: error.name,
    })
    const deliveryError = new Error("Failed to send activation email")
    deliveryError.name = "EmailDeliveryError"
    throw deliveryError
  }

  const providerEmailId = data?.id ?? null
  if (providerEmailId) {
    await db
      .update(emailAutomationSend)
      .set({ providerEmailId })
      .where(and(
        eq(emailAutomationSend.userId, input.userId),
        eq(emailAutomationSend.automationKey, input.automationKey),
      ))
  }

  return { providerEmailId, sent: true }
}
