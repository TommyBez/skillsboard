"use client"

import { useActionState, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { CheckCircle2Icon } from "lucide-react"

import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
  confirmAgentClaim,
  type ConfirmAgentClaimState,
} from "@/app/agent/claim/actions"

const CODE_LENGTH = 6

const slotClassName =
  "h-14 w-full rounded-[14px] border border-border bg-background text-lg font-medium data-[active=true]:border-primary"

/**
 * The confirmation step of an auth.md first link. The code is typed here, on a
 * page the user reached by signing in — never handed back to the agent.
 */
export function AgentClaimForm({ claimAttemptToken }: { claimAttemptToken: string }) {
  const [code, setCode] = useState("")
  const [state, action, isPending] = useActionState<ConfirmAgentClaimState, FormData>(
    confirmAgentClaim,
    { status: "idle" },
  )

  if (state.status === "done") {
    return (
      <div
        data-testid="agent-claim-complete"
        className="grid gap-3 rounded-[16px] border border-border bg-muted/35 px-4 py-5"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">The agent is authorized.</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You can close this tab. The agent picks this up on its next check, and future sessions
          from the same provider won’t need a code.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="claim_attempt_token" value={claimAttemptToken} />
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel
            htmlFor="user_code"
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Code from the agent
          </FieldLabel>
          <InputOTP
            id="user_code"
            name="user_code"
            maxLength={CODE_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            value={code}
            onChange={setCode}
            disabled={isPending}
            autoFocus
            containerClassName="w-full justify-between gap-1.5 sm:gap-2"
          >
            <InputOTPGroup className="w-full justify-between gap-1.5 sm:gap-2">
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <InputOTPSlot key={index} index={index} className={slotClassName} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription className="text-xs">
            Only enter a code from an agent you started yourself. Anyone whose code you type here
            can act on your behalf in Skills Board.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 rounded-[16px]"
        disabled={isPending || code.length !== CODE_LENGTH}
        aria-busy={isPending || undefined}
      >
        <ButtonPendingContent pending={isPending} pendingLabel="Authorizing…">
          Authorize agent
        </ButtonPendingContent>
      </Button>
    </form>
  )
}
