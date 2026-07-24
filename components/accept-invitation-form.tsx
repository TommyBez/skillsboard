"use client"

import { useActionState } from "react"
import Link from "next/link"

import { acceptInvitation } from "@/app/actions/organizations"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Button } from "@/components/ui/button"

const initialState = { error: "" }

export function AcceptInvitationForm({ invitationId }: { invitationId: string }) {
  const [state, action] = useActionState(acceptInvitation, initialState)

  return (
    <form action={action} className="border-t border-border pt-6">
      <input type="hidden" name="invitationId" value={invitationId} />
      {state.error ? (
        <p className="mb-4 rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" size="lg" className="h-12 rounded-[16px] px-6" nativeButton={false} render={<Link href="/" />}>
          Not now
        </Button>
        <FormSubmitButton size="lg" className="h-12 rounded-[16px] px-6" pendingLabel="Joining library…">
          Join team library
        </FormSubmitButton>
      </div>
    </form>
  )
}
