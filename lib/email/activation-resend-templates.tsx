import { render } from "react-email"

import ActivationFirstSkill, { activationFirstSkillSubject } from "@/emails/activation-first-skill"
import ActivationWelcome, { activationWelcomeSubject } from "@/emails/activation-welcome"
import {
  ACTIVATION_FIRST_SKILL,
  ACTIVATION_WELCOME,
  activationCtaUrl,
} from "@/lib/activation-emails"
import { absoluteUrl } from "@/lib/site"

/**
 * Mustache placeholders Resend interpolates on send. FIRST_NAME and
 * RESEND_UNSUBSCRIBE_URL are reserved contact fields; TEAM_NAME is the custom
 * contact property the provision script defines.
 */
export const ACTIVATION_RESEND_TEAM_NAME = "{{{TEAM_NAME}}}"
export const ACTIVATION_RESEND_FIRST_NAME = "{{{FIRST_NAME|there}}}"
export const ACTIVATION_RESEND_UNSUBSCRIBE_URL = "{{{RESEND_UNSUBSCRIBE_URL}}}"

export const ACTIVATION_RESEND_TEMPLATE_VARIABLES = [
  { key: "TEAM_NAME", type: "string" as const, fallbackValue: "your team" },
]

export interface ActivationResendTemplate {
  alias: string
  html: string
  name: string
  subject: string
}

function forceAbsoluteEmailAssets(): void {
  process.env.EMAIL_FORCE_ABSOLUTE_ASSETS = "1"
}

export async function renderActivationWelcomeTemplate(): Promise<ActivationResendTemplate> {
  forceAbsoluteEmailAssets()
  const html = await render(
    <ActivationWelcome
      ctaUrl={activationCtaUrl(ACTIVATION_WELCOME)}
      firstName={ACTIVATION_RESEND_FIRST_NAME}
      managePreferencesUrl={absoluteUrl("/settings/email")}
      teamName={ACTIVATION_RESEND_TEAM_NAME}
      unsubscribeUrl={ACTIVATION_RESEND_UNSUBSCRIBE_URL}
      variant="new"
    />,
  )
  return {
    alias: "activation-welcome",
    html,
    name: "Activation welcome",
    subject: activationWelcomeSubject(ACTIVATION_RESEND_TEAM_NAME),
  }
}

export async function renderActivationFirstSkillTemplate(): Promise<ActivationResendTemplate> {
  forceAbsoluteEmailAssets()
  const html = await render(
    <ActivationFirstSkill
      ctaUrl={activationCtaUrl(ACTIVATION_FIRST_SKILL)}
      firstName={ACTIVATION_RESEND_FIRST_NAME}
      managePreferencesUrl={absoluteUrl("/settings/email")}
      teamName={ACTIVATION_RESEND_TEAM_NAME}
      unsubscribeUrl={ACTIVATION_RESEND_UNSUBSCRIBE_URL}
    />,
  )
  return {
    alias: "activation-first-skill",
    html,
    name: "Activation first skill",
    subject: activationFirstSkillSubject(ACTIVATION_RESEND_TEAM_NAME),
  }
}
