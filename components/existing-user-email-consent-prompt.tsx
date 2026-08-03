import { ExistingUserEmailConsentPromptForm } from "@/components/existing-user-email-consent-prompt-form"
import { getProductCommunicationsPreference } from "@/lib/email/email-preferences"
import {
  PRODUCT_COMMUNICATIONS_DISCLOSURE,
  PRODUCT_COMMUNICATIONS_NOTICE_VERSION,
} from "@/lib/email/product-communications"
import { getSession } from "@/lib/session"

export async function ExistingUserEmailConsentPrompt() {
  const session = await getSession()
  if (!session?.user) return null

  try {
    const preference = await getProductCommunicationsPreference(session.user.id)
    if (!preference || preference.activeSuppressionReasons.length > 0) return null
    const currentNotice = preference.noticeVersion === PRODUCT_COMMUNICATIONS_NOTICE_VERSION
      && preference.noticeText === PRODUCT_COMMUNICATIONS_DISCLOSURE
    const retainedNegativeChoice = !preference.subscribed && preference.noticeVersion !== null
    const affirmativeChoiceMatchesCurrentEmail = preference.eligibilityReason !== "email_changed"
    if ((currentNotice && affirmativeChoiceMatchesCurrentEmail) || retainedNegativeChoice) return null
    return <ExistingUserEmailConsentPromptForm />
  } catch (error) {
    console.error("Unable to load the legacy account email choice", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
    return null
  }
}
