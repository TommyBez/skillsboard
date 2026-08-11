"use client"

import { useActionState, useId } from "react"
import { CheckIcon } from "lucide-react"

import { subscribeEmail, type EmailCaptureState } from "@/app/actions/email-capture"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Input } from "@/components/ui/input"
import {
  EMAIL_CAPTURE_NOTICE_FOOTNOTE,
  EMAIL_CAPTURE_PROMISE,
  type EmailCaptureSource,
} from "@/lib/email/email-capture"
import { cn } from "@/lib/utils"

export type { EmailCaptureSource }

const initialState: EmailCaptureState = { message: "", status: "idle" }

/**
 * The one thing a reader who is not ready to create a library can still do.
 *
 * Mounted on the landing band, at the end of every guide, and in the closing
 * section of the alternative pages. The `source` prop is submitted with the
 * form and becomes the stored column, so a submission can be attributed to the
 * page that earned it. The card emits no analytics of its own: every response
 * this form can receive says success, so only the action can tell a stored
 * address from a duplicate, and it emits `email_capture_submitted` there. The
 * two notice lines come from the shared capture constants rather than from
 * this file, so the consent event the action writes stores the same words the
 * visitor read here. The form carries
 * `ph-no-capture`, the guard the invite form puts on its link block, so the
 * address stays out of autocapture and session recordings.
 */
export function EmailCaptureCard({
  className,
  source,
}: {
  className?: string
  source: EmailCaptureSource
}) {
  const [state, action] = useActionState(subscribeEmail, initialState)
  const idPrefix = useId()
  const emailId = `${idPrefix}-email`
  const headingId = `${idPrefix}-heading`
  const noteId = `${idPrefix}-note`
  const errorId = `${idPrefix}-error`

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "rounded-[3px] border border-border bg-card p-6 text-left md:p-8",
        className,
      )}
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Skills Board updates
      </p>
      <h2
        id={headingId}
        className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl"
      >
        Follow the build
      </h2>
      <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        {EMAIL_CAPTURE_PROMISE}
      </p>

      {state.status === "success" ? (
        <p
          role="status"
          className="mt-6 flex items-center gap-2 text-base font-semibold"
        >
          <CheckIcon className="size-4 text-primary" aria-hidden="true" />
          {state.message}
        </p>
      ) : (
        <form
          action={action}
          className="ph-no-capture mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start"
        >
          <input type="hidden" name="source" value={source} />

          {/* Honeypot. Hidden from people and from assistive technology, so an
              address here is a bot. The action answers it exactly the way it
              answers a real submission. */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor={`${idPrefix}-company`}>Company</label>
            <input
              id={`${idPrefix}-company`}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor={emailId}>
              Email address
            </label>
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              aria-invalid={state.status === "error" || undefined}
              aria-describedby={
                state.status === "error" ? `${errorId} ${noteId}` : noteId
              }
              className="rounded-[3px]"
            />
          </div>

          <FormSubmitButton
            className="h-11 rounded-[3px] px-5"
            pendingLabel="Adding…"
          >
            Get updates
          </FormSubmitButton>
        </form>
      )}

      {state.status === "error" ? (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-sm font-medium text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p id={noteId} className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {EMAIL_CAPTURE_NOTICE_FOOTNOTE}
      </p>
    </section>
  )
}
