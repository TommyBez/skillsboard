import { Suspense, type ReactNode } from "react"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { LegalLinks } from "@/components/legal-links"
import { ResourceHeaderActions } from "@/components/resources/resource-header-actions"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

export { ResourceCta } from "@/components/resources/resource-cta"

async function CurrentYear() {
  "use cache"
  return <span className="tabular-nums">{new Date().getFullYear()}</span>
}

export function ResourceHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 md:px-10">
        <Brand compactOnMobile />
        <ResourceHeaderActions />
      </div>
    </header>
  )
}

export function ResourceFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-9 md:flex-row md:items-center md:justify-between md:px-10">
        <Brand />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <nav
            aria-label="Resource footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Link href={resourcePaths.index} className="transition-colors hover:text-foreground">
              Resources
            </Link>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </nav>
          <LegalLinks
            ariaLabel="Legal pages"
            className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">
            ©{" "}
            <Suspense
              fallback={<span className="inline-block w-[4ch]" aria-hidden="true" />}
            >
              <CurrentYear />
            </Suspense>{" "}
            {siteConfig.name}. Free and open source.
          </p>
        </div>
      </div>
    </footer>
  )
}

/** Shared chrome for /resources and /guides/* — lives in the route-group layout. */
export function ResourceShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <ResourceHeader />
      {children}
      <ResourceFooter />
    </div>
  )
}
