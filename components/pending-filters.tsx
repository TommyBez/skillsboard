"use client"

/**
 * Shared pending-state plumbing for filterable listing pages (Library,
 * Collections, Discover). One transition context per page: the search field
 * and filter pills start URL transitions through it, and the results slot
 * dims while the next server render is in flight — previous results stay on
 * screen instead of flashing to skeletons.
 */

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react"

const FilterPendingContext = createContext<{
  isPending: boolean
  startTransition: TransitionStartFunction
} | null>(null)

export function FilterPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()

  return (
    <FilterPendingContext.Provider value={{ isPending, startTransition }}>
      {children}
    </FilterPendingContext.Provider>
  )
}

export function useFilterPending() {
  const value = useContext(FilterPendingContext)
  if (!value) {
    throw new Error("useFilterPending must be used within FilterPendingProvider")
  }
  return value
}

/**
 * Keep the previous results on screen, dimmed, while a filter navigation
 * transition is in flight. Swapping to skeletons would drop scroll position
 * and flash layout; dimming reads as "updating" without losing context.
 */
export function PendingResultsSlot({ children, className }: { children: ReactNode; className?: string }) {
  const { isPending } = useFilterPending()
  return (
    <div
      className={className ? `pending-results-slot ${className}` : "pending-results-slot"}
      data-pending={isPending || undefined}
      aria-busy={isPending || undefined}
    >
      {children}
    </div>
  )
}
