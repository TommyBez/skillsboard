"use server"

import { db } from "@/lib/db"
import { emailConsentEvent, emailSubscriber } from "@/lib/db/schema"
import {
  EMAIL_CAPTURE_NOTICE_TEXT,
  EMAIL_CAPTURE_NOTICE_VERSION,
  isHoneypotFilled,
  normalizeCapturedEmail,
  normalizeCaptureSource,
} from "@/lib/email/email-capture"
import { hashEmailAddress } from "@/lib/email/email-privacy"
import { PRODUCT_COMMUNICATIONS_TOPIC } from "@/lib/email/product-communications"

export interface EmailCaptureState {
  message: string
  status: "error" | "idle" | "success"
}

const successState: EmailCaptureState = {
  message: "You are on the list.",
  status: "success",
}

/**
 * Adds a visitor address to the product-update list and records the consent
 * that arrived with it.
 *
 * A new address is stored together with an `emailConsentEvent` row in one
 * transaction, so the list never holds an address the ledger cannot account
 * for. The event carries the hashed address, the page that captured it, and
 * the exact notice the visitor read, on the same `product_communications`
 * topic a signed-in preference uses. Its null `userId` records that no account
 * was involved, and its `subscribe` action keeps a visitor capture readable
 * apart from an account-scoped grant.
 *
 * Three things this deliberately does not do. It never reports whether an
 * address was already stored, so the form cannot be used to enumerate the
 * list: a duplicate takes the on-conflict path, writes no second consent
 * event, and still answers "you are on the list". It never answers a filled
 * honeypot differently from a real submission, so a bot learns nothing from
 * the response. And it sends nothing: delivery to these addresses is a
 * separate change and goes through the existing suppression and unsubscribe
 * pipeline.
 */
export async function subscribeEmail(
  _state: EmailCaptureState,
  formData: FormData,
): Promise<EmailCaptureState> {
  if (isHoneypotFilled(formData.get("company"))) return successState

  const email = normalizeCapturedEmail(formData.get("email"))
  if (!email) {
    return {
      message: "Enter a valid email address.",
      status: "error",
    }
  }

  const source = normalizeCaptureSource(formData.get("source"))

  try {
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(emailSubscriber)
        .values({ email, source })
        .onConflictDoNothing({ target: emailSubscriber.email })
        .returning({ id: emailSubscriber.id })

      // An empty array is the on-conflict path: the address is already on the
      // list and its first consent already stands in the ledger. A second
      // event would record a decision the visitor did not make again.
      if (inserted.length === 0) return

      await tx.insert(emailConsentEvent).values({
        userId: null,
        emailHash: hashEmailAddress(email),
        topic: PRODUCT_COMMUNICATIONS_TOPIC,
        action: "subscribe",
        source,
        noticeVersion: EMAIL_CAPTURE_NOTICE_VERSION,
        noticeText: EMAIL_CAPTURE_NOTICE_TEXT,
      })
    })
  } catch (error) {
    // The address itself never reaches the log.
    console.error("Unable to save an email capture", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      source,
    })
    return {
      message: "We couldn’t save your email. Try again.",
      status: "error",
    }
  }

  return successState
}
