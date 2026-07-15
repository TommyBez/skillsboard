"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function ConsentForm() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  async function decide(accept: boolean) {
    setIsPending(true)
    const result = await authClient.oauth2.consent({ accept })
    if (result.data?.url) window.location.href = result.data.url
    else { setIsPending(false); router.refresh() }
  }
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-[16px] px-6"
        disabled={isPending}
        onClick={() => decide(false)}
      >
        Deny
      </Button>
      <Button
        type="button"
        className="h-12 rounded-[16px] px-6"
        disabled={isPending}
        onClick={() => decide(true)}
      >
        {isPending ? "Authorizing..." : "Allow access"}
      </Button>
    </div>
  )
}
