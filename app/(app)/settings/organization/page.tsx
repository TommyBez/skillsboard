import { cache, Suspense } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { eq } from "drizzle-orm"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InviteMemberForm } from "@/components/invite-member-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"
import { db } from "@/lib/db"
import { member, user } from "@/lib/db/schema"

const getOrganizationDetails = cache(async () => {
  const { organizations, activeId } = await getAppContext()
  const activeOrganization = organizations.find((organization) => organization.id === activeId) ?? organizations[0]
  const members = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, activeId))

  return { activeOrganization, members }
})

async function OrganizationSummary() {
  const { activeOrganization, members } = await getOrganizationDetails()

  return (
    <aside className="overflow-hidden rounded-[16px] border bg-card">
      <div className="px-5 py-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active library</p>
        <p className="mt-1 truncate text-base font-semibold">{activeOrganization.name}</p>
      </div>
      <div className="border-t px-5 py-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Members</p>
        <p className="mt-1 text-base font-semibold tabular-nums">{members.length}</p>
      </div>
    </aside>
  )
}

async function MemberDirectory() {
  const { members } = await getOrganizationDetails()

  return (
    <section className="mt-6 overflow-hidden rounded-[16px] border bg-card">
      <div className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Access</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Library members</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {members.length} {members.length === 1 ? "person has" : "people have"} access.
        </p>
      </div>

      <div className="border-t">
        {members.map((person) => {
          const initials = person.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
          return (
            <div key={person.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-4 last:border-b-0 sm:gap-4 sm:px-6">
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-accent font-mono text-xs font-semibold text-accent-foreground" aria-hidden="true">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{person.name}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{person.email}</p>
              </div>
              <Badge variant="secondary" className="rounded-[8px] capitalize">{person.role}</Badge>
            </div>
          )
        })}
      </div>
    </section>
  )
}

async function InvitationPanel() {
  const { activeOrganization } = await getOrganizationDetails()
  const canInvite = activeOrganization.role === "owner" || activeOrganization.role === "admin"

  return (
    <section className="mt-8 rounded-[16px] border bg-card p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Invitation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Invite a teammate</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enter a teammate&apos;s email and we&apos;ll send an invitation. You can also copy the invite link as a backup.
        </p>
      </div>
      {canInvite ? (
        <InviteMemberForm />
      ) : (
        <p className="mt-6 border-t pt-5 text-sm text-muted-foreground">Only team owners and admins can send invitations.</p>
      )}
    </section>
  )
}

function MemberDirectoryFallback() {
  return <Skeleton className="mt-8 h-72 rounded-[16px]" aria-label="Loading library members" />
}

export default function OrganizationSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
      <Button variant="ghost" className="-ml-2 w-fit" nativeButton={false} render={<Link href="/library" />}>
        <ArrowLeftIcon data-icon="inline-start" />
        Back to library
      </Button>

      <header className="mt-8 grid gap-8 border-b pb-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Members</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">Team access</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            See who can use this shared skill library.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-32 rounded-[16px]" />}>
          <OrganizationSummary />
        </Suspense>
      </header>

      <Suspense fallback={<Skeleton className="mt-8 h-72 rounded-[16px]" aria-label="Loading invitation controls" />}>
        <InvitationPanel />
      </Suspense>

      <Suspense fallback={<MemberDirectoryFallback />}>
        <MemberDirectory />
      </Suspense>
    </main>
  )
}
