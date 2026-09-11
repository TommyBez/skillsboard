import { Hr, Link, Text } from "react-email"

import { siteConfig } from "@/lib/site"

export interface ActivationFooterProps {
  managePreferencesUrl: string
  teamName: string
  unsubscribeUrl: string
}

/**
 * Footer for account setup service email. It is not the marketing footer: the
 * recipient of these two messages has not given marketing consent,
 * so the reason line states the real reason, which is that this person created
 * the team. Unsubscribe stays visible and is the same one-click link used by
 * every other proactive email.
 */
export function ActivationFooter({
  managePreferencesUrl,
  teamName,
  unsubscribeUrl,
}: ActivationFooterProps) {
  return (
    <>
      <Hr className="my-7 border-solid border-border" />
      <Text className="my-2 text-xs leading-5 text-muted">
        You are receiving this account setup email because you created {teamName} on Skills Board.
        You can <Link href={unsubscribeUrl} className="text-ink underline">unsubscribe from these emails</Link>
        {" or "}<Link href={managePreferencesUrl} className="text-ink underline">manage your email preferences</Link> at any time.
      </Text>
      <Text className="my-2 text-xs leading-5 text-muted">
        <Link href={`${siteConfig.url}/privacy`} className="text-ink underline">Privacy Policy</Link>
        {" · "}
        <Link href={`${siteConfig.url}/contact`} className="text-ink underline">Contact Skills Board</Link>
      </Text>
      <Text className="mb-0 mt-2 text-xs leading-5 text-muted">
        {siteConfig.name}
      </Text>
    </>
  )
}
