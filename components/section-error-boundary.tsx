"use client"

/**
 * Section-scoped error boundary for the data-backed regions of a page.
 *
 * The route-level `error.tsx` files replace the whole page and can only reset
 * client state, so a transient database or catalog failure inside one streamed
 * section takes the entire view down and leaves a full reload as the only way
 * back. This boundary is built on `catchError` from Next.js 16.3, whose
 * `retry()` re-fetches the failed Server Components in place: the header,
 * navigation, and ⌘K stay mounted and only the failed section re-renders.
 */

import { catchError, type ErrorInfo } from "next/error"
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SectionErrorProps {
  /** What failed to load, e.g. "your team library". */
  label: string
}

function SectionError({ label }: SectionErrorProps, { retry }: ErrorInfo) {
  return (
    <section
      role="alert"
      className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <AlertTriangleIcon className="size-9 text-primary" aria-hidden="true" />
      <div>
        <h2 className="text-3xl font-semibold tracking-display md:text-4xl">
          Could not load {label}.
        </h2>
        <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Something went wrong on our side. Retry — the rest of the page is still here.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 md:justify-end">
        <Button onClick={() => retry()}>
          <RefreshCwIcon data-icon="inline-start" />
          Retry
        </Button>
      </div>
    </section>
  )
}

export const SectionErrorBoundary = catchError(SectionError)
