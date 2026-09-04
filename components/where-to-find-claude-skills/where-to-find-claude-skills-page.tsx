import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import {
  formatArticleDate,
  NoteList,
  SectionHeading,
  SectionSources,
  SectionTable,
} from "@/components/resources/article-parts"
import { ResourceBreadcrumb } from "@/components/resources/resource-breadcrumb"
import { ResourceCta } from "@/components/resources/resource-chrome"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import type {
  WhereSkillsInlineLink,
  WhereSkillsPlaceSection,
  WhereSkillsSource,
  WhereToFindClaudeSkillsDefinition,
} from "@/lib/seo/where-to-find-claude-skills"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: WhereSkillsInlineLink }) {
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

function PlaceList({
  entries,
}: {
  entries: WhereSkillsPlaceSection["entries"]
}) {
  return (
    <div className="mt-9 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border">
      {entries.map((place) => (
        <div key={place.name} className="bg-card p-5 md:p-6">
          <a
            href={place.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            {place.name}
            <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
          </a>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {place.body}
          </p>
        </div>
      ))}
    </div>
  )
}

export function WhereToFindClaudeSkillsPage({
  entry,
}: {
  entry: WhereToFindClaudeSkillsDefinition
}) {
  const sources: readonly WhereSkillsSource[] = entry.sources

  return (
    <>
      <JsonLd data={buildResourceArticleSchema(entry)} />

      <div className="mx-auto w-full max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <ResourceBreadcrumb page={entry.eyebrow} />

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
            sources={sources}
          />
        </section>

        <section aria-labelledby="landscape-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Landscape"
            id="landscape"
            title={entry.landscape.title}
            intro={entry.landscape.intro}
          />
          <SectionTable
            caption="Every documented channel a Claude skill travels through, and what each one actually installs."
            columns={entry.landscape.columns}
            rows={entry.landscape.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.landscape.notes} />
          <InlineLink link={entry.landscape.link} />
          <SectionSources
            sourceIds={entry.landscape.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="official-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Official"
            id="official"
            title={entry.official.title}
            intro={entry.official.intro}
          />
          <PlaceList entries={entry.official.entries} />
          <NoteList notes={entry.official.notes} />
          <InlineLink link={entry.official.link} />
          <SectionSources
            sourceIds={entry.official.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="catalogs-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Catalogs"
            id="catalogs"
            title={entry.catalogs.title}
            intro={entry.catalogs.intro}
          />
          <PlaceList entries={entry.catalogs.entries} />
          <NoteList notes={entry.catalogs.notes} />
          <div className="mt-8">
            <ResourceCta location="inline" />
          </div>
          <SectionSources
            sourceIds={entry.catalogs.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="community-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Repositories"
            id="community"
            title={entry.community.title}
            intro={entry.community.intro}
          />
          <PlaceList entries={entry.community.entries} />
          <NoteList notes={entry.community.notes} />
          <InlineLink link={entry.community.link} />
          <SectionSources
            sourceIds={entry.community.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="vetting-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Vetting"
            id="vetting"
            title={entry.vetting.title}
            intro={entry.vetting.intro}
          />
          <SectionTable
            caption="What each source screens before it lists something, and what it leaves to you."
            columns={entry.vetting.columns}
            rows={entry.vetting.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.vetting.notes} />
          <InlineLink link={entry.vetting.link} />
          <SectionSources
            sourceIds={entry.vetting.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="team-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Teams"
            id="team"
            title={entry.team.title}
            intro={entry.team.intro}
          />
          <NoteList notes={entry.team.body} />
          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[3px] border border-border bg-border md:grid-cols-2">
            {entry.team.paths.map((path) => (
              <div key={path.label} className="bg-card p-5">
                <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {path.label}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {path.body}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="mt-7 ml-5 list-disc space-y-3 text-[0.95rem] leading-7 text-muted-foreground">
            {entry.team.limits.map((limit) => (
              <li key={limit} className="pl-1">
                {limit}
              </li>
            ))}
          </ul>
          <InlineLink link={entry.team.link} />
          <SectionSources sourceIds={entry.team.sourceIds} sources={sources} />
        </section>

        <section aria-labelledby="open-questions-heading" className="pt-16">
          <SectionHeading
            eyebrow="07 / Limits"
            id="open-questions"
            title={entry.openQuestions.title}
            intro={entry.openQuestions.intro}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {entry.openQuestions.entries.map((item) => (
              <div
                key={item.title}
                className="rounded-[3px] border border-border bg-card p-5"
              >
                <h3 className="text-base font-semibold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <SectionSources
            sourceIds={entry.openQuestions.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            08 / Questions
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
            every claim on this page comes from the first-party sources below,
            fetched on the date at the top. Star counts and install counts were
            read on that date and move constantly. Where nothing is documented,
            this page says so instead of filling the gap, and the section on
            what we could not verify lists those cases explicitly.
          </p>
          <ul className="mt-6 space-y-4">
            {sources.map((source) => (
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
            A catalog tells you what exists. It cannot tell your team which one
            to use.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the skills you actually use, and invite the people who keep
            asking.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="closing" />
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
