import { Button, Heading, Text } from "react-email"

import { ActivationFooter } from "@/emails/components/activation-footer"
import { EmailShell } from "@/emails/components/email-shell"
import type { ActivationWelcomeVariant } from "@/lib/activation-emails"
import { siteConfig } from "@/lib/site"

export interface ActivationWelcomeProps {
  ctaUrl: string
  firstName: string | null
  managePreferencesUrl: string
  teamName: string
  unsubscribeUrl: string
  /**
   * `new` speaks to a team created in the last couple of days. `backfill` is
   * for the one time retroactive pass, where a first day tone would be false.
   * `saved` is for a team whose library already has skills in it, where the
   * empty library wording of the other two would be false.
   */
  variant: ActivationWelcomeVariant
}

export function activationWelcomeSubject(teamName: string): string {
  return `Your ${teamName} library on Skills Board`
}

export function activationWelcomePreview(): string {
  return "Three things to do when you have a minute, starting with your agent."
}

export default function ActivationWelcome({
  ctaUrl = `${siteConfig.url}/connect`,
  firstName = null,
  managePreferencesUrl = `${siteConfig.url}/settings/email`,
  teamName = "your team",
  unsubscribeUrl = `${siteConfig.url}/email/unsubscribe?token=preview-token`,
  variant = "new",
}: ActivationWelcomeProps) {
  const subject = activationWelcomeSubject(teamName)

  return (
    <EmailShell
      preview={activationWelcomePreview()}
      title={subject}
      showTransactionalFooter={false}
    >
      <Heading as="h1" className="m-0 mb-5 text-[28px] font-semibold leading-9 tracking-[-0.04em] text-ink">
        {subject}
      </Heading>

      <Text className="m-0 mb-4 text-base leading-7 text-ink">
        {firstName ? `Hi ${firstName},` : "Hi,"}
      </Text>

      {variant === "saved" && (
        <Text className="m-0 mb-4 text-base leading-7 text-ink">
          You created {teamName} on Skills Board and the library already has skills in it, so I will
          skip the introduction and go to the part that is easy to miss.
        </Text>
      )}
      {variant === "backfill" && (
        <Text className="m-0 mb-4 text-base leading-7 text-ink">
          You created {teamName} on Skills Board a while ago and the library is still empty, so I
          wanted to make sure you know what it can do.
        </Text>
      )}
      {variant === "new" && (
        <Text className="m-0 mb-4 text-base leading-7 text-ink">
          Thanks for creating {teamName} on Skills Board. The library is empty right now, which is
          what day one looks like.
        </Text>
      )}

      {variant === "saved" ? (
        <Text className="m-0 mb-4 text-base leading-7 text-ink">
          Two things are worth doing from here, in any order: connect your agent so it can search
          the library from inside the client you already use, and invite a teammate so the library
          has more than one person in it.
        </Text>
      ) : (
        <Text className="m-0 mb-4 text-base leading-7 text-ink">
          Your start page lists three things to do, in any order: connect your agent so it can
          search the library from inside the client you already use, save a skill your team keeps
          coming back to, and invite a teammate so the library has more than one person in it.
        </Text>
      )}
      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        I would start with the agent, because that is where the skills actually get used.
      </Text>

      <Button
        href={ctaUrl}
        className="box-border mb-6 block rounded-[12px] bg-brand px-7 py-3.5 text-center text-base font-semibold text-brand-foreground no-underline"
      >
        Connect your agent
      </Button>

      <Text className="m-0 mb-6 text-base leading-7 text-ink">
        If something does not work the way you expected, reply to this email. I read them.
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

ActivationWelcome.PreviewProps = {
  ctaUrl: `${siteConfig.url}/connect`,
  firstName: "Sam",
  managePreferencesUrl: `${siteConfig.url}/settings/email`,
  teamName: "Northwind",
  unsubscribeUrl: `${siteConfig.url}/email/unsubscribe?token=preview-token`,
  variant: "new",
} satisfies ActivationWelcomeProps
