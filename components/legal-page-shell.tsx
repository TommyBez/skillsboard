import type { ReactNode } from "react"
import Link from "next/link"

import { Brand } from "@/components/brand"
import { LegalLinks } from "@/components/legal-links"
import { ThemeToggle } from "@/components/theme-toggle"
import { siteConfig } from "@/lib/site"

interface LegalPageShellProps {
  children: ReactNode
  description: string
  eyebrow: string
  title: string
}

export function LegalPageShell({
  children,
  description,
  eyebrow,
  title,
}: LegalPageShellProps) {
  return (
    <div className="app-canvas min-h-svh bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-10">
          <Brand />
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-10 md:py-20">
        <article className="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
          <header className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </header>

          <div className="space-y-10 text-[0.95rem] leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-foreground [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-5 py-10 md:grid-cols-[auto_1fr] md:px-10">
          <Brand />
          <div className="space-y-3 md:justify-self-end md:text-right">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:justify-end">
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-foreground"
              >
                About
              </Link>
              <LegalLinks ariaLabel="Legal pages" />
            </div>
            <p className="text-sm text-muted-foreground">
              <a
                className="inline-flex min-h-11 items-center hover:text-foreground"
                href={`mailto:${siteConfig.contactEmail}`}
              >
                {siteConfig.contactEmail}
              </a>
            </p>
            <address className="max-w-2xl text-sm not-italic text-muted-foreground">
              {siteConfig.postalAddress}
            </address>
          </div>
        </div>
      </footer>
    </div>
  )
}
