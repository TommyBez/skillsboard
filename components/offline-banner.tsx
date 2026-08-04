"use client"

import { useOffline } from "next/offline"
import { WifiOffIcon } from "lucide-react"

/**
 * Surfaces connectivity loss while experimental.useOffline keeps soft
 * navigations, RSC fetches, and Server Actions pending for automatic retry.
 */
export function OfflineBanner() {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div
      role="status"
      className="border-b border-border bg-muted px-4 py-2 text-center text-sm text-foreground"
    >
      <span className="inline-flex items-center justify-center gap-2">
        <WifiOffIcon className="size-3.5 shrink-0" aria-hidden="true" />
        You’re offline. Pending requests will retry when you reconnect.
      </span>
    </div>
  )
}
