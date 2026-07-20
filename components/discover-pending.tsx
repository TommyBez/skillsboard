"use client"

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react"

import { Skeleton } from "@/components/ui/skeleton"

const DiscoverPendingContext = createContext<{
  isPending: boolean
  startTransition: TransitionStartFunction
} | null>(null)

export function DiscoverPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()

  return (
    <DiscoverPendingContext.Provider value={{ isPending, startTransition }}>
      {children}
    </DiscoverPendingContext.Provider>
  )
}

export function useDiscoverPending() {
  const value = useContext(DiscoverPendingContext)
  if (!value) {
    throw new Error("useDiscoverPending must be used within DiscoverPendingProvider")
  }
  return value
}

export function DiscoverResultsFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading public skills" aria-busy="true">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="hidden h-72 rounded-2xl xl:block" />
      <Skeleton className="hidden h-72 rounded-2xl xl:block" />
    </div>
  )
}

/**
 * Keep the previous results on screen, dimmed, while a catalog navigation
 * transition is in flight. Swapping to skeletons would drop scroll position
 * and flash layout; dimming reads as "updating" without losing context.
 */
export function DiscoverResultsSlot({ children }: { children: ReactNode }) {
  const { isPending } = useDiscoverPending()
  return (
    <div
      className="discover-results-slot"
      data-pending={isPending || undefined}
      aria-busy={isPending || undefined}
    >
      {children}
    </div>
  )
}
