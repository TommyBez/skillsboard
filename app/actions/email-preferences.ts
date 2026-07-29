"use server"

import { revalidatePath } from "next/cache"

import {
  EmailPreferenceBlockedError,
  setProductCommunicationsPreference,
} from "@/lib/email/email-preferences"
import { getSession } from "@/lib/session"

export interface EmailPreferenceActionState {
  message: string
  status: "error" | "idle" | "success"
  subscribed: boolean | null
}

async function currentUserId(): Promise<string | null> {
  const session = await getSession()
  if (!session?.user?.emailVerified) return null
  return session.user.id
}

export async function saveSignupProductCommunicationsConsent(): Promise<{
  saved: boolean
}> {
  const userId = await currentUserId()
  if (!userId) return { saved: false }

  try {
    await setProductCommunicationsPreference({
      source: "signup",
      subscribed: true,
      userId,
    })
    return { saved: true }
  } catch (error) {
    console.error("Unable to save the optional signup email choice", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    })
    return { saved: false }
  }
}

async function saveAuthenticatedProductCommunicationsPreference(
  source: "existing_user_prompt" | "settings",
  formData: FormData,
): Promise<EmailPreferenceActionState> {
  const rawSubscribed = formData.get("subscribed")
  if (rawSubscribed !== "true" && rawSubscribed !== "false") {
    return {
      message: "Choose whether you want to receive product emails.",
      status: "error",
      subscribed: null,
    }
  }

  const userId = await currentUserId()
  if (!userId) {
    return {
      message: "Sign in again before changing this preference.",
      status: "error",
      subscribed: null,
    }
  }

  const subscribed = rawSubscribed === "true"
  try {
    const preference = await setProductCommunicationsPreference({
      source,
      subscribed,
      userId,
    })
    revalidatePath("/settings/email")
    const providerPaused = preference.subscribed
      && preference.activeSuppressionReasons.includes("provider_unsubscribe")
    return {
      message: providerPaused
        ? "Your opt-in was saved. Delivery remains off until the provider subscription is updated and verified."
        : preference.effectiveSubscribed
          ? "Product emails are turned on."
          : "Product emails are turned off.",
      status: "success",
      subscribed: preference.subscribed,
    }
  } catch (error) {
    if (error instanceof EmailPreferenceBlockedError) {
      return {
        message: "This address cannot receive product emails because of a permanent delivery block.",
        status: "error",
        subscribed: false,
      }
    }

    console.error("Unable to update the authenticated email preference", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      source,
    })
    return {
      message: "We couldn’t save this preference. Try again.",
      status: "error",
      subscribed: null,
    }
  }
}

export async function answerExistingUserEmailConsentPrompt(
  _state: EmailPreferenceActionState,
  formData: FormData,
): Promise<EmailPreferenceActionState> {
  return saveAuthenticatedProductCommunicationsPreference("existing_user_prompt", formData)
}

export async function updateProductCommunicationsPreference(
  _state: EmailPreferenceActionState,
  formData: FormData,
): Promise<EmailPreferenceActionState> {
  return saveAuthenticatedProductCommunicationsPreference("settings", formData)
}
