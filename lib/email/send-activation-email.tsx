import "server-only"

import { and, eq } from "drizzle-orm"

import ActivationFirstSkill, { activationFirstSkillSubject } from "@/emails/activation-first-skill"
import ActivationWelcome, { activationWelcomeSubject } from "@/emails/activation-welcome"
import {
  ACTIVATION_FIRST_SKILL,
  ACTIVATION_WELCOME,
  type ActivationAutomationKey,
  type ActivationWelcomeVariant,
} from "@/lib/activation-emails"
import { db } from "@/lib/db"
import { emailAutomationSend } from "@/lib/db/schema"
import { absoluteUrl } from "@/lib/site"

import {
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

export type ActivationSendSkipReason = "already_recorded" | "suppressed" | "unknown_user"

export type ActivationSendResult =
  | { providerEmailId: string | null; sent: true }
  | { reason: ActivationSendSkipReason; sent: false }

export interface SendActivationEmailInput {
  automationKey: ActivationAutomationKey
  email: string
  firstName: string | null
  organizationId: string
  sentAt?: Date
  teamName: string
  userId: string
  variant: ActivationWelcomeVariant
}

function activationCtaUrl(automationKey: ActivationAutomationKey): string {
  const path = automationKey === ACTIVATION_WELCOME ? "/connect" : "/library"
  const parameters = new URLSearchParams({
    utm_source: "email",
    utm_medium: "activation",
    utm_campaign: automationKey,
  })
  return `${absoluteUrl(path)}?${parameters.toString()}`
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
  // Suppression wins before anything else is prepared.
  await assertTransactionalEmailAllowed(input.email)
  const preference = await getProductCommunicationsPreference(input.userId)
  if (!preference) return { reason: "unknown_user", sent: false }
  if (
    preference.activeSuppressionReasons.length > 0
    || preference.eligibilityReason === "email_unverified"
  ) {
    return { reason: "suppressed", sent: false }
  }

  const sentAt = input.sentAt ?? new Date()
  const emailHash = hashEmailAddress(input.email)

  // The row is claimed before the send. The composite primary key turns a
  // concurrent or repeated run into a no-op instead of a second email.
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

  const urls = await activationUnsubscribeUrls({ email: input.email, userId: input.userId })
  const ctaUrl = activationCtaUrl(input.automationKey)
  const subject = input.automationKey === ACTIVATION_WELCOME
    ? activationWelcomeSubject(input.teamName)
    : activationFirstSkillSubject(input.teamName)

  const { data, error } = await getResendClient().emails.send(
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
            variant={input.variant}
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

  if (error) {
    // Release the claim so a later run can try again. The idempotency key
    // still protects the recipient if the provider did accept the message.
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
