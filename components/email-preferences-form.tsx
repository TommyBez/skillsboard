"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  updateProductCommunicationsPreference,
  type EmailPreferenceActionState,
} from "@/app/actions/email-preferences"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PRODUCT_COMMUNICATIONS_DISCLOSURE } from "@/lib/email/product-communications"

const initialActionState: EmailPreferenceActionState = {
  message: "",
  status: "idle",
  subscribed: null,
}

interface EmailPreferencesFormProps {
  confirmationReason: "email_changed" | "notice_outdated"
  confirmationRequired: boolean
  email: string
  initiallySubscribed: boolean
  permanentlyBlocked: boolean
  providerPaused: boolean
  statusLabel: "Blocked" | "Confirm" | "Off" | "On" | "Pending"
}

export function EmailPreferencesForm({
  confirmationReason,
  confirmationRequired,
  email,
  initiallySubscribed,
  permanentlyBlocked,
  providerPaused,
  statusLabel,
}: EmailPreferencesFormProps) {
  const router = useRouter()
  const [subscribed, setSubscribed] = useState(initiallySubscribed)
  const [state, action] = useActionState(updateProductCommunicationsPreference, initialActionState)

  useEffect(() => {
    setSubscribed(initiallySubscribed)
  }, [initiallySubscribed])

  useEffect(() => {
    if (state.status === "idle") return
    if (state.subscribed !== null) setSubscribed(state.subscribed)

    if (state.status === "success") {
      toast.success(state.message)
      router.refresh()
      return
    }
    toast.error(state.message)
  }, [router, state])

  return (
    <form action={action} className="mt-8 overflow-hidden rounded-[16px] border bg-card">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Product communications
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Product emails</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sent to {email}</p>
          </div>
          <Badge variant={statusLabel === "On" ? "default" : statusLabel === "Blocked" ? "destructive" : "outline"}>
            {statusLabel}
          </Badge>
        </div>

        <label
          htmlFor="product-communications-preference"
          className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-border bg-background/70 p-4 has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
        >
          <Checkbox
            id="product-communications-preference"
            name="subscribed"
            value="true"
            uncheckedValue="false"
            checked={subscribed}
            onCheckedChange={setSubscribed}
            disabled={permanentlyBlocked}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">Receive product emails</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {PRODUCT_COMMUNICATIONS_DISCLOSURE}
            </span>
          </span>
        </label>

        {permanentlyBlocked ? (
          <p className="rounded-[14px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            This address cannot receive product emails because of a permanent delivery block. This cannot be changed
            here. <Link className="font-medium underline underline-offset-4" href="/contact">Contact us</Link> if you
            believe the block is wrong. Account messages may also be unavailable.
          </p>
        ) : null}

        {providerPaused ? (
          <p className="rounded-[14px] border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Your opt-in is recorded, but delivery remains off until the provider subscription is updated and verified.
          </p>
        ) : null}

        {confirmationRequired ? (
          <p className="rounded-[14px] border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Your previous opt-in no longer matches {confirmationReason === "email_changed"
              ? "your current account email"
              : "the current consent notice"}. Review the wording above and save again before product emails can be
            sent.
          </p>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground">
          This setting never affects sign-in codes, team invitations, or other account messages. Read the{" "}
          <Link className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/privacy">
            privacy policy
          </Link>
          .
        </p>
      </div>

      <div className="flex items-center justify-end border-t bg-muted/15 px-5 py-4 sm:px-6">
        <FormSubmitButton
          className="h-11 rounded-[12px] px-5"
          disabled={permanentlyBlocked}
          pendingLabel="Saving…"
        >
          Save preference
        </FormSubmitButton>
      </div>
    </form>
  )
}
