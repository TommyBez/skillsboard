import { Suspense } from "react"

import { AccessShell } from "@/components/access-shell"
import { AuthEntry, AuthEntryFallback } from "@/components/auth-entry"

interface SignInPageProps {
  searchParams: Promise<{ returnTo?: string }>
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <AccessShell
      marker="Sign in"
      title="Welcome back"
      description="Open the shared library of skills your team recommends."
      editorialTitle="Your team’s recommendations, ready when you need them."
      editorialBody="Find a skill a colleague has already added, then choose the source, install command, or ZIP that suits your setup."
    >
      <Suspense fallback={<AuthEntryFallback mode="sign-in" />}>
        <AuthEntry mode="sign-in" searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
