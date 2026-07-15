import Link from "next/link"
import { ArrowLeftIcon, MailIcon } from "lucide-react"
import { eq } from "drizzle-orm"

import { inviteMember } from "@/app/actions/organizations"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAppContext } from "@/lib/app-context"
import { db } from "@/lib/db"
import { member, user } from "@/lib/db/schema"

export default async function OrganizationSettingsPage() {
  const { organizations, activeId } = await getAppContext()
  const activeOrganization =
    organizations.find((organization) => organization.id === activeId) ??
    organizations[0]
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

  return (
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
        <Button
          variant="ghost"
          className="-ml-2 w-fit"
          nativeButton={false}
          render={<Link href="/library" />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to library
        </Button>

        <header className="mt-8 grid gap-8 border-b pb-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Organization access
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Team settings
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Manage access to your shared skill library.
            </p>
          </div>

          <aside className="overflow-hidden rounded-[16px] border bg-card">
            <div className="px-5 py-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Active organization
              </p>
              <p className="mt-1 truncate text-base font-semibold">
                {activeOrganization.name}
              </p>
            </div>
            <div className="border-t px-5 py-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Members
              </p>
              <p className="mt-1 text-base font-semibold tabular-nums">
                {members.length}
              </p>
            </div>
          </aside>
        </header>

        <section className="mt-8 rounded-[16px] border bg-card p-5 sm:p-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Invitation
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Invite a teammate
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              They will receive an invitation to join this organization.
            </p>
          </div>

          <form
            action={inviteMember}
            className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end"
          >
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-11 rounded-[12px] bg-background px-3"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select name="role" defaultValue="member">
                <SelectTrigger
                  id="role"
                  className="h-11 w-full rounded-[12px] bg-background px-3"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Button type="submit" className="h-11 rounded-[12px] px-4">
              <MailIcon data-icon="inline-start" />
              Send invite
            </Button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-[16px] border bg-card">
          <div className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Directory
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Members
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {members.length} {members.length === 1 ? "person has" : "people have"} access.
            </p>
          </div>

          <div className="border-t">
            {members.map((person) => (
              <div
                key={person.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-4 last:border-b-0 sm:gap-4 sm:px-6"
              >
                <Avatar className="size-10 rounded-[12px]">
                  <AvatarFallback className="rounded-[12px] bg-accent font-mono text-xs font-semibold text-accent-foreground">
                    {person.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{person.name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {person.email}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-[8px] capitalize"
                >
                  {person.role}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </main>
  )
}
