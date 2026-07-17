import { Suspense } from "react"
import type { Metadata } from "next"

import { AccessShell } from "@/components/access-shell"
import { AuthEntry, AuthEntryFallback } from "@/components/auth-entry"

export const metadata: Metadata = {
  title: "Create your team library",
  description:
    "Create a free Skills Board account and start a shared library of AI skills your team recommends.",
  alternates: { canonical: "/sign-up" },
  openGraph: {
    url: "/sign-up",
    title: "Create your team library | Skills Board",
    description:
      "Start a shared skill library for your team. Free forever, open source, built for mixed agent setups.",
  },
}

interface SignUpPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return (
    <AccessShell
      marker="Create account"
      title="Create your free account"
      description="Start a shared skill library for your team, or join one you’ve been invited to."
      editorialTitle="Stop answering the same “which skill?” question."
      editorialBody="Collect the skills your team recommends so colleagues can find them and choose the source, compatible command, or ZIP that fits their setup."
    >
      <Suspense fallback={<AuthEntryFallback mode="sign-up" />}>
        <AuthEntry mode="sign-up" searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
