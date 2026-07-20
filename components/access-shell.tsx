import type { ReactNode } from "react"

import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"

interface AccessShellProps {
  marker: string
  title: string
  description: string
  editorialTitle: string
  editorialBody: string
  children: ReactNode
}

export function AccessShell({
  marker,
  title,
  description,
  editorialTitle,
  editorialBody,
  children,
}: AccessShellProps) {
  return (
    <main className="app-canvas relative min-h-svh overflow-hidden p-2 text-foreground sm:p-4 lg:p-6">
      <div className="surface-shadow relative mx-auto grid min-h-[calc(100svh-1rem)] max-w-[1440px] overflow-hidden rounded-[16px] border border-border bg-card sm:min-h-[calc(100svh-2rem)] lg:min-h-[calc(100svh-3rem)] lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.82fr)]">
        <aside className="ink-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:p-10 xl:p-14">
          <div className="relative flex items-center justify-between gap-6">
            <Brand />
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-(--surface-ink-foreground) opacity-50">
                Shared skill library
              </span>
              <ThemeToggle className="border-white/15 bg-white/5 text-(--surface-ink-foreground) hover:bg-white/10 hover:text-(--surface-ink-foreground)" />
            </div>
          </div>

          <div className="relative my-auto max-w-2xl py-16">
            <p className="max-w-[13ch] text-balance text-[clamp(3.25rem,5vw,5.8rem)] font-semibold leading-[0.92] tracking-display">
              {editorialTitle}
            </p>
            <p className="mt-8 max-w-lg text-pretty text-base leading-7 text-(--surface-ink-foreground) opacity-60 xl:text-lg">
              {editorialBody}
            </p>
          </div>

          <div className="relative border-t border-white/15 pt-5">
            <p className="max-w-lg text-sm leading-6 text-(--surface-ink-foreground) opacity-55">
              Team recommendations, ready for different agent setups.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 lg:hidden">
            <Brand />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {marker}
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 items-center px-5 py-8 sm:px-9 sm:py-10 lg:px-14 xl:px-20">
            <div className="mx-auto w-full max-w-[520px]">
              <div className="mb-7">
                <h1 className="text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-md text-pretty text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              </div>

              {children}
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground sm:px-9 lg:px-14 xl:px-20">
            <span>Skills Board</span>
            <span>Hosted for free. Open source.</span>
          </footer>
        </section>
      </div>
    </main>
  )
}
