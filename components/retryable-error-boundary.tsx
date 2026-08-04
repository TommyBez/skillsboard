"use client"

import { catchError, type ErrorInfo } from "next/error"
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

function RetryableErrorFallback(
  { title, description }: { title: string; description: string },
  { error, retry }: ErrorInfo,
) {
  const message = error instanceof Error ? error.message : null

  return (
    <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <AlertTriangleIcon className="size-9 text-primary" aria-hidden="true" />
      <div>
        <h2 className="text-3xl font-semibold tracking-display md:text-4xl">{title}</h2>
        <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
        {message ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">{message}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3 md:justify-end">
        <Button onClick={() => retry()}>
          <RefreshCwIcon data-icon="inline-start" />
          Try again
        </Button>
      </div>
    </section>
  )
}

const BoundRetryableErrorBoundary = catchError(RetryableErrorFallback)

/**
 * Nested error boundary that can retry Server Component trees without
 * interfering with `notFound()` / `redirect()`.
 * See node_modules/next/dist/docs/01-app/03-api-reference/04-functions/catchError.md
 */
export function RetryableErrorBoundary({
  children,
  title = "This section could not load.",
  description = "Something went wrong on our side. Try again — your data is safe.",
}: {
  children: ReactNode
  title?: string
  description?: string
}) {
  return (
    <BoundRetryableErrorBoundary title={title} description={description}>
      {children}
    </BoundRetryableErrorBoundary>
  )
}
