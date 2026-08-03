"use client"

import { useActionState, useEffect, useRef } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { MailIcon } from "lucide-react"

import {
  answerExistingUserEmailConsentPrompt,
  type EmailPreferenceActionState,
} from "@/app/actions/email-preferences"
import { Button } from "@/components/ui/button"
import { PRODUCT_COMMUNICATIONS_DISCLOSURE } from "@/lib/email/product-communications"

const initialActionState: EmailPreferenceActionState = {
  message: "",
  status: "idle",
  subscribed: null,
}

function PromptActions() {
  const { pending } = useFormStatus()
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button type="submit" name="subscribed" value="true" disabled={pending}>
        Receive product emails
      </Button>
      <Button type="submit" name="subscribed" value="false" variant="outline" disabled={pending}>
        No thanks
      </Button>
    </div>
  )
}

export function ExistingUserEmailConsentPromptForm() {
  const confirmationRef = useRef<HTMLElement>(null)
  const [state, action] = useActionState(answerExistingUserEmailConsentPrompt, initialActionState)

  useEffect(() => {
    if (state.status === "success") confirmationRef.current?.focus()
  }, [state.status])

  if (state.status === "success") {
    return (
      <aside
        ref={confirmationRef}
        className="border-b border-border bg-primary/5 px-4 py-4 text-center text-sm text-foreground"
        role="status"
        tabIndex={-1}
      >
        {state.subscribed ? "Product email consent saved." : "Your choice not to receive product emails was saved."}
      </aside>
    )
  }

  return (
    <aside className="border-b border-border bg-primary/5" aria-labelledby="existing-user-email-consent-title">
      <form action={action} className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:px-8">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <MailIcon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="existing-user-email-consent-title" className="text-sm font-semibold">
            Choose whether to receive product emails
          </h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            {PRODUCT_COMMUNICATIONS_DISCLOSURE}{" "}
            <Link className="font-medium text-foreground underline underline-offset-4" href="/privacy">
              Privacy details
            </Link>
          </p>
          {state.status === "error" ? (
            <p className="mt-2 text-xs text-destructive" role="alert">{state.message}</p>
          ) : null}
        </div>
        <PromptActions />
      </form>
    </aside>
  )
}
