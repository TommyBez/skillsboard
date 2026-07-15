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
      description="Open your team’s saved skills and install commands."
      editorialTitle="Pick up where your team left off."
      editorialBody="Return to the GitHub-backed skills your team has chosen to save, install, and share with its agents."
    >
      <Suspense fallback={<AuthEntryFallback mode="sign-in" />}>
        <AuthEntry mode="sign-in" searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
