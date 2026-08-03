/**
 * Not-found boundary for the signed-in app: a missing collection or skill
 * keeps the app chrome and offers a way back, instead of falling through to
 * the marketing 404.
 */

import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AppNotFound() {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <CompassIcon className="size-9 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-3xl font-semibold tracking-display md:text-4xl">There’s nothing here.</h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
            This page doesn’t exist, or it was removed. It may have been deleted by a teammate.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button nativeButton={false} render={<Link href="/library" />}>Back to library</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/collections" />}>Collections</Button>
        </div>
      </section>
    </main>
  )
}
