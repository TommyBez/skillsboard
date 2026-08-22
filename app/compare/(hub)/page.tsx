import Link from "next/link"
import { ArrowUpRightIcon, ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { ResourceCta } from "@/components/resources/resource-chrome"
import { comparisons } from "@/lib/seo/compare"
import { buildCompareIndexMetadata } from "@/lib/seo/compare-metadata"
import { buildCompareIndexSchema } from "@/lib/seo/compare-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

export const metadata = buildCompareIndexMetadata()

export default function ComparePage() {
  return (
    <>
      <JsonLd data={buildCompareIndexSchema()} />

      <div className="mx-auto w-full max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Comparisons</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Comparisons
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
            The AI agent primitives teams keep confusing, compared.
          </h1>
          <p className="mt-6 text-pretty text-[1.05rem] leading-8 text-muted-foreground">
            Coding agents keep shipping new units of configuration, and several
            of them look interchangeable from the outside. These pages set two
            primitives next to each other on the dimensions that decide the
            choice, say plainly when each one is the wrong pick, and link every
            claim to the first-party documentation it came from.
          </p>
        </header>

        <section aria-labelledby="comparisons-heading" className="pt-14">
          <h2 id="comparisons-heading" className="sr-only">
            Comparisons
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {comparisons.map((entry) => (
              <Link
                key={entry.path}
                href={entry.path}
                className="group flex min-h-60 flex-col rounded-[3px] border border-border bg-card p-6 transition-colors hover:border-primary/70 md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {entry.subject}
                  </p>
                  <ArrowUpRightIcon
                    className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-7 max-w-[24ch] text-balance text-2xl font-semibold leading-tight transition-colors group-hover:text-primary">
                  {entry.title}
                </h3>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                  {entry.cardSummary}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="method-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How these pages work
          </p>
          <h2
            id="method-heading"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Sourced, dated, and willing to say it depends
          </h2>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Each comparison starts with a short answer you can quote, then a
            table of the dimensions that differ, then the cases where each side
            wins and the cases where it loses. Every section lists the
            first-party pages behind it, and every page carries the date the
            claims were last checked. Where the documentation is silent, the
            page says so rather than guessing.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link
              href={resourcePaths.index}
              className="inline-flex min-h-11 items-center font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Browse the guides
            </Link>
            <Link
              href={resourcePaths.about}
              className="inline-flex min-h-11 items-center font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              About Skills Board
            </Link>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Read the source on GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="mt-16 border-t border-border py-14 text-center md:py-16">
          <p className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Picking the primitive is the easy half.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            The harder half is agreeing on which files your team actually uses.
            Skills Board keeps that list in one searchable place:
            free forever, MIT licensed, and open source.
          </p>
          <div className="mt-7 flex justify-center">
            <ResourceCta location="compare_index" />
          </div>
        </section>
      </div>
    </>
  )
}
