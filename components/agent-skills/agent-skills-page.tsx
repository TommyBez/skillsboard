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
import { ResourceBreadcrumb } from "@/components/resources/resource-breadcrumb"
import { ResourceCta } from "@/components/resources/resource-chrome"
import type {
  AgentSkillsDefinition,
  AgentSkillsInlineLink,
  AgentSkillsPlaceSection,
  AgentSkillsSource,
} from "@/lib/seo/agent-skills"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: AgentSkillsInlineLink }) {
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
  entries: AgentSkillsPlaceSection["entries"]
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

export function AgentSkillsPage({ entry }: { entry: AgentSkillsDefinition }) {
  const sources: readonly AgentSkillsSource[] = entry.sources

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
            <ResourceCta location="agent_skills_hero" />
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

        <section aria-labelledby="format-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Specification"
            id="format"
            title={entry.format.title}
            intro={entry.format.intro}
          />
          <SectionTable
            caption="Every frontmatter field the Agent Skills specification defines, and the constraints it places on each."
            columns={entry.format.columns}
            rows={entry.format.rows}
            labelWidth="w-[20%]"
          />
          <CodeBlock label="Skill directory" value={entry.format.tree} />
          <NoteList notes={entry.format.notes} />
          <InlineLink link={entry.format.link} />
          <SectionSources
            sourceIds={entry.format.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="loading-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Loading"
            id="loading"
            title={entry.loading.title}
            intro={entry.loading.intro}
          />
          <SectionTable
            caption="The three progressive disclosure tiers, what each one puts in context, and when."
            columns={entry.loading.columns}
            rows={entry.loading.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.loading.notes} />
          <InlineLink link={entry.loading.link} />
          <SectionSources
            sourceIds={entry.loading.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="support-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Adoption"
            id="support"
            title={entry.support.title}
            intro={entry.support.intro}
          />
          <SectionTable
            caption="The directories each documented agent scans for skills, at project and user scope."
            columns={entry.support.columns}
            rows={entry.support.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.support.notes} />
          <InlineLink link={entry.support.link} />
          <div className="mt-8">
            <ResourceCta location="agent_skills_inline" />
          </div>
          <SectionSources
            sourceIds={entry.support.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="portability-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Portability"
            id="portability"
            title={entry.portability.title}
            intro={entry.portability.intro}
          />
          <SectionTable
            caption="What survives when a skill moves between agents, and the documented place each part stops."
            columns={entry.portability.columns}
            rows={entry.portability.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.portability.notes} />
          <InlineLink link={entry.portability.link} />
          <SectionSources
            sourceIds={entry.portability.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="examples-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Examples"
            id="examples"
            title={entry.examples.title}
            intro={entry.examples.intro}
          />
          <PlaceList entries={entry.examples.entries} />
          <NoteList notes={entry.examples.notes} />
          {entry.examples.link ? <InlineLink link={entry.examples.link} /> : null}
          <SectionSources
            sourceIds={entry.examples.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="governance-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Governance"
            id="governance"
            title={entry.governance.title}
            intro={entry.governance.intro}
          />
          <PlaceList entries={entry.governance.entries} />
          <NoteList notes={entry.governance.notes} />
          <SectionSources
            sourceIds={entry.governance.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="team-heading" className="pt-16">
          <SectionHeading
            eyebrow="07 / Teams"
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
            eyebrow="08 / Limits"
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
            every claim on this page comes from the first-party sources below,
            fetched on the date at the top. Counts of skills, clients, and
            directories were read on that date and change without notice. Where
            nothing is documented, this page says so instead of filling the gap,
            and the section on what is not documented lists those cases
            explicitly.
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
            A shared format is not a shared decision.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the skills your team actually uses, and invite the people who
            keep asking which one to use.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="agent_skills_closing" />
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
