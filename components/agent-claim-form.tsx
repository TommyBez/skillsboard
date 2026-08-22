"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { decideAgentClaim } from "@/app/actions/agent-claim"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"

const MESSAGES: Record<string, string> = {
  unavailable: "This request expired or was already answered. Ask the agent to try again.",
  wrong_account:
    "This request is for a different Skills Board account. Sign out, sign in as that account, and open the link again.",
}

export function AgentClaimForm({ registrationId }: { registrationId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<"approve" | "deny" | null>(null)
  const [outcome, setOutcome] = useState<"approved" | "denied" | null>(null)
  const [error, setError] = useState("")

  async function decide(decision: "approve" | "deny") {
    setPending(decision)
    setError("")
    try {
      const result = await decideAgentClaim(registrationId, decision)
      if (result.status === "approved" || result.status === "denied") {
        setOutcome(result.status)
        router.refresh()
        return
      }
      setError(MESSAGES[result.status] ?? "We couldn’t complete this request.")
    } catch {
      setError("We couldn’t complete this request. Try again.")
    }
    setPending(null)
  }

  if (outcome === "approved") {
    return (
      <p
        className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground"
        role="status"
      >
        Linked. Return to your agent — it can pick up from here, and it will not ask again.
      </p>
    )
  }

  if (outcome === "denied") {
    return (
      <p
        className="rounded-[16px] border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground"
        role="status"
      >
        Declined. This agent was not linked to your account.
      </p>
    )
  }

  return (
    <div className="border-t border-border pt-6">
      {error ? (
        <p
          className="mb-4 rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-[16px] px-6"
          disabled={pending !== null}
          aria-busy={pending === "deny" || undefined}
          onClick={() => decide("deny")}
        >
          <ButtonPendingContent pending={pending === "deny"} pendingLabel="Declining…">
            Not me
          </ButtonPendingContent>
        </Button>
        <Button
          type="button"
          className="h-12 rounded-[16px] px-6"
          disabled={pending !== null}
          aria-busy={pending === "approve" || undefined}
          onClick={() => decide("approve")}
        >
          <ButtonPendingContent pending={pending === "approve"} pendingLabel="Linking…">
            Link this agent
          </ButtonPendingContent>
        </Button>
      </div>
    </div>
  )
}
