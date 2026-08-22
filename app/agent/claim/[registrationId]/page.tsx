import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"

import { AccessShell } from "@/components/access-shell"
import { AgentClaimForm } from "@/components/agent-claim-form"
import { PostHogIdentity } from "@/components/posthog-identity"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { findClientName } from "@/lib/agent-auth/clients"
import { findOpenRegistration } from "@/lib/agent-auth/registrations"
import { oauthScopeDescriptions } from "@/lib/oauth-scopes"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Link an agent",
  robots: { index: false, follow: false },
}

interface ClaimPageProps {
  params: Promise<{ registrationId: string }>
}

function Unavailable({ reason }: { reason: string }) {
  return (
    <div data-testid="agent-claim-content" className="grid gap-5 border-t border-border pt-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">This request isn’t open</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason}</p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>
        Open your library
      </Button>
    </div>
  )
}

/**
 * The one page in the Agent Verified flow a human sees.
 *
 * It exists because a provider saying `email_verified: true` is not the same
 * as that provider being entitled to a Skills Board account with the same
 * address. `requireSession` puts the ordinary OTP sign-in in front of this
 * page, and the action behind it refuses unless the account that signs in is
 * the one the assertion pointed at. That happens exactly once per
 * `(provider, subject)`; afterwards the delegation answers on its own.
 */
async function ClaimContent({ params }: ClaimPageProps) {
  const { registrationId } = await params
  const session = await requireSession(`/agent/claim/${registrationId}`)
  const registration = await findOpenRegistration(registrationId)

  if (!registration || registration.status !== "pending_claim") {
    return (
      <Unavailable reason="It expired, or it was already answered. Ask the agent to start again." />
    )
  }

  // The account the assertion's verified email resolved to. Anyone else
  // signed in gets nothing: a link is only ever confirmed by its own holder.
  if (registration.userId && registration.userId !== session.user.id) {
    return (
      <Unavailable reason="This request is for a different Skills Board account. Sign out, sign in as that account, and open the link again." />
    )
  }

  const agentName = (await findClientName(registration.clientId)) ?? "An agent"
  const providerName = registration.providerName ?? "its provider"

  return (
    <div data-testid="agent-claim-content" className="flex flex-col gap-6">
      <PostHogIdentity userId={session.user.id} />

      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
          <ShieldCheckIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Requesting access
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{agentName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Signed in to {providerName} as{" "}
            <span className="font-medium text-foreground">{registration.email}</span>
          </p>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
        <p>
          Confirmation code{" "}
          <code className="font-mono font-medium text-foreground">{registration.userCode}</code>.
          Only continue if it matches the code your agent showed you.
        </p>
      </div>

      <ul className="overflow-hidden rounded-[16px] border border-border bg-background/60 text-sm">
        {registration.requestedScopes.map((scope) => (
          <li
            key={scope}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-b border-border px-4 py-4 last:border-b-0"
          >
            <CheckIcon aria-hidden="true" className="mt-0.5 size-4 text-primary" />
            <span className="min-w-0 leading-5">
              <span className="block">
                {oauthScopeDescriptions[scope] ?? `Request the ${scope} permission`}
              </span>
              <code className="mt-1 block font-mono text-[0.68rem] text-muted-foreground">
                {scope}
              </code>
            </span>
          </li>
        ))}
      </ul>

      <p className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
        You are signed in as{" "}
        <span className="font-medium text-foreground">{session.user.email}</span>. Linking is a
        one-time step: after this, {providerName} can sign this agent in without asking you again.
      </p>

      <AgentClaimForm registrationId={registrationId} />
    </div>
  )
}

function ClaimContentFallback() {
  return (
    <div className="grid gap-5" aria-label="Loading this request">
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-12 rounded-2xl" />
    </div>
  )
}

export default function AgentClaimPage({ params }: ClaimPageProps) {
  return (
    <AccessShell
      marker="Agent linking"
      title="Link this agent?"
      description="An agent signed in elsewhere wants to act on your Skills Board account."
      editorialTitle="One approval, once."
      editorialBody="Your agent provider vouched for who you are. Skills Board still asks you to confirm the link the first time, so a matching email address alone can never hand over your account."
    >
      <Suspense fallback={<ClaimContentFallback />}>
        <ClaimContent params={params} />
      </Suspense>
    </AccessShell>
  )
}
