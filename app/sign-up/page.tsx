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

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectAuthenticatedUser />
      </Suspense>
      <AccessShell
        marker="Access / new library"
        title="Build your skill library"
        description="Create an account, then invite your team."
        editorialTitle="Keep the skills worth using again."
        editorialBody="Turn scattered GitHub links and useful discoveries into one searchable, installable library for your whole product team."
      >
        <AuthForm mode="sign-up" />
      </AccessShell>
    </>
  )
}
