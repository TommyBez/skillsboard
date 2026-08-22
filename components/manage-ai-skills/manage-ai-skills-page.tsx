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
import { ResourceCta } from "@/components/resources/resource-chrome"
import type {
  ManageAiSkillsDefinition,
  ManageAiSkillsInlineLink,
  ManageAiSkillsSource,
} from "@/lib/seo/manage-ai-skills"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: ManageAiSkillsInlineLink }) {
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

export function ManageAiSkillsPage({
  entry,
}: {
  entry: ManageAiSkillsDefinition
}) {
  const sources: readonly ManageAiSkillsSource[] = entry.sources

  return (
    <>
      <JsonLd data={buildResourceArticleSchema(entry)} />

      <div className="mx-auto w-full max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{entry.eyebrow}</span>
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
            <ResourceCta location="manage_ai_skills_hero" />
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

        <section aria-labelledby="scatter-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Symptoms"
            id="scatter"
            title={entry.scatter.title}
            intro={entry.scatter.intro}
          />
          <SectionTable
            caption="The five places an AI skill ends up in a team, who can see each one, and what none of them records."
            columns={entry.scatter.columns}
            rows={entry.scatter.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.scatter.notes} />
          <InlineLink link={entry.scatter.link} />
          <SectionSources
            sourceIds={entry.scatter.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="mechanisms-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Mechanisms"
            id="mechanisms"
            title={entry.mechanisms.title}
            intro={entry.mechanisms.intro}
          />
          <SectionTable
            caption="Each vendor's documented organization-level distribution mechanism, what it covers, and where it stops."
            columns={entry.mechanisms.columns}
            rows={entry.mechanisms.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.mechanisms.notes} />
          <InlineLink link={entry.mechanisms.link} />
          <div className="mt-8">
            <ResourceCta location="manage_ai_skills_inline" />
          </div>
          <SectionSources
            sourceIds={entry.mechanisms.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="requirements-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Requirements"
            id="requirements"
            title={entry.requirements.title}
            intro={entry.requirements.intro}
          />
          <dl className="mt-9 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border">
            {entry.requirements.rules.map((rule) => (
              <div key={rule.label} className="bg-card p-5 md:p-6">
                <dt className="text-base font-semibold leading-snug">
                  {rule.label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {rule.body}
                </dd>
              </div>
            ))}
          </dl>
          <NoteList notes={entry.requirements.notes} />
          <InlineLink link={entry.requirements.link} />
          <SectionSources
            sourceIds={entry.requirements.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="channels-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Channels"
            id="channels"
            title={entry.channels.title}
            intro={entry.channels.intro}
          />
          <SectionTable
            caption="The delivery channels Skills Board offers for one saved skill, and the limits of each."
            columns={entry.channels.columns}
            rows={entry.channels.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.channels.notes} />
          <InlineLink link={entry.channels.link} />
          <SectionSources
            sourceIds={entry.channels.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="team-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Fit"
            id="team"
            title={entry.team.title}
            intro={entry.team.intro}
          />
          <NoteList notes={entry.team.body} />
          <dl className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border md:grid-cols-2">
            {entry.team.options.map((option) => (
              <div key={option.label} className="bg-card p-5">
                <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {option.label}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {option.body}
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

        <section aria-labelledby="not-documented-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Gaps"
            id="not-documented"
            title={entry.notDocumented.title}
            intro={entry.notDocumented.intro}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
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
            every vendor claim on this page comes from the first-party
            documentation below, fetched on the date at the top. Product claims
            about Skills Board come from the open-source repository. Where two
            sources disagree, both are named. Where nothing is documented, the
            gaps section says so instead of filling it in.
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
          <div className="mt-5 grid gap-4 md:grid-cols-2">
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
            Distribution is per vendor. The choice is yours.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the skills your team actually uses, and invite the people who
            keep asking which one to use.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="manage_ai_skills_closing" />
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
