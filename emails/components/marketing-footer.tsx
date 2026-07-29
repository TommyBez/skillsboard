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
      <Hr className="my-7 border-solid border-gray-200" />
      <Text className="my-2 text-xs leading-5 text-gray-500">
        You are receiving this because you opted in to Skills Board product communications.
        You can <Link href={unsubscribeUrl} className="text-gray-700 underline">unsubscribe</Link>
        {", "}<Link href={managePreferencesUrl} className="text-gray-700 underline">manage your email preferences</Link>,
        {" "}or use the <Link href={providerUnsubscribeUrl} className="text-gray-700 underline">provider unsubscribe page</Link> at any time.
      </Text>
      <Text className="my-2 text-xs leading-5 text-gray-500">
        <Link href={`${siteConfig.url}/privacy`} className="text-gray-700 underline">Privacy</Link>
        {" · "}
        <Link href={`${siteConfig.url}/contact`} className="text-gray-700 underline">Contact</Link>
      </Text>
      <Text className="my-2 text-xs leading-5 text-gray-500">
        {siteConfig.name}<br />
        {siteConfig.postalAddress}
      </Text>
    </>
  )
}
