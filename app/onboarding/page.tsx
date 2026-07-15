import { Suspense } from "react"
import { redirect } from "next/navigation"

import { AccessShell } from "@/components/access-shell"
import { OnboardingForm } from "@/components/onboarding-form"
import { Skeleton } from "@/components/ui/skeleton"
import { listUserOrganizations } from "@/lib/db/queries"
import { requireSession } from "@/lib/session"

async function OnboardingGate() {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (organizations.length) redirect("/library")

  return <OnboardingForm />
}

function OnboardingFormFallback() {
  return (
    <div className="grid gap-5" aria-label="Loading team library setup">
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="mt-2 h-12 w-48 rounded-2xl" />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <AccessShell
      marker="Set up library"
      title="Create your team library"
      description="Name the shared place where your team will collect the skills it recommends."
      editorialTitle="Share what works. Let everyone choose how to use it."
      editorialBody="Your team can find recommended skills in one place and choose the source, command, or ZIP that best fits each setup."
    >
      <Suspense fallback={<OnboardingFormFallback />}>
        <OnboardingGate />
      </Suspense>
    </AccessShell>
  )
}
