import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { AccessShell } from "@/components/access-shell"
import { ConsentForm } from "@/components/consent-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"
import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Authorize access",
  robots: { index: false, follow: false },
}

interface ConsentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildOAuthQuery(params: Awaited<ConsentPageProps["searchParams"]>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (value !== undefined) query.append(key, value)
  }
  return query.toString()
}

function InvalidAuthorizationRequest() {
  return (
    <div className="grid gap-5 border-t border-border pt-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">This authorization request is invalid</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Return to your MCP client and start the connection again.
        </p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>Open your library</Button>
    </div>
  )
}

async function ConsentContent({ searchParams }: ConsentPageProps) {
  const params = await searchParams
  const oauthQuery = buildOAuthQuery(params)
  const query = new URLSearchParams(oauthQuery)
  const clientId = query.get("client_id")
  if (!clientId) return <InvalidAuthorizationRequest />

  let client
  try {
    client = await auth.api.getOAuthClientPublicPrelogin({
      headers: await headers(),
      body: { client_id: clientId, oauth_query: oauthQuery },
    })
  } catch (error) {
    console.error("Unable to verify OAuth authorization request", error)
    return <InvalidAuthorizationRequest />
  }

  const session = await getSession()
  if (!session?.user) redirect(`/sign-in?${oauthQuery}`)

  const requestedScopes = query.get("scope")?.split(" ").filter(Boolean) ?? [...oauthScopes]
  const clientName = client.client_name?.trim() || "MCP client"

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
          <p className="mt-1 text-sm font-medium text-foreground">{clientName}</p>
          <code className="mt-1 block max-w-64 truncate font-mono text-[0.68rem] text-muted-foreground">{clientId}</code>
        </div>
      </div>

      <ul className="overflow-hidden rounded-[16px] border border-border bg-background/60 text-sm">
        {requestedScopes.map((scope) => (
          <li
            key={scope}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-b border-border px-4 py-4 last:border-b-0"
          >
            <CheckIcon aria-hidden="true" className="mt-0.5 size-4 text-primary" />
            <span className="min-w-0 leading-5">
              <span className="block">{oauthScopeDescriptions[scope] ?? `Request the ${scope} permission`}</span>
              <code className="mt-1 block font-mono text-[0.68rem] text-muted-foreground">{scope}</code>
            </span>
          </li>
        ))}
      </ul>

      <p className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
        You are signed in as <span className="font-medium text-foreground">{session.user.email}</span>.
      </p>

      <ConsentForm />
    </div>
  )
}

function ConsentContentFallback() {
  return (
    <div className="grid gap-5" aria-label="Loading authorization request">
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-12 rounded-2xl" />
    </div>
  )
}

export default function ConsentPage({ searchParams }: ConsentPageProps) {
  return (
    <AccessShell
      marker="MCP authorization"
      title="Allow read-only access?"
      description="Review the client and permissions before connecting it to Skills Board."
      editorialTitle="Your libraries stay yours."
      editorialBody="This client can find saved skills and retrieve install commands. It cannot add, edit, or delete anything."
    >
      <Suspense fallback={<ConsentContentFallback />}>
        <ConsentContent searchParams={searchParams} />
      </Suspense>
    </AccessShell>
  )
}
