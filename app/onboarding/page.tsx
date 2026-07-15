import { redirect } from "next/navigation"

import { createOrganization } from "@/app/actions/organizations"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { listUserOrganizations } from "@/lib/db/queries"
import { requireSession } from "@/lib/session"

export default async function OnboardingPage() {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (organizations.length) redirect("/library")
  return <main className="flex min-h-svh flex-col bg-muted/30 p-4"><div className="mx-auto flex w-full max-w-6xl py-4"><Brand /></div><div className="flex flex-1 items-center justify-center py-12"><Card className="w-full max-w-lg"><CardHeader><CardTitle className="text-2xl">Create your team library</CardTitle><CardDescription>Give product, design, engineering, and their agents one trusted collection of skills.</CardDescription></CardHeader><CardContent><form action={createOrganization} className="flex flex-col gap-6"><FieldGroup><Field><FieldLabel htmlFor="name">Organization name</FieldLabel><Input id="name" name="name" placeholder="Acme Engineering" required /></Field><Field><FieldLabel htmlFor="slug">Slug</FieldLabel><Input id="slug" name="slug" placeholder="acme-engineering" pattern="[a-z0-9-]+" required /><FieldDescription>Lowercase letters, numbers, and dashes.</FieldDescription></Field></FieldGroup><Button type="submit" size="lg">Create organization</Button></form></CardContent></Card></div></main>
}
