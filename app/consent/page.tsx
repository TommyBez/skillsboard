import { Suspense } from "react"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { AccessShell } from "@/components/access-shell"
import { ConsentForm } from "@/components/consent-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getSession } from "@/lib/session"

const permissions = [
  "View skills saved by your organizations",
  "Search your library and retrieve install commands",
  "Discover public skills from skills.sh",
]

async function ConsentContent() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
          <ShieldCheckIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Requested permissions
          </p>
          <p className="mt-1 text-sm text-foreground">Read access only</p>
        </div>
      </div>

      <ul className="overflow-hidden rounded-[16px] border border-border bg-background/60 text-sm">
        {permissions.map((permission) => (
          <li
            key={permission}
            className="grid grid-cols-[1.5rem_1fr] gap-3 border-b border-border px-4 py-4 last:border-b-0"
          >
            <CheckIcon aria-hidden="true" className="mt-0.5 size-4 text-primary" />
            <span className="leading-5">{permission}</span>
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

export default function ConsentPage() {
  return (
    <AccessShell
      marker="OAuth / consent"
      title="Authorize MCP access"
      description="An MCP client is requesting access to your Skills Board account."
      editorialTitle="A deliberate bridge to your agents."
      editorialBody="Review what the requesting client can reach before connecting it to your organization libraries."
    >
      <Suspense fallback={<ConsentContentFallback />}>
        <ConsentContent />
      </Suspense>
    </AccessShell>
  )
}
