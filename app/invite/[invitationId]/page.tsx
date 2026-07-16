import { Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { AcceptInvitationForm } from "@/components/accept-invitation-form"
import { AccessShell } from "@/components/access-shell"
import { SignOutForm } from "@/components/sign-out-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"
import { getSession } from "@/lib/session"

interface InvitationPageProps {
  params: Promise<{ invitationId: string }>
}

async function InvitationDetails({ params }: InvitationPageProps) {
  const [{ invitationId }, session] = await Promise.all([params, getSession()])
  const returnTo = `/invite/${encodeURIComponent(invitationId)}`

  if (!session?.user) {
    redirect(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`)
  }

  try {
    const invitation = await auth.api.getInvitation({
      headers: await headers(),
      query: { id: invitationId },
    })

    return (
      <AccessShell
        marker="Team invitation"
        title={`Join ${invitation.organizationName}`}
        description={`${invitation.inviterEmail} invited ${session.user.email} to join as ${invitation.role}.`}
        editorialTitle="Find the skills your new teammates recommend."
        editorialBody="Join their shared library, then open the source, copy a compatible install command, or download the latest skill files as a ZIP."
      >
        <AcceptInvitationForm invitationId={invitationId} />
      </AccessShell>
    )
  } catch (error) {
    console.error("Unable to load invitation", error)
    return (
      <AccessShell
        marker="Team invitation"
        title="This invitation isn’t available"
        description="It may have expired, been accepted, or belong to another email address."
        editorialTitle="Use the invited account."
        editorialBody="Sign in with the email address named in the invitation, or ask a team admin for a new link."
      >
        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" className="h-12 rounded-[16px] px-6" nativeButton={false} render={<Link href="/library" />}>
            Open your library
          </Button>
          <SignOutForm returnTo={returnTo}>
            <Button type="submit" size="lg" className="h-12 w-full rounded-[16px] px-6">
              Try another account
            </Button>
          </SignOutForm>
        </div>
      </AccessShell>
    )
  }
}

function InvitationFallback() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-4">
      <Skeleton className="h-[32rem] w-full max-w-2xl rounded-[24px]" aria-label="Loading invitation" />
    </div>
  )
}

export default function InvitationPage(props: InvitationPageProps) {
  return (
    <Suspense fallback={<InvitationFallback />}>
      <InvitationDetails {...props} />
    </Suspense>
  )
}
