import { ExistingUserEmailConsentPromptForm } from "@/components/existing-user-email-consent-prompt-form"
import { getProductCommunicationsPreference } from "@/lib/email/email-preferences"
import { shouldShowExistingUserEmailConsentPrompt } from "@/lib/email/product-communications"
import { getSession } from "@/lib/session"

export async function ExistingUserEmailConsentPrompt() {
  const session = await getSession()
  if (!session?.user) return null

  try {
    const preference = await getProductCommunicationsPreference(session.user.id)
    if (!preference) return null
    const show = shouldShowExistingUserEmailConsentPrompt({
      accountCreatedAt: preference.accountCreatedAt,
      activeSuppressionReasons: preference.activeSuppressionReasons,
      eligibilityReason: preference.eligibilityReason,
      noticeText: preference.noticeText,
      noticeVersion: preference.noticeVersion,
      now: new Date(),
      subscribed: preference.subscribed,
    })
    if (!show) return null
    return <ExistingUserEmailConsentPromptForm />
  } catch (error) {
    console.error("Unable to load the legacy account email choice", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
    return null
  }
}
