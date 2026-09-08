import { Skeleton } from "@/components/ui/skeleton"

/**
 * The builder's shape while its content is on the way.
 *
 * Shown twice: as the Suspense fallback while the page resolves `?from=`, and
 * by the builder itself while a skill is being read from GitHub. In both
 * cases the alternative was the example skill flashing in for a moment and
 * then being replaced, which read as the wrong file loading. The layout
 * matches the builder card for card, so nothing moves when the fields arrive.
 */
export function SkillMdBuilderSkeleton({ statusRow }: { statusRow?: React.ReactNode }) {
  return (
    <div
      className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      aria-busy="true"
    >
      {statusRow ? <div className="lg:col-span-2">{statusRow}</div> : null}
      <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-20 rounded-[3px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-[3px]" />
            <Skeleton className="h-8 w-16 rounded-[3px]" />
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div>
            <Skeleton className="h-3.5 w-12 rounded-[3px]" />
            <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-20 rounded-[3px]" />
            <Skeleton className="mt-2 h-24 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-20 rounded-[3px]" />
            <Skeleton className="mt-2 h-64 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-14 rounded-[3px]" />
            <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-24 rounded-[3px]" />
            <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-24 rounded-[3px]" />
            <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-16 rounded-[3px]" />
            <Skeleton className="h-8 w-28 rounded-[3px]" />
          </div>
          <Skeleton className="mt-4 h-[26rem] w-full rounded-[3px]" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-40 rounded-[3px]" />
            <Skeleton className="h-8 w-44 rounded-[3px]" />
          </div>
        </div>
        <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
          <Skeleton className="h-3 w-16 rounded-[3px]" />
          <Skeleton className="mt-4 h-5 w-3/4 rounded-[3px]" />
        </div>
      </div>
    </div>
  )
}
