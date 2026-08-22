"use client"

/**
 * Error boundary for the signed-in app. It renders inside the app layout, so
 * the header, navigation, and ⌘K stay usable — a failed page should not
 * dump a signed-in user onto the marketing shell.
 */

import Link from "next/link"
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section className="grid min-h-64 grid-cols-1 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <AlertTriangleIcon className="size-9 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-3xl font-semibold tracking-display md:text-4xl">This page could not load.</h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Something went wrong on our side. Try again — your library is safe.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button onClick={reset}><RefreshCwIcon data-icon="inline-start" />Try again</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>Back to library</Button>
        </div>
      </section>
    </main>
  )
}
