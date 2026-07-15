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
  return <div className="flex gap-3"><Button variant="outline" disabled={isPending} onClick={() => decide(false)}>Deny</Button><Button disabled={isPending} onClick={() => decide(true)}>{isPending ? "Authorizing..." : "Allow access"}</Button></div>
}
