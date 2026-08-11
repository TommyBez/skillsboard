"use server"

import { db } from "@/lib/db"
import { emailSubscriber } from "@/lib/db/schema"
import {
  isHoneypotFilled,
  normalizeCapturedEmail,
  normalizeCaptureSource,
} from "@/lib/email/email-capture"

export interface EmailCaptureState {
  message: string
  status: "error" | "idle" | "success"
}

const successState: EmailCaptureState = {
  message: "You are on the list.",
  status: "success",
}

/**
 * Adds a visitor address to the product-update list.
 *
 * Three things this deliberately does not do. It never reports whether an
 * address was already stored, so the form cannot be used to enumerate the
 * list: a duplicate takes the on-conflict path and still answers "you are on
 * the list". It never answers a filled honeypot differently from a real
 * submission, so a bot learns nothing from the response. And it sends nothing:
 * delivery to these addresses is a separate change and goes through the
 * existing consent, suppression, and unsubscribe pipeline.
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
    await db
      .insert(emailSubscriber)
      .values({ email, source })
      .onConflictDoNothing({ target: emailSubscriber.email })
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
