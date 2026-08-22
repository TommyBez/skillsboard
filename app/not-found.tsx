import type { Metadata } from "next"
import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { recoveryLinks } from "@/lib/agent-recovery"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

/**
 * The 404 every wrong URL on the marketing surface reaches.
 *
 * The status is a real 404 and the body is a way out: the two buttons for a
 * person, and a short index of the four entry points — home, the sitemap,
 * llms.txt, the developer docs — for anyone, or anything, that arrived here by
 * guessing a URL. The same list is what `/api/markdown` returns to a client
 * that asked for Markdown, so both formats of this page give the same advice.
 */
export default function NotFound() {
  return (
    <main className="app-canvas flex min-h-[100dvh] flex-col p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1200px] py-2"><Brand /></div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center py-12">
        <section className="ink-panel w-full overflow-hidden rounded-2xl p-6 md:p-10 lg:p-14">
          <CompassIcon className="size-9 text-primary" aria-hidden="true" />
          <p className="mt-10 font-mono text-sm text-primary">404</p>
          <h1 className="mt-3 max-w-[13ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl">
            This page doesn&rsquo;t exist.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-(--surface-ink-foreground)/68">
            The address may have changed, or the link was wrong. Your library and the public catalog are still where you left them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/library" />}>Open your library</Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-(--surface-ink-foreground) hover:border-white/30 hover:bg-white/15 hover:text-(--surface-ink-foreground)"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Back home
            </Button>
          </div>

          <nav aria-labelledby="not-found-recovery" className="mt-12 border-t border-white/12 pt-8">
            <h2
              id="not-found-recovery"
              className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-(--surface-ink-foreground)/56"
            >
              Where to look next
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 text-(--surface-ink-foreground)/68 sm:grid-cols-2">
              {recoveryLinks.map((link) => (
                <li key={link.href} className="leading-relaxed">
                  <a
                    href={link.href}
                    className="font-medium text-(--surface-ink-foreground) underline decoration-primary/50 underline-offset-4"
                  >
                    {link.label}
                  </a>
                  <span className="block text-sm">{link.description}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-(--surface-ink-foreground)/56">
              Every public page also answers with Markdown: append{" "}
              <code className="font-mono">.md</code> to its path, or send{" "}
              <code className="font-mono">Accept: text/markdown</code>.
            </p>
          </nav>
        </section>
      </div>
    </main>
  )
}
