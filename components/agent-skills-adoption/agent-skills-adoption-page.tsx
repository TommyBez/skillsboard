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
import type {
  AgentSkillsAdoptionDefinition,
  AgentSkillsAdoptionInlineLink,
  AgentSkillsAdoptionSource,
} from "@/lib/seo/agent-skills-adoption"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: AgentSkillsAdoptionInlineLink }) {
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

export function AgentSkillsAdoptionPage({
  entry,
}: {
  entry: AgentSkillsAdoptionDefinition
}) {
  const sources: readonly AgentSkillsAdoptionSource[] = entry.sources

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
          <p className="mt-5 font-mono text-sm font-semibold text-muted-foreground">
            Data as of{" "}
            <time dateTime={entry.modifiedAt}>
              {formatArticleDate(entry.modifiedAt)}
            </time>
          </p>
          <div className="mt-6 max-w-3xl space-y-4 text-[1.05rem] leading-8 text-muted-foreground">
            {entry.intro.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResourceCta location="agent_skills_adoption_hero" />
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
            In short
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

        <section aria-labelledby="method-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Method"
            id="method"
            title={entry.method.title}
            intro={entry.method.intro}
          />
          <NoteList notes={entry.method.body} />
          <ol className="mt-9 border-t border-border">
            {entry.method.steps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-1 gap-3 border-b border-border py-6 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-5"
              >
                <span className="font-mono text-sm font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-pretty text-[0.95rem] leading-7 text-muted-foreground">
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <SectionSources
            sourceIds={entry.method.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="ecosystem-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Ecosystem"
            id="ecosystem"
            title={entry.ecosystem.title}
            intro={entry.ecosystem.intro}
          />
          <SectionTable
            caption="The four public figures on agent skills adoption, what each one counts, and the day it was read."
            columns={entry.ecosystem.columns}
            rows={entry.ecosystem.rows}
            labelWidth="w-[22%]"
          />
          <NoteList notes={entry.ecosystem.notes} />
          <InlineLink link={entry.ecosystem.link} />
          <SectionSources
            sourceIds={entry.ecosystem.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="crawlers-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Crawlers"
            id="crawlers"
            title={entry.crawlers.title}
            intro={entry.crawlers.intro}
          />
          <SectionTable
            caption="Server-side request counts for skillsboard.sh over seven days, split between AI crawlers, classic search crawlers, and excluded noise."
            columns={entry.crawlers.columns}
            rows={entry.crawlers.rows}
            labelWidth="w-[22%]"
          />
          <NoteList notes={entry.crawlers.notes} />
          <InlineLink link={entry.crawlers.link} />
          <div className="mt-8">
            <ResourceCta location="agent_skills_adoption_inline" />
          </div>
          <SectionSources
            sourceIds={entry.crawlers.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="search-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Search"
            id="search"
            title={entry.search.title}
            intro={entry.search.intro}
          />
          <SectionTable
            caption="Google Search Console figures for one small site, including the beta report on impressions inside AI answers."
            columns={entry.search.columns}
            rows={entry.search.rows}
            labelWidth="w-[22%]"
          />
          <NoteList notes={entry.search.notes} />
          <InlineLink link={entry.search.link} />
          <SectionSources
            sourceIds={entry.search.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="not-documented-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Limits"
            id="not-documented"
            title={entry.notDocumented.title}
            intro={entry.notDocumented.intro}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {entry.notDocumented.entries.map((item) => (
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
            sourceIds={entry.notDocumented.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="reuse-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Reuse"
            id="reuse"
            title={entry.reuse.title}
            intro={entry.reuse.intro}
          />
          <NoteList notes={entry.reuse.body} />
          <InlineLink link={entry.reuse.link} />
          <SectionSources
            sourceIds={entry.reuse.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            07 / Questions
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
            every figure on this page names the source it came from and the day
            it was read. Public counts come from the first-party page or
            repository below. Traffic and search figures come from
            instrumentation on this site, described in the method section. Where
            a figure cannot be reproduced, the limits section says so instead of
            filling the gap.
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
            The counting stops at your team library.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the skills your team actually uses, and stop guessing which one a
            teammate should open.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="agent_skills_adoption_closing" />
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
