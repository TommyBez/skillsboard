import Link from "next/link"
import { ArrowUpRightIcon, ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { ResourceCta } from "@/components/resources/resource-chrome"
import { buildAlternativesIndexMetadata } from "@/lib/seo/alternative-metadata"
import { alternatives } from "@/lib/seo/alternatives"
import { buildAlternativesIndexSchema } from "@/lib/seo/alternatives-schema"
import { pricingPath } from "@/lib/seo/pricing-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

export const metadata = buildAlternativesIndexMetadata()

export default function AlternativesPage() {
  return (
    <>
      <JsonLd data={buildAlternativesIndexSchema()} />

      <div className="mx-auto w-full max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Alternatives</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Alternatives
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
            The other ways teams share AI skills, compared honestly.
          </h1>
          <p className="mt-6 text-pretty text-[1.05rem] leading-8 text-muted-foreground">
            Every team already has a way of passing skills around: a shared
            repository, a public directory, a registry, or a message in chat.
            These pages set Skills Board next to each option, say plainly when
            the other one is the better choice, and link every competitor claim
            to a public page you can check yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResourceCta location="hero" />
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Read the source on GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </header>

        <section aria-labelledby="comparisons-heading" className="pt-14">
          <h2 id="comparisons-heading" className="sr-only">
            Comparisons
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {alternatives.map((entry) => (
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

        <section
          aria-labelledby="what-we-compare-heading"
          className="pt-16"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How these pages work
          </p>
          <h2
            id="what-we-compare-heading"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            What Skills Board is, in one paragraph
          </h2>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Skills Board is a web app where a team keeps and shares its AI skills. A teammate saves a skill from its original repository
            and path, adds the tags the team searches by, and everyone else
            finds it later. Each person then picks how to use it: open the
            source, copy an install command, download a ZIP of the latest
            files, or connect a compatible agent to an authenticated MCP
            endpoint. The hosted product is free forever, the code is MIT
            licensed, and a saved skill is the team’s own choice rather than a
            formal review.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link
              href={pricingPath}
              className="inline-flex min-h-11 items-center font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              See pricing
            </Link>
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
          </div>
        </section>

        <section className="mt-16 border-t border-border py-14 text-center md:py-16">
          <p className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Start the library and see which comparison still matters.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Creating a team library takes a minute and costs nothing. Save one
            skill, invite one teammate, and judge it from there.
          </p>
          <div className="mt-7 flex justify-center">
            <ResourceCta location="closing" />
          </div>
        </section>
      </div>
    </>
  )
}
