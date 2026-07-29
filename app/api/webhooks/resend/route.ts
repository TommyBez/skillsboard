import { createHash } from "node:crypto"

import { and, eq, ne, sql } from "drizzle-orm"
import { Resend, type WebhookEventPayload } from "resend"

import { db } from "@/lib/db"
import { emailWebhookEvent } from "@/lib/db/schema"
import {
  applyEmailSuppressionInTransaction,
  confirmProviderResubscriptionInTransaction,
  recordProductCommunicationsDeliveryInTransaction,
  recordProviderContactStateInTransaction,
  type EmailPreferenceTransaction,
} from "@/lib/email/email-preferences"
import {
  isProductCommunicationsSender,
  normalizeEmailAddress,
} from "@/lib/email/product-communications"

const MAX_WEBHOOK_PAYLOAD_BYTES = 256 * 1024
// Resend's constructor requires a send key even though webhook verification
// is entirely local. Keep the inbound verifier independent from send authority.
const webhookVerifier = new Resend("re_webhook_signature_verification_only")

type SuppressionEvent = Extract<
  WebhookEventPayload,
  { type: "email.bounced" | "email.complained" | "email.suppressed" }
>

function response(body: string, status: number) {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

async function readPayload(request: Request): Promise<string | null> {
  const declaredLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_PAYLOAD_BYTES) {
    return null
  }

  if (!request.body) return ""
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let byteLength = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    byteLength += value.byteLength
    if (byteLength > MAX_WEBHOOK_PAYLOAD_BYTES) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }

  return Buffer.concat(chunks).toString("utf8")
}

function providerCreatedAt(event: WebhookEventPayload): Date | null {
  const createdAt = new Date(event.created_at)
  return Number.isNaN(createdAt.getTime()) ? null : createdAt
}

function providerEmailId(event: WebhookEventPayload): string | null {
  return "email_id" in event.data ? event.data.email_id : null
}

function uniqueRecipients(event: SuppressionEvent): string[] {
  return [...new Set(event.data.to.map(normalizeEmailAddress).filter(Boolean))].sort()
}

async function processWebhookEvent(
  event: WebhookEventPayload,
  tx: EmailPreferenceTransaction,
): Promise<void> {
  if (
    event.type === "email.sent"
    && event.data.broadcast_id
    && isProductCommunicationsSender(event.data.from)
  ) {
    const sentAt = new Date(event.data.created_at)
    if (Number.isNaN(sentAt.getTime())) throw new Error("InvalidProviderDeliveryTimestamp")
    await recordProductCommunicationsDeliveryInTransaction(tx, {
      emails: event.data.to,
      providerBroadcastId: event.data.broadcast_id,
      providerEmailId: event.data.email_id,
      sentAt,
    })
    return
  }

  if (event.type === "contact.updated") {
    const occurredAt = providerCreatedAt(event)
    if (!occurredAt) throw new Error("InvalidProviderEventTimestamp")
    const plan = await recordProviderContactStateInTransaction(tx, {
      email: event.data.email,
      providerOccurredAt: occurredAt,
      providerReference: event.data.id,
      unsubscribed: event.data.unsubscribed,
    })
    if (plan.recordIncomingOptOut) {
      await applyEmailSuppressionInTransaction(tx, {
        email: event.data.email,
        providerOccurredAt: occurredAt,
        providerReference: event.data.id,
        reason: "provider_unsubscribe",
        source: "resend_webhook",
      })
    }
    if (plan.reconcileWith) {
      await confirmProviderResubscriptionInTransaction(tx, {
        email: event.data.email,
        providerOccurredAt: plan.reconcileWith.providerOccurredAt,
        providerReference: plan.reconcileWith.providerReference ?? undefined,
      })
    }
    return
  }

  if (
    event.type !== "email.bounced"
    && event.type !== "email.complained"
    && event.type !== "email.suppressed"
  ) {
    return
  }

  if (event.type === "email.bounced" && event.data.bounce.type.toLowerCase() !== "permanent") {
    return
  }

  const reason = event.type === "email.bounced"
    ? "hard_bounce"
    : event.type === "email.complained"
      ? "complaint"
      : "provider_suppressed"
  const occurredAt = providerCreatedAt(event)
  if (!occurredAt) throw new Error("InvalidProviderEventTimestamp")

  for (const email of uniqueRecipients(event)) {
    await applyEmailSuppressionInTransaction(tx, {
      email,
      providerOccurredAt: occurredAt,
      providerReference: event.data.email_id,
      reason,
      source: "resend_webhook",
    })
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    console.error("Resend webhook is unavailable because RESEND_WEBHOOK_SECRET is not configured")
    return response("Webhook unavailable", 500)
  }

  const id = request.headers.get("svix-id")
  const timestamp = request.headers.get("svix-timestamp")
  const signature = request.headers.get("svix-signature")
  if (!id || !timestamp || !signature) return response("Invalid webhook", 400)

  const payload = await readPayload(request)
  if (payload === null) {
    return response("Webhook payload too large", 413)
  }

  let event: WebhookEventPayload
  try {
    // Resend 6.17.2 maps the Svix header values to id/timestamp/signature.
    event = webhookVerifier.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    })
  } catch {
    return response("Invalid webhook", 400)
  }

  const payloadHash = createHash("sha256").update(payload).digest("hex")
  const eventType = event.type

  try {
    await db
      .insert(emailWebhookEvent)
      .values({
        id,
        type: eventType,
        payloadHash,
        providerEmailId: providerEmailId(event),
        providerCreatedAt: providerCreatedAt(event),
      })
      .onConflictDoNothing()

    const outcome = await db.transaction(async (tx) => {
      const [stored] = await tx
        .select({
          attempts: emailWebhookEvent.attempts,
          payloadHash: emailWebhookEvent.payloadHash,
          status: emailWebhookEvent.status,
        })
        .from(emailWebhookEvent)
        .where(eq(emailWebhookEvent.id, id))
        .limit(1)
        .for("update")

      if (!stored) throw new Error("Verified Resend webhook was not persisted")
      if (stored.payloadHash !== payloadHash) return "conflict" as const
      if (stored.status === "processed") return "processed" as const

      await tx
        .update(emailWebhookEvent)
        .set({
          attempts: stored.attempts + 1,
          lastError: null,
          status: "pending",
        })
        .where(eq(emailWebhookEvent.id, id))

      // The event ledger, audit rows, suppressions, and proactive-delivery
      // ledger commit atomically on the same connection.
      await processWebhookEvent(event, tx)

      await tx
        .update(emailWebhookEvent)
        .set({
          lastError: null,
          processedAt: new Date(),
          status: "processed",
        })
        .where(eq(emailWebhookEvent.id, id))
      return "processed" as const
    })

    if (outcome === "conflict") {
      console.error("Rejected a Resend webhook whose svix-id was already used with another payload", {
        eventId: id,
        eventType,
      })
      return response("Invalid webhook identity", 400)
    }
    return response("OK", 200)
  } catch (error) {
    try {
      await db
        .update(emailWebhookEvent)
        .set({
          attempts: sql`${emailWebhookEvent.attempts} + 1`,
          lastError: error instanceof Error ? error.name.slice(0, 120) : "UnknownError",
          status: "failed",
        })
        .where(and(
          eq(emailWebhookEvent.id, id),
          ne(emailWebhookEvent.status, "processed"),
        ))
    } catch {
      // The 500 response still asks Resend to retry when even failure-state
      // persistence is unavailable.
    }
    console.error("Unable to process a verified Resend webhook", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      eventId: id,
      eventType,
    })
    return response("Webhook processing failed", 500)
  }
}
