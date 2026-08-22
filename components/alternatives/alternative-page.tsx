import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { EmailCaptureCard } from "@/components/email-capture-card"
import { JsonLd } from "@/components/json-ld"
import { ResourceCta } from "@/components/resources/resource-chrome"
import {
  alternativesIndexPath,
  type AlternativeDefinition,
  type AlternativeSection,
  type AlternativeSource,
} from "@/lib/seo/alternatives"
import { buildAlternativeSchema } from "@/lib/seo/alternatives-schema"
import { siteConfig } from "@/lib/site"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function RowCitations({
  sourceIds,
  sources,
}: {
  sourceIds?: readonly string[]
  sources: readonly AlternativeSource[]
}) {
  const cited = (sourceIds ?? []).flatMap((sourceId) => {
    const source = sources.find((candidate) => candidate.id === sourceId)
    return source ? [source] : []
  })

  if (cited.length === 0) {
    return null
  }

  return (
    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {cited.map((source) => (
        <a
          key={source.id}
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          {source.label}
        </a>
      ))}
    </span>
  )
}

function PointList({
  section,
  eyebrow,
  id,
}: {
  section: AlternativeSection
  eyebrow: string
  id: string
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="pt-16">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
      >
        {section.title}
      </h2>
      <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
        {section.intro}
      </p>
      <ul className="mt-7 ml-5 list-disc space-y-3 text-[0.95rem] leading-7 text-muted-foreground">
        {section.points.map((point) => (
          <li key={point} className="pl-1">
            {point}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AlternativePage({ entry }: { entry: AlternativeDefinition }) {
  return (
    <>
      <JsonLd data={buildAlternativeSchema(entry)} />

      <div className="mx-auto w-full max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={alternativesIndexPath}
            className="transition-colors hover:text-foreground"
          >
            Alternatives
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{entry.subject}</span>
        </nav>

        <header className="mt-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {entry.eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
            {entry.title}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-[1.05rem] leading-8 text-muted-foreground">
            {entry.summary.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResourceCta location={`${entry.ctaLocation}_header`} />
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
          <p className="mt-6 text-sm text-muted-foreground">
            Comparison last checked {formatDate(entry.modifiedAt)}. Every claim
            about{" "}
            <a
              href={entry.subjectHref}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary"
            >
              {entry.subject}
            </a>{" "}
            links to a public page you can check yourself.
          </p>
        </header>

        <PointList section={entry.reasons} eyebrow="01 / Context" id="context" />

        <section aria-labelledby="comparison-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            02 / Comparison
          </p>
          <h2
            id="comparison-heading"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {entry.comparison.title}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {entry.comparison.caption}
          </p>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="comparison-heading"
            className="mt-8 overflow-x-auto rounded-[3px] border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">{entry.comparison.caption}</caption>
              <thead>
                <tr className="border-b border-border bg-muted/55">
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Dimension
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {siteConfig.name}
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {entry.subject}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entry.comparison.rows.map((row) => (
                  <tr
                    key={row.dimension}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="w-[20%] px-5 py-5 align-top text-sm font-semibold"
                    >
                      {row.dimension}
                    </th>
                    <td className="px-5 py-5 align-top text-sm leading-relaxed text-muted-foreground">
                      {row.skillsBoard}
                    </td>
                    <td className="px-5 py-5 align-top text-sm leading-relaxed text-muted-foreground">
                      {row.alternative}
                      <RowCitations
                        sourceIds={row.sourceIds}
                        sources={entry.sources}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <PointList
          section={entry.alternativeWins}
          eyebrow="03 / Pick the other one"
          id="alternative-wins"
        />

        <PointList
          section={entry.skillsBoardWins}
          eyebrow="04 / Pick the library"
          id="skills-board-wins"
        />

        <section aria-labelledby="move-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            05 / How to run it
          </p>
          <h2
            id="move-heading"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {entry.moveOver.title}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {entry.moveOver.intro}
          </p>
          <ol className="mt-7 space-y-5">
            {entry.moveOver.steps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[3px] border border-border font-mono text-xs font-semibold tabular-nums text-primary"
                >
                  {index + 1}
                </span>
                <span className="text-[0.95rem] leading-7 text-muted-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            06 / Questions
          </p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-7 max-w-3xl space-y-8">
            {entry.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-foreground">
                  {item.question}
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sources-heading" className="pt-16">
          <h2
            id="sources-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            Sources
          </h2>
          <ul className="mt-5 space-y-4">
            {entry.sources.map((source) => (
              <li key={source.id} className="text-sm leading-6">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                >
                  {source.label}
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                </a>
                <p className="text-muted-foreground">{source.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="related-heading" className="pt-16">
          <h2
            id="related-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            Keep reading
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {entry.related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col rounded-[3px] border border-border bg-card p-5 transition-colors hover:border-primary/70"
              >
                <span className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                  {link.label}
                </span>
                <span className="mt-2 text-sm leading-6 text-muted-foreground">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-border py-14 text-center md:py-16">
          <p className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Put your team's skills somewhere everyone can find them.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the first skill, and invite the people who keep asking.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location={`${entry.ctaLocation}_closing`} />
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              View the code on GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </div>

          <EmailCaptureCard className="mx-auto mt-12 max-w-2xl" source={entry.ctaLocation} />
        </section>
      </div>
    </>
  )
}
