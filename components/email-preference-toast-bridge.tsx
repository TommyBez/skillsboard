"use client"

import { useEffect } from "react"
import { toast } from "sonner"

const SIGNUP_PREFERENCE_FAILURE_KEY = "skills-board:signup-email-preference-save-failed"

export function showSignupEmailPreferenceFailure() {
  toast.warning("Your account is ready, but your optional email preference wasn’t saved.", {
    action: {
      label: "Review preference",
      onClick: () => window.location.assign("/settings/email"),
    },
    description: "Product emails remain off unless you turn them on in Email preferences.",
    duration: 12_000,
  })
}

export function queueSignupEmailPreferenceFailure() {
  try {
    window.sessionStorage.setItem(SIGNUP_PREFERENCE_FAILURE_KEY, "true")
  } catch {
    showSignupEmailPreferenceFailure()
  }
}

export function EmailPreferenceToastBridge() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SIGNUP_PREFERENCE_FAILURE_KEY) !== "true") return
      window.sessionStorage.removeItem(SIGNUP_PREFERENCE_FAILURE_KEY)
      showSignupEmailPreferenceFailure()
    } catch {
      // Storage can be unavailable in restrictive browser contexts. The
      // optional preference remains safely off.
    }
  }, [])

  return null
}
