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
      description="Create your account, then start a team library or join one you’ve been invited to."
      editorialTitle="One trusted library for the skills your team uses."
      editorialBody="Keep GitHub-backed skills searchable, ready to install, and available to teammates and agents."
    >
      <Suspense fallback={<AuthEntryFallback mode="sign-up" />}>
        <AuthEntry mode="sign-up" searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
