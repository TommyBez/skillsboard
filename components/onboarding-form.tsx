"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { createOrganization } from "@/app/actions/organizations"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState = { error: "" }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="h-12 w-full rounded-[16px] px-6 sm:w-auto" disabled={pending}>
      {pending ? "Creating library…" : "Create team library"}
    </Button>
  )
}

export function OnboardingForm() {
  const [state, action] = useActionState(createOrganization, initialState)

  return (
    <form action={action} className="flex flex-col gap-7">
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel
            htmlFor="name"
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Team name
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
            Team ID
          </FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="your-product-team"
            pattern="[a-z0-9-]+"
            className="h-12 rounded-[16px] border-border bg-background px-4 font-mono text-sm shadow-none focus-visible:border-primary"
            required
          />
          <FieldDescription className="text-xs">
            Choose a unique ID using lowercase letters, numbers, and dashes.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {state.error ? (
        <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="border-t border-border pt-6">
        <SubmitButton />
      </div>
    </form>
  )
}
