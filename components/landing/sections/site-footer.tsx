import Link from "next/link"

import { Brand } from "@/components/brand"

function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.947 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.844-2.337 4.691-4.566 4.94.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.757 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  )
}

/** Footer — open-source colophon. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <Brand />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
            <Link
              href="/resources"
              className="transition-colors hover:text-foreground"
            >
              Resources
            </Link>
          </nav>
          <a
            href="https://github.com/TommyBez/skillsboard"
            target="_blank"
            rel="noreferrer"
            aria-label="Skills Board on GitHub"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <GitHubMark />
          </a>
        </div>
      </div>
    </footer>
  )
}
