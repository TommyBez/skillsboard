import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AccessShell } from "@/components/access-shell"
import { OnboardingForm } from "@/components/onboarding-form"
import { PostHogRoute } from "@/components/posthog-analytics"
import { Skeleton } from "@/components/ui/skeleton"
import { countOrganizationSkills, listUserOrganizations } from "@/lib/db/queries"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Create your team library",
  robots: { index: false, follow: false },
}

async function OnboardingGate() {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (organizations.length) {
    const active =
      organizations.find((organization) => organization.id === session.session.activeOrganizationId) ??
      organizations[0]
    const skillCount = await countOrganizationSkills(active.id)
    // An empty team just created here is owed the first-run screen, not the
    // library. A team that already holds skills is done with that screen.
    redirect(skillCount === 0 ? "/start" : "/library")
  }

  return (
    <>
      <PostHogRoute userId={session.user.id} />
      <OnboardingForm />
    </>
  )
}

function OnboardingFormFallback() {
  return (
    <div className="grid gap-5" aria-label="Loading team library setup">
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
      description="Name the shared place where your team will collect its AI skills."
      editorialTitle="Share what works. Let everyone choose how to use it."
      editorialBody="Your team can find every saved skill in one place and choose the source, command, or ZIP that best fits each setup."
    >
      <Suspense fallback={<OnboardingFormFallback />}>
        <OnboardingGate />
      </Suspense>
    </AccessShell>
  )
}
