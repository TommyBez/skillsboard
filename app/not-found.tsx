import type { Metadata } from "next"
import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="app-canvas flex min-h-[100dvh] flex-col p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1200px] py-2"><Brand /></div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center py-12">
        <section className="ink-panel w-full overflow-hidden rounded-2xl p-6 md:p-10 lg:p-14">
          <CompassIcon className="size-9 text-primary" aria-hidden="true" />
          <p className="mt-10 font-mono text-sm text-primary">404</p>
          <h1 className="mt-3 max-w-[13ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl">
            This page doesn&rsquo;t exist.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_68%,transparent)]">
            The address may have changed, or the link was wrong. Your library and the public catalog are still where you left them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/library" />}>Open your library</Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-[var(--surface-ink-foreground)] hover:border-white/30 hover:bg-white/15 hover:text-[var(--surface-ink-foreground)]"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Back home
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
