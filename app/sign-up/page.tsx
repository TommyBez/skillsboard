import { Suspense } from "react"
import type { Metadata } from "next"

import { AccessShell } from "@/components/access-shell"
import { AuthEntry, AuthEntryFallback } from "@/components/auth-entry"
import { siteConfig } from "@/lib/site"

const socialDescription =
  "Start a shared AI skill library for your team. Free forever, open source, and built for mixed agent setups."

export const metadata: Metadata = {
  title: "Create your shared AI skill library",
  description:
    "Create a free Skills Board account and start a shared AI skill library for your team.",
  alternates: { canonical: "/sign-up" },
  openGraph: {
    type: "website",
    url: "/sign-up",
    title: "Create your shared AI skill library | Skills Board",
    description: socialDescription,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: "Create your shared AI skill library | Skills Board",
    description: socialDescription,
  },
}

interface SignUpPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return (
    <AccessShell
      marker="Create account"
      title="Create your shared AI skill library"
      description="Enter your email for a one-time code, then start the free library your team can use across agent setups."
      editorialTitle="Stop answering the same “which skill?” question."
      editorialBody="Collect your team’s AI skills so colleagues can find them and choose the source, compatible command, or ZIP that fits their setup."
    >
      <Suspense fallback={<AuthEntryFallback mode="sign-up" />}>
        <AuthEntry mode="sign-up" searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
