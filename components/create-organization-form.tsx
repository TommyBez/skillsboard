"use client"

import { useActionState } from "react"

import { createOrganization } from "@/app/actions/organizations"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState = { error: "" }

interface CreateOrganizationFormProps {
  creationSurface?: "onboarding" | "in_app"
  idPrefix?: string
  submitLabel?: string
  pendingLabel?: string
}

export function CreateOrganizationForm({
  creationSurface = "onboarding",
  idPrefix = "create-org",
  submitLabel = "Create team library",
  pendingLabel = "Creating library…",
}: CreateOrganizationFormProps) {
  const [state, action] = useActionState(createOrganization, initialState)

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="creationSurface" value={creationSurface} />
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel
            htmlFor={`${idPrefix}-name`}
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Team name
          </FieldLabel>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            placeholder="Your team"
            className="h-12 rounded-[16px] border-border bg-background px-4 text-base shadow-none focus-visible:border-primary"
            required
          />
        </Field>
      </FieldGroup>

      {state.error ? (
        <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="border-t border-border pt-6">
        <FormSubmitButton
          size="lg"
          className="h-12 w-full rounded-[16px] px-6 sm:w-auto"
          pendingLabel={pendingLabel}
        >
          {submitLabel}
        </FormSubmitButton>
      </div>
    </form>
  )
}
