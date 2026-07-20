"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

export function ConsentForm() {
  const router = useRouter()
  const [pendingChoice, setPendingChoice] = useState<"accept" | "deny" | null>(null)
  const [error, setError] = useState("")

  async function decide(accept: boolean) {
    setPendingChoice(accept ? "accept" : "deny")
    setError("")
    try {
      const result = await authClient.oauth2.consent({ accept })
      if (result.data?.url) {
        captureAnalyticsEvent(
          accept ? "mcp_authorization_approved" : "mcp_authorization_denied",
          undefined,
          { send_instantly: true, transport: "sendBeacon" },
        )
        window.location.assign(result.data.url)
        return
      }
      setError(result.error?.message ?? "We couldn’t complete the connection. Try again or return to your MCP client.")
    } catch {
      setError("We couldn’t complete the connection. Try again or return to your MCP client.")
    }
    setPendingChoice(null)
    router.refresh()
  }

  return (
    <div className="border-t border-border pt-6">
      {error ? <p className="mb-4 rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-[16px] px-6"
          disabled={pendingChoice !== null}
          onClick={() => decide(false)}
        >
          {pendingChoice === "deny" ? "Denying…" : "Deny access"}
        </Button>
        <Button
          type="button"
          className="h-12 rounded-[16px] px-6"
          disabled={pendingChoice !== null}
          onClick={() => decide(true)}
        >
          {pendingChoice === "accept" ? "Allowing…" : "Allow read-only access"}
        </Button>
      </div>
    </div>
  )
}
