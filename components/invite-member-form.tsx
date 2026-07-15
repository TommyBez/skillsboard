"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { LinkIcon } from "lucide-react"

import { createInvitationLink } from "@/app/actions/organizations"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState = { error: "", expiresAt: "", invitedEmail: "", inviteUrl: "", role: "" as const }
const expiryFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  timeZoneName: "short",
  year: "numeric",
})

function CreateLinkButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="h-11 rounded-[12px] px-4" disabled={pending}>
      <LinkIcon data-icon="inline-start" />
      {pending ? "Creating link…" : "Create invite link"}
    </Button>
  )
}

export function InviteMemberForm() {
  const [state, action] = useActionState(createInvitationLink, initialState)

  return (
    <div className="mt-6 border-t pt-6">
      <form action={action} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
        <Field>
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 rounded-[12px] bg-background px-3"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="invite-role">Role</FieldLabel>
          <select
            id="invite-role"
            name="role"
            aria-label="Role"
            defaultValue="member"
            className="h-11 w-full rounded-[12px] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        <CreateLinkButton />
      </form>

      {state.error ? (
        <p className="mt-4 rounded-[12px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.inviteUrl ? (
        <div className="mt-4 rounded-[12px] border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold">Invite link ready</p>
          <FieldDescription className="mt-1">
            Send this link to {state.invitedEmail}. It grants {state.role} access and expires {expiryFormatter.format(new Date(state.expiresAt))}.
          </FieldDescription>
          <div className="mt-3 flex min-w-0 items-center gap-2 rounded-[10px] border bg-background p-1.5 pl-3">
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{state.inviteUrl}</code>
            <CopyButton value={state.inviteUrl} label="Copy invite link" ariaLabel="Copy invite link" copiedAriaLabel="Invite link copied" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
