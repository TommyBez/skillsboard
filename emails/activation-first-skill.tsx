import { Button, Heading, Text } from "react-email"

import { ActivationFooter } from "@/emails/components/activation-footer"
import { EmailShell } from "@/emails/components/email-shell"
import { siteConfig } from "@/lib/site"

export interface ActivationFirstSkillProps {
  ctaUrl: string
  firstName: string | null
  managePreferencesUrl: string
  teamName: string
  unsubscribeUrl: string
}

export function activationFirstSkillSubject(teamName: string): string {
  return `Add the first skill to ${teamName}`
}

export function activationFirstSkillPreview(): string {
  return "Paste a GitHub repo URL and the library has something to hand back."
}

export default function ActivationFirstSkill({
  ctaUrl = `${siteConfig.url}/library`,
  firstName = null,
  managePreferencesUrl = `${siteConfig.url}/settings/email`,
  teamName = "your team",
  unsubscribeUrl = `${siteConfig.url}/email/unsubscribe?token=preview-token`,
}: ActivationFirstSkillProps) {
  const subject = activationFirstSkillSubject(teamName)

  return (
    <EmailShell
      preview={activationFirstSkillPreview()}
      title={subject}
      showTransactionalFooter={false}
    >
      <Heading as="h1" className="m-0 mb-5 text-[28px] font-semibold leading-9 tracking-[-0.04em] text-ink">
        {subject}
      </Heading>

      <Text className="m-0 mb-4 text-base leading-7 text-ink">
        {firstName ? `Hi ${firstName},` : "Hi,"}
      </Text>

      <Text className="m-0 mb-4 text-base leading-7 text-ink">
        {teamName} does not have a skill in it yet, so there is nothing for you or your teammates to
        find.
      </Text>
      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        The fastest way through it: open your library, paste the URL of a GitHub repository that
        holds skills you already use, and save. If that repository contains several skills, you can
        select all of them and save them in one go.
      </Text>

      <Button
        href={ctaUrl}
        className="box-border mb-6 block rounded-[12px] bg-brand px-7 py-3.5 text-center text-base font-semibold text-brand-foreground no-underline"
      >
        Add your first skill
      </Button>

      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        If you tried a repository and it did not work, send me the URL and I will look at it.
      </Text>

      <Text className="m-0 mb-2 text-base leading-7 text-ink">
        Tommaso<br />
        Skills Board
      </Text>

      <ActivationFooter
        managePreferencesUrl={managePreferencesUrl}
        teamName={teamName}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailShell>
  )
}

ActivationFirstSkill.PreviewProps = {
  ctaUrl: `${siteConfig.url}/library`,
  firstName: "Sam",
  managePreferencesUrl: `${siteConfig.url}/settings/email`,
  teamName: "Northwind",
  unsubscribeUrl: `${siteConfig.url}/email/unsubscribe?token=preview-token`,
} satisfies ActivationFirstSkillProps
