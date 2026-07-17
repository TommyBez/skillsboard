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
    <div className="grid gap-4 md:grid-cols-2" aria-label="Loading public skills" aria-busy="true">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}

/** Show the skeleton while a catalog navigation transition is in flight. */
export function DiscoverResultsSlot({ children }: { children: ReactNode }) {
  const { isPending } = useDiscoverPending()
  if (isPending) return <DiscoverResultsFallback />
  return children
}
