"use client"

import Link from "next/link"
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="app-canvas flex min-h-[100dvh] flex-col p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1200px] py-2"><Brand /></div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center py-12">
        <section className="ink-panel w-full overflow-hidden rounded-2xl p-6 md:p-10 lg:p-14">
          <AlertTriangleIcon className="size-9 text-primary" aria-hidden="true" />
          <h1 className="mt-10 max-w-[13ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">This page could not load.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_68%,transparent)]">
            Try again. If this page still doesn’t load, go back home.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={reset}><RefreshCwIcon data-icon="inline-start" />Try again</Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/" />}>Back home</Button>
          </div>
        </section>
      </div>
    </main>
  )
}
