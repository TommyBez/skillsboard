"use client"

import { useActionState } from "react"
import { ChevronDownIcon, MailIcon } from "lucide-react"

import { createInvitationLink } from "@/app/actions/organizations"
import { FormSubmitButton } from "@/components/form-submit-button"
import { CopyButton } from "@/components/copy-button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ClientAnalyticsEvent } from "@/lib/analytics-client"
import { cn } from "@/lib/utils"

const initialState = { emailError: "", error: "", expiresAt: "", invitedEmail: "", inviteUrl: "", role: "" as const }
const expiryFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  timeZoneName: "short",
  year: "numeric",
})

interface InviteMemberFormProps {
  /** Wrapper classes. The settings panel keeps its rule and top margin; the
      first-skill step sits flush inside a dialog. */
  className?: string
  /** Distinct field ids so two copies of the form can never collide. */
  idPrefix?: string
  /** "row" is the settings panel; "stack" fits the narrow dialog column. */
  layout?: "row" | "stack"
  /** Fired when the invite link is copied, so the share path is measurable
      next to the emailed invitation. */
  linkCopyAnalytics?: ClientAnalyticsEvent
  /** Fired when the user submits the form, before the invitation exists. */
  onSubmitIntent?: () => void
}

export function InviteMemberForm({
  className,
  idPrefix = "invite",
  layout = "row",
  linkCopyAnalytics,
  onSubmitIntent,
}: InviteMemberFormProps = {}) {
  const [state, action] = useActionState(createInvitationLink, initialState)
  const emailFieldId = `${idPrefix}-email`
  const roleFieldId = `${idPrefix}-role`

  return (
    <div className={cn(className ?? "mt-6 border-t pt-6")}>
      <form
        action={action}
        onSubmit={onSubmitIntent}
        className={cn(
          "grid grid-cols-1 gap-4",
          layout === "row" && "md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end",
        )}
      >
        <Field>
          <FieldLabel htmlFor={emailFieldId}>Email</FieldLabel>
          <Input
            id={emailFieldId}
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 rounded-[12px] bg-background px-3"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={roleFieldId}>Role</FieldLabel>
          <div className="relative">
            <select
              id={roleFieldId}
              name="role"
              aria-label="Role"
              defaultValue="member"
              className="h-11 w-full appearance-none rounded-[12px] border border-input bg-background pl-3 pr-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </Field>

        <FormSubmitButton
          className={cn("h-11 rounded-[12px] px-4", layout === "stack" && "w-full")}
          pendingLabel="Sending invitation…"
        >
          <MailIcon data-icon="inline-start" />
          Send invitation
        </FormSubmitButton>
      </form>

      {state.error ? (
        <p className="mt-4 rounded-[12px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.emailError ? (
        <p className="mt-4 rounded-[12px] border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:text-amber-200" role="status">
          {state.emailError}
        </p>
      ) : null}

      {state.inviteUrl ? (
        <div className="ph-no-capture mt-4 rounded-[12px] border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold">
            {state.emailError ? "Invite link ready" : `Invitation sent to ${state.invitedEmail}`}
          </p>
          <FieldDescription className="mt-1">
            {state.emailError
              ? `This link grants ${state.role} access and expires ${expiryFormatter.format(new Date(state.expiresAt))}.`
              : `We emailed ${state.invitedEmail} with a link to join as ${state.role}. It expires ${expiryFormatter.format(new Date(state.expiresAt))}. Copy the link below to paste it in Slack or a chat.`}
          </FieldDescription>
          <div className="mt-3 flex min-w-0 items-center gap-2 rounded-[10px] border bg-background p-1.5 pl-3">
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{state.inviteUrl}</code>
            <CopyButton
              analytics={linkCopyAnalytics}
              value={state.inviteUrl}
              label="Copy invite link"
              ariaLabel="Copy invite link"
              copiedAriaLabel="Invite link copied"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
