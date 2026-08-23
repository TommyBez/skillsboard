import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AccessShell } from "@/components/access-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { findOpenRegistrationByUserCode } from "@/lib/agent-auth/registrations"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Link an agent",
  robots: { index: false, follow: false },
}

interface ClaimEntryPageProps {
  searchParams: Promise<{ error?: string }>
}

/**
 * Opens the ceremony a user code names.
 *
 * One answer for an unknown code and an expired one: a code is eight
 * characters, and telling a guesser which of the two they hit is the
 * difference between guessing and enumerating.
 */
async function openClaim(formData: FormData) {
  "use server"

  await requireSession("/agent/claim")

  const registration = await findOpenRegistrationByUserCode(String(formData.get("userCode") ?? ""))
  if (!registration || registration.status !== "pending_claim") {
    redirect("/agent/claim?error=unknown")
  }

  redirect(`/agent/claim/${registration.id}`)
}

/**
 * `verification_uri` — where an agent sends a user who has only the code.
 *
 * `verification_uri_complete` carries the registration id and skips this page
 * entirely; this exists for the agent that can only print a URL and a code,
 * and for the user who typed the short URL out of a terminal.
 */
async function ClaimEntryContent({ searchParams }: ClaimEntryPageProps) {
  await requireSession("/agent/claim")
  const { error } = await searchParams

  return (
    <form action={openClaim} className="grid gap-5 border-t border-border pt-6">
      {error ? (
        <p
          className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          That code isn’t open. Codes expire after ten minutes — ask your agent for a new one.
        </p>
      ) : null}

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Confirmation code</span>
        <Input
          name="userCode"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="XXXX-XXXX"
          className="h-12 rounded-[16px] font-mono tracking-[0.2em]"
          aria-describedby="agent-claim-code-hint"
        />
        <span id="agent-claim-code-hint" className="text-xs text-muted-foreground">
          Eight characters, shown by the agent that asked for access.
        </span>
      </label>

      <Button type="submit" className="h-12 rounded-[16px]">
        Continue
      </Button>
    </form>
  )
}

export default function AgentClaimEntryPage({ searchParams }: ClaimEntryPageProps) {
  return (
    <AccessShell
      marker="Agent linking"
      title="Enter your code"
      description="Type the confirmation code your agent showed you."
      editorialTitle="One approval, once."
      editorialBody="Your agent provider vouched for who you are. Skills Board still asks you to confirm the link the first time, so a matching email address alone can never hand over your account."
    >
      <Suspense
        fallback={
          <div className="grid gap-5" aria-label="Loading">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        }
      >
        <ClaimEntryContent searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
