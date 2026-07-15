import Link from "next/link"
import { ArrowLeftIcon, MailIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { inviteMember } from "@/app/actions/organizations"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import { member, user } from "@/lib/db/schema"
import { listUserOrganizations } from "@/lib/db/queries"
import { eq } from "drizzle-orm"
import { requireSession } from "@/lib/session"

export default async function OrganizationSettingsPage() {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (!organizations.length) redirect("/onboarding")
  const activeId = session.session.activeOrganizationId ?? organizations[0].id
  const members = await db.select({ id: user.id, name: user.name, email: user.email, role: member.role }).from(member).innerJoin(user, eq(member.userId, user.id)).where(eq(member.organizationId, activeId))
  return <div className="min-h-svh bg-muted/20"><AppHeader user={session.user} organizations={organizations} activeId={activeId} /><main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6"><Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href="/library" />}><ArrowLeftIcon data-icon="inline-start" />Back to library</Button><div><h1 className="text-3xl font-semibold tracking-tight">Team settings</h1><p className="mt-2 text-muted-foreground">Manage access to your shared skill library.</p></div><Card><CardHeader><CardTitle>Invite a teammate</CardTitle><CardDescription>They will receive an invitation to join this organization.</CardDescription></CardHeader><CardContent><form action={inviteMember} className="flex flex-col gap-4 md:flex-row md:items-end"><FieldGroup className="flex-1 md:flex-row"><Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" required /></Field><Field><FieldLabel htmlFor="role">Role</FieldLabel><Select name="role" defaultValue="member"><SelectTrigger id="role"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="member">Member</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectGroup></SelectContent></Select></Field></FieldGroup><Button type="submit"><MailIcon data-icon="inline-start" />Send invite</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Members</CardTitle><CardDescription>{members.length} people have access.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{members.map((person) => <div key={person.id} className="flex items-center gap-3 rounded-lg border p-3"><Avatar><AvatarFallback>{person.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate font-medium">{person.name}</p><p className="truncate text-sm text-muted-foreground">{person.email}</p></div><Badge variant="secondary">{person.role}</Badge></div>)}</CardContent></Card></main></div>
}
