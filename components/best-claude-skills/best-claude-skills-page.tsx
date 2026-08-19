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
  BestClaudeSkillsDefinition,
  BestClaudeSkillsInlineLink,
  BestClaudeSkillsSource,
} from "@/lib/seo/best-claude-skills"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: BestClaudeSkillsInlineLink }) {
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

export function BestClaudeSkillsPage({
  entry,
}: {
  entry: BestClaudeSkillsDefinition
}) {
  const sources: readonly BestClaudeSkillsSource[] = entry.sources

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
            <ResourceCta location="best_claude_skills_hero" />
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
              <dt className="font-semibold text-foreground">Last reviewed</dt>
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

        <section aria-labelledby="method-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Method"
            id="method"
            title={entry.method.title}
            intro={entry.method.intro}
          />
          <dl className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border md:grid-cols-2">
            {entry.method.criteria.map((criterion) => (
              <div key={criterion.label} className="bg-card p-5">
                <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {criterion.label}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {criterion.body}
                </dd>
              </div>
            ))}
          </dl>
          <NoteList notes={entry.method.notes} />
          <InlineLink link={entry.method.link} />
          <SectionSources
            sourceIds={entry.method.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="engineering-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Engineering"
            id="engineering"
            title={entry.engineering.title}
            intro={entry.engineering.intro}
          />
          <SectionTable
            caption="Engineering workflow skills that cleared the selection criteria, with publisher, license, and where each one runs."
            columns={entry.engineering.columns}
            rows={entry.engineering.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.engineering.notes} />
          <InlineLink link={entry.engineering.link} />
          <div className="mt-8">
            <ResourceCta location="best_claude_skills_inline" />
          </div>
          <SectionSources
            sourceIds={entry.engineering.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="interfaces-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Interfaces"
            id="interfaces"
            title={entry.interfaces.title}
            intro={entry.interfaces.intro}
          />
          <SectionTable
            caption="Front-end, design, and UI skills that cleared the selection criteria."
            columns={entry.interfaces.columns}
            rows={entry.interfaces.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.interfaces.notes} />
          <InlineLink link={entry.interfaces.link} />
          <SectionSources
            sourceIds={entry.interfaces.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="delivery-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Documents"
            id="delivery"
            title={entry.delivery.title}
            intro={entry.delivery.intro}
          />
          <SectionTable
            caption="Document, file, and database skills that cleared the selection criteria, including the two that are not open source."
            columns={entry.delivery.columns}
            rows={entry.delivery.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.delivery.notes} />
          <InlineLink link={entry.delivery.link} />
          <SectionSources
            sourceIds={entry.delivery.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="authoring-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Authoring"
            id="authoring"
            title={entry.authoring.title}
            intro={entry.authoring.intro}
          />
          <SectionTable
            caption="Skills for writing, measuring, and reviewing other skills."
            columns={entry.authoring.columns}
            rows={entry.authoring.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.authoring.notes} />
          <InlineLink link={entry.authoring.link} />
          <SectionSources
            sourceIds={entry.authoring.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="dropped-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Dropped"
            id="dropped"
            title={entry.dropped.title}
            intro={entry.dropped.intro}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {entry.dropped.entries.map((item) => (
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
            sourceIds={entry.dropped.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="open-questions-heading" className="pt-16">
          <SectionHeading
            eyebrow="07 / Limits"
            id="open-questions"
            title={entry.openQuestions.title}
            intro={entry.openQuestions.intro}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
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

        <section aria-labelledby="team-heading" className="pt-16">
          <SectionHeading
            eyebrow="08 / Teams"
            id="team"
            title={entry.team.title}
            intro={entry.team.intro}
          />
          <NoteList notes={entry.team.body} />
          <dl className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border md:grid-cols-2">
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

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            09 / Questions
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
            every skill in the register was read from its own SKILL.md and its
            own license file on the date at the top of this page, using
            raw.githubusercontent.com and the GitHub API. Install figures come
            from the skills.sh leaderboard read on the same day, and the section
            on what is not documented says exactly what that number can and
            cannot mean. Nothing here is sponsored, no publisher was contacted,
            and where nobody publishes a fact we say so instead of estimating
            it.
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
            Twenty-seven is a reading list. Three is a decision.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the few skills your team actually recommends, and keep the source,
            the path, and the license one click away from every entry.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="best_claude_skills_closing" />
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
