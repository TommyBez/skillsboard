import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ShieldCheckIcon, TriangleAlertIcon } from "lucide-react"

import { AccessShell } from "@/components/access-shell"
import { AgentClaimForm } from "@/components/agent-claim-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { loadClaimView } from "@/lib/agent-auth/claim-view"
import { agentAuthStore } from "@/lib/agent-auth/store-db"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Authorize an agent",
  robots: { index: false, follow: false },
}

interface AgentClaimPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div data-testid="agent-claim-notice" className="grid gap-5 border-t border-border pt-6">
      <div>
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <TriangleAlertIcon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>
        Open your library
      </Button>
    </div>
  )
}

async function AgentClaimContent({ searchParams }: AgentClaimPageProps) {
  const params = await searchParams
  const claimAttemptToken =
    typeof params.claim_attempt_token === "string" ? params.claim_attempt_token : undefined

  /*
   * The Better Auth session is what identifies the person confirming. With no
   * session this redirects into the ordinary `/sign-in` email-OTP flow and comes
   * back here — the agent never learns how Skills Board authenticates people, and
   * this page never authenticates anyone itself.
   */
  const session = await requireSession(
    claimAttemptToken
      ? `/agent/claim?claim_attempt_token=${encodeURIComponent(claimAttemptToken)}`
      : undefined,
  )

  const view = await loadClaimView({
    store: agentAuthStore,
    claimAttemptToken,
    signedInUser: { id: session.user.id, email: session.user.email },
  })

  if (view.kind === "invalid") {
    return (
      <Notice
        title="This link isn’t valid"
        body="It may have been superseded by a newer authorization, already used, or mistyped. Ask the agent to start a new authorization."
      />
    )
  }
  if (view.kind === "expired") {
    return (
      <Notice
        title="This link has expired"
        body="Authorization links are short-lived. Ask the agent to start a new one and open the fresh link."
      />
    )
  }
  if (view.kind === "already_claimed") {
    return (
      <Notice
        title="Already authorized"
        body="This agent is already linked to your account. You can close this tab."
      />
    )
  }
  if (view.kind === "wrong_account") {
    return (
      <Notice
        title="Wrong account"
        body={`This authorization was started for ${view.expectedEmail}. Sign out and sign back in as that account to continue.`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
          <ShieldCheckIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Requesting access
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{view.providerName}</p>
          <code className="mt-1 block max-w-64 truncate font-mono text-[0.68rem] text-muted-foreground">
            {view.registration.issuer}
          </code>
        </div>
      </div>

      <ul className="overflow-hidden rounded-[16px] border border-border bg-background/60 text-sm">
        {view.registration.requestedScopes.map((scope) => (
          <li key={scope} className="border-b border-border px-4 py-4 last:border-b-0">
            <span className="block leading-5">{scopeDescription(scope)}</span>
            <code className="mt-1 block font-mono text-[0.68rem] text-muted-foreground">{scope}</code>
          </li>
        ))}
      </ul>

      {view.firstProviderLink ? (
        <p className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{view.providerName}</span> has never been
          linked to this account before. Authorizing here lets agents running on{" "}
          {view.providerName} act for you in Skills Board from now on, without asking again.
        </p>
      ) : null}

      <p className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
        You are signed in as <span className="font-medium text-foreground">{session.user.email}</span>.
      </p>

      <AgentClaimForm claimAttemptToken={claimAttemptToken!} />
    </div>
  )
}

function AgentClaimFallback() {
  return (
    <div className="grid gap-5" aria-label="Loading the agent authorization request">
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-12 rounded-2xl" />
    </div>
  )
}

export default function AgentClaimPage({ searchParams }: AgentClaimPageProps) {
  return (
    <AccessShell
      marker="Agent authorization"
      title="Link this agent?"
      description="An agent asked to act for you in Skills Board. Confirm the provider and enter the code it showed you."
      editorialTitle="One account, agents included."
      editorialBody="Linking an agent provider to your account is a one-time step. After this, agents from the same provider get scoped access without another code."
    >
      <Suspense fallback={<AgentClaimFallback />}>
        <AgentClaimContent searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}

function scopeDescription(scope: string): string {
  switch (scope) {
    case "skills:read":
      return "View and search saved skills, collections, public skills, and install commands"
    case "skills:write":
      return "Save new skills and organize collections in your team libraries"
    default:
      return `Request the ${scope} permission`
  }
}
