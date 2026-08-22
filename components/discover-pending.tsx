"use client"

/**
 * Discover-specific pieces on top of the shared pending-filter plumbing in
 * components/pending-filters.tsx (which Library and Collections use too).
 */

import { Skeleton } from "@/components/ui/skeleton"

export {
  FilterPendingProvider as DiscoverPendingProvider,
  PendingResultsSlot as DiscoverResultsSlot,
  useFilterPending as useDiscoverPending,
} from "@/components/pending-filters"

export function DiscoverResultsFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading public skills" aria-busy="true">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="hidden h-72 rounded-2xl xl:block" />
      <Skeleton className="hidden h-72 rounded-2xl xl:block" />
    </div>
  )
}
