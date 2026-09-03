import { Hr, Link, Text } from "react-email"

import { siteConfig } from "@/lib/site"

export interface MarketingFooterProps {
  managePreferencesUrl: string
  providerUnsubscribeUrl: string
  unsubscribeUrl: string
}

export function MarketingFooter({
  managePreferencesUrl,
  providerUnsubscribeUrl,
  unsubscribeUrl,
}: MarketingFooterProps) {
  return (
    <>
      <Hr className="my-7 border-solid border-border" />
      <Text className="my-2 text-xs leading-5 text-muted">
        You are receiving this because you opted in to Skills Board product communications.
        You can <Link href={unsubscribeUrl} className="text-ink underline">unsubscribe from product emails</Link>
        {", "}<Link href={managePreferencesUrl} className="text-ink underline">manage your email preferences</Link>,
        {" "}or use the <Link href={providerUnsubscribeUrl} className="text-ink underline">provider unsubscribe page</Link> at any time.
      </Text>
      <Text className="my-2 text-xs leading-5 text-muted">
        <Link href={`${siteConfig.url}/privacy`} className="text-ink underline">Privacy Policy</Link>
        {" · "}
        <Link href={`${siteConfig.url}/contact`} className="text-ink underline">Contact Skills Board</Link>
      </Text>
      <Text className="mb-0 mt-2 text-xs leading-5 text-muted">
        {siteConfig.name}
        {siteConfig.postalAddress ? (
          <>
            <br />
            {siteConfig.postalAddress}
          </>
        ) : null}
      </Text>
    </>
  )
}
