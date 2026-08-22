import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import {
  CodeBlock,
  formatArticleDate,
  NoteList,
  SectionHeading,
  SectionSources,
  SectionTable,
} from "@/components/resources/article-parts"
import { ResourceCta } from "@/components/resources/resource-chrome"
import { compareIndexPath } from "@/lib/seo/compare"
import type {
  ComparisonDefinition,
  ComparisonInlineLink,
  ComparisonPrimitiveCase,
  ComparisonTeamSection,
} from "@/lib/seo/compare/types"
import { buildComparisonSchema } from "@/lib/seo/compare-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: ComparisonInlineLink }) {
  return (
    <p className="mt-7 max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
      {link.lead}{" "}
      <Link
        href={link.href}
        className="font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
      >
        {link.label}
      </Link>
      {link.trail}
    </p>
  )
}

/**
 * One half of the verdict. Both primitives render through the same component
 * so neither section can quietly grow a stronger case than the other: the
 * cases and the counterweight are always both present.
 */
function PrimitiveCase({
  eyebrow,
  id,
  section,
  sources,
}: {
  eyebrow: string
  id: string
  section: ComparisonPrimitiveCase
  sources: ComparisonDefinition["sources"]
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="pt-16">
      <SectionHeading
        eyebrow={eyebrow}
        id={id}
        title={section.title}
        intro={section.intro}
      />
      <ol className="mt-9 border-t border-border">
        {section.cases.map((item, index) => (
          <li
            key={item.title}
            className="grid grid-cols-1 gap-3 border-b border-border py-7 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-5"
          >
            <span className="font-mono text-sm font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-[3px] border border-border bg-muted/40 p-5 md:p-6">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {section.counterweightTitle}
        </h3>
        <ul className="mt-4 ml-5 list-disc space-y-3 text-[0.95rem] leading-7 text-muted-foreground">
          {section.counterweight.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <SectionSources sourceIds={section.sourceIds} sources={sources} />
    </section>
  )
}

/**
 * The team section is optional: some pairs end on a primitive, and some end on
 * a route a team walks. When a definition supplies it, it renders between the
 * "together" section and the FAQ, and the section numbering shifts by one.
 */
function TeamPaths({
  eyebrow,
  section,
  sources,
}: {
  eyebrow: string
  section: ComparisonTeamSection
  sources: ComparisonDefinition["sources"]
}) {
  return (
    <section aria-labelledby="team-heading" className="pt-16">
      <SectionHeading
        eyebrow={eyebrow}
        id="team"
        title={section.title}
        intro={section.intro}
      />
      <ol className="mt-9 border-t border-border">
        {section.paths.map((item, index) => (
          <li
            key={item.title}
            className="grid grid-cols-1 gap-3 border-b border-border py-7 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-5"
          >
            <span className="font-mono text-sm font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <NoteList notes={section.notes} />
      <SectionSources sourceIds={section.sourceIds} sources={sources} />
    </section>
  )
}

export function ComparisonPage({ entry }: { entry: ComparisonDefinition }) {
  const team = entry.team
  const number = (position: number) => String(position).padStart(2, "0")

  return (
    <>
      <JsonLd data={buildComparisonSchema(entry)} />

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
            href={compareIndexPath}
            className="transition-colors hover:text-foreground"
          >
            Comparisons
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
            {entry.intro.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResourceCta location={`${entry.ctaLocation}_hero`} />
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
          <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Publisher</dt>
              <dd>
                <Link
                  href="/"
                  className="underline decoration-border underline-offset-4 hover:text-foreground"
                >
                  {siteConfig.name}
                </Link>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Published</dt>
              <dd>
                <time dateTime={entry.publishedAt}>
                  {formatArticleDate(entry.publishedAt)}
                </time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Last checked</dt>
              <dd>
                <time dateTime={entry.modifiedAt}>
                  {formatArticleDate(entry.modifiedAt)}
                </time>
              </dd>
            </div>
          </dl>
        </header>

        <section
          aria-labelledby="answer-heading"
          className="mt-12 rounded-[3px] border border-primary/30 bg-primary/5 p-6 md:p-8"
        >
          <h2
            id="answer-heading"
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            The short answer
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed">
            {entry.answer}
          </p>
          <NoteList notes={entry.answerNotes} />
          <SectionSources
            sourceIds={entry.answerSourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="side-by-side-heading" className="pt-16">
          <SectionHeading
            eyebrow={`${number(1)} / Comparison`}
            id="side-by-side"
            title={entry.sideBySide.title}
            intro={entry.sideBySide.intro}
          />
          <SectionTable
            caption={entry.sideBySide.caption}
            columns={entry.sideBySide.columns}
            rows={entry.sideBySide.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.sideBySide.notes} />
          <SectionSources
            sourceIds={entry.sideBySide.sourceIds}
            sources={entry.sources}
          />
        </section>

        <PrimitiveCase
          eyebrow={`${number(2)} / ${entry.leftCase.eyebrowLabel}`}
          id="left-case"
          section={entry.leftCase}
          sources={entry.sources}
        />

        <PrimitiveCase
          eyebrow={`${number(3)} / ${entry.rightCase.eyebrowLabel}`}
          id="right-case"
          section={entry.rightCase}
          sources={entry.sources}
        />

        <section aria-labelledby="together-heading" className="pt-16">
          <SectionHeading
            eyebrow={`${number(4)} / Together`}
            id="together"
            title={entry.together.title}
            intro={entry.together.intro}
          />
          <SectionTable
            caption={entry.together.caption}
            columns={entry.together.directions.columns}
            rows={entry.together.directions.rows}
            labelWidth="w-[24%]"
          />
          <NoteList notes={entry.together.notes} />
          <CodeBlock
            label={entry.together.templateLabel}
            value={entry.together.template}
            copy={entry.together.templateCopy}
          />
          <InlineLink link={entry.together.link} />
          <div className="mt-8">
            <ResourceCta location={`${entry.ctaLocation}_inline`} />
          </div>
          <SectionSources
            sourceIds={entry.together.sourceIds}
            sources={entry.sources}
          />
        </section>

        {team ? (
          <TeamPaths
            eyebrow={`${number(5)} / Teams`}
            section={team}
            sources={entry.sources}
          />
        ) : null}

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {number(team ? 6 : 5)} / Questions
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
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Editorial method:
            </span>{" "}
            every claim about how {entry.editorialSubject} behave comes from
            the first-party documentation below, checked on the date at the top
            of this page. Where the documentation says nothing, this page says so
            instead of filling the gap. Product behavior changes, so check the
            linked pages before you rely on a detail.
          </p>
          <ul className="mt-6 space-y-4">
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="related-heading"
              className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary"
            >
              Keep reading
            </h2>
            <Link
              href={resourcePaths.index}
              className="text-sm font-semibold text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              View all resources
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
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
            {entry.closing.title}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {entry.closing.body}
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
        </section>
      </div>
    </>
  )
}
