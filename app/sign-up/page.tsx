import { Suspense } from "react"

import { AccessShell } from "@/components/access-shell"
import { AuthEntry, AuthEntryFallback } from "@/components/auth-entry"

interface SignUpPageProps {
  searchParams: Promise<{ returnTo?: string }>
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
