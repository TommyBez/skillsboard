import { Suspense } from "react"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { AccessShell } from "@/components/access-shell"
import { getSession } from "@/lib/session"

async function RedirectAuthenticatedUser() {
  const session = await getSession()
  if (session?.user) redirect("/library")
  return null
}

export default function SignInPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectAuthenticatedUser />
      </Suspense>
      <AccessShell
        marker="Access / returning member"
        title="Welcome back"
        description="Sign in to open your team skills library."
        editorialTitle="Pick up where your team left off."
        editorialBody="Open the shared collection your team has chosen to keep, install, and make available to its agents."
      >
        <AuthForm mode="sign-in" />
      </AccessShell>
    </>
  )
}
