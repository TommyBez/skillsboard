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
  StepList,
} from "@/components/resources/article-parts"
import { ResourceBreadcrumb } from "@/components/resources/resource-breadcrumb"
import { ResourceCta } from "@/components/resources/resource-chrome"
import type {
  SkillExamplesDefinition,
  SkillExamplesInlineLink,
} from "@/lib/seo/skill-examples"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: SkillExamplesInlineLink }) {
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

export function SkillExamplesPage({
  entry,
}: {
  entry: SkillExamplesDefinition
}) {
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
            <ResourceCta location="skill_examples_hero" />
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
            Where the skill examples are
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

        <section aria-labelledby="patterns-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Patterns"
            id="patterns"
            title={entry.patterns.title}
            intro={entry.patterns.intro}
          />
          <SectionTable
            caption="Eight example skills, what each file is, and the reusable pattern inside it."
            columns={entry.patterns.columns}
            rows={entry.patterns.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.patterns.notes} />
          <InlineLink link={entry.patterns.link} />
          <SectionSources
            sourceIds={entry.patterns.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="frontmatter-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Frontmatter"
            id="frontmatter"
            title={entry.frontmatter.title}
            intro={entry.frontmatter.intro}
          />
          <SectionTable
            caption="The six specification fields against what all nineteen example skills declare."
            columns={entry.frontmatter.columns}
            rows={entry.frontmatter.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.frontmatter.notes} />
          <InlineLink link={entry.frontmatter.link} />
          <SectionSources
            sourceIds={entry.frontmatter.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="descriptions-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Triggering"
            id="descriptions"
            title={entry.descriptions.title}
            intro={entry.descriptions.intro}
          />
          <SectionTable
            caption="Seven example descriptions, their exact length, and the shape each one uses."
            columns={entry.descriptions.columns}
            rows={entry.descriptions.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.descriptions.notes} />
          <InlineLink link={entry.descriptions.link} />
          <SectionSources
            sourceIds={entry.descriptions.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="layout-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Layout"
            id="layout"
            title={entry.layout.title}
            intro={entry.layout.intro}
          />
          <SectionTable
            caption="The directory names the specification recommends against the ones the examples use."
            columns={entry.layout.columns}
            rows={entry.layout.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.layout.notes} />
          <InlineLink link={entry.layout.link} />
          <SectionSources
            sourceIds={entry.layout.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="excerpts-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Verbatim"
            id="excerpts"
            title={entry.excerpts.title}
            intro={entry.excerpts.intro}
          />
          <div className="mt-8 space-y-10">
            {entry.excerpts.entries.map((excerpt) => (
              <article key={excerpt.title}>
                <h3 className="text-lg font-semibold leading-snug">
                  {excerpt.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {excerpt.file}.{" "}
                  <a
                    href={excerpt.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                  >
                    Read it on GitHub
                    <ExternalLinkIcon className="size-3" aria-hidden="true" />
                  </a>
                </p>
                <CodeBlock label={excerpt.file} value={excerpt.template} />
                <p className="mt-4 max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
                  {excerpt.takeaway}
                </p>
              </article>
            ))}
          </div>
          <InlineLink link={entry.excerpts.link} />
          <SectionSources
            sourceIds={entry.excerpts.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="divergence-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Divergence"
            id="divergence"
            title={entry.divergence.title}
            intro={entry.divergence.intro}
          />
          <SectionTable
            caption="Published guidance on the left, and what the example files actually do."
            columns={entry.divergence.columns}
            rows={entry.divergence.rows}
            labelWidth="w-[26%]"
          />
          <NoteList notes={entry.divergence.notes} />
          <InlineLink link={entry.divergence.link} />
          <SectionSources
            sourceIds={entry.divergence.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="starter-heading" className="pt-16">
          <SectionHeading
            eyebrow="07 / Starter"
            id="starter"
            title={entry.starter.title}
            intro={entry.starter.intro}
          />
          <StepList steps={entry.starter.steps} />
          <CodeBlock
            label="A starter SKILL.md"
            value={entry.starter.template}
            copy={{
              buttonLabel: "Copy the starter",
              ariaLabel: "Copy the starter SKILL.md",
              copiedAriaLabel: "Starter SKILL.md copied",
            }}
          />
          <SectionSources
            sourceIds={entry.starter.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="team-heading" className="pt-16">
          <SectionHeading
            eyebrow="08 / Teams"
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
          <div className="mt-8">
            <ResourceCta location="skill_examples_inline" />
          </div>
          <SectionSources
            sourceIds={entry.team.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="open-questions-heading" className="pt-16">
          <SectionHeading
            eyebrow="09 / Limits"
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
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            10 / Questions
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
            read on the date at the top of the page: the repository through the
            GitHub API, the raw SKILL.md files themselves, the Agent Skills
            specification, and the Claude Code documentation. Quoted blocks are
            copied as published, typo included. Where nothing is documented,
            this page says so instead of filling the gap. Repositories move, so
            check the linked source before you rely on a count.
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
            Once your team has written a few, keep the good one somewhere
            everyone can find it.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the first skill, and invite the people who keep asking which one to
            use.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="skill_examples_closing" />
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
