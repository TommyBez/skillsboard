import { Suspense } from "react"
import { redirect } from "next/navigation"

import { createOrganization } from "@/app/actions/organizations"
import { AccessShell } from "@/components/access-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { listUserOrganizations } from "@/lib/db/queries"
import { requireSession } from "@/lib/session"

async function OnboardingForm() {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (organizations.length) redirect("/library")

  return (
    <form action={createOrganization} className="flex flex-col gap-7">
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel
            htmlFor="name"
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Organization name
          </FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="Your product team"
            className="h-12 rounded-[16px] border-border bg-background px-4 text-base shadow-none focus-visible:border-primary"
            required
          />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="slug"
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Slug
          </FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="your-product-team"
            pattern="[a-z0-9-]+"
            className="h-12 rounded-[16px] border-border bg-background px-4 font-mono text-sm shadow-none focus-visible:border-primary"
            required
          />
          <FieldDescription className="text-xs">Lowercase letters, numbers, and dashes.</FieldDescription>
        </Field>
      </FieldGroup>
      <div className="border-t border-border pt-6">
        <Button type="submit" size="lg" className="h-12 w-full rounded-[16px] px-6 sm:w-auto">
          Create organization
        </Button>
      </div>
    </form>
  )
}

function OnboardingFormFallback() {
  return (
    <div className="grid gap-5" aria-label="Loading organization setup">
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="mt-2 h-12 w-48 rounded-2xl" />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <AccessShell
      marker="Setup / organization"
      title="Create your team library"
      description="Give product, design, engineering, and their agents one trusted collection of skills."
      editorialTitle="Give the library a place to live."
      editorialBody="Your organization keeps membership, saved skills, and MCP access scoped to the right team."
    >
      <Suspense fallback={<OnboardingFormFallback />}>
        <OnboardingForm />
      </Suspense>
    </AccessShell>
  )
}
