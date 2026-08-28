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
  AgentSkillsSupportDefinition,
  AgentSkillsSupportInlineLink,
} from "@/lib/seo/agent-skills-support"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: AgentSkillsSupportInlineLink }) {
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

export function AgentSkillsSupportPage({
  entry,
}: {
  entry: AgentSkillsSupportDefinition
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
            <ResourceCta location="agent_skills_support_hero" />
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
            Which clients support Agent Skills
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

        <section aria-labelledby="criteria-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Criteria"
            id="criteria"
            title={entry.criteria.title}
            intro={entry.criteria.intro}
          />
          <ol className="mt-8 space-y-6">
            {entry.criteria.rules.map((rule) => (
              <li
                key={rule.label}
                className="rounded-[3px] border border-border bg-card p-5"
              >
                <h3 className="text-base font-semibold leading-snug">
                  {rule.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {rule.body}
                </p>
              </li>
            ))}
          </ol>
          <NoteList notes={entry.criteria.notes} />
          <InlineLink link={entry.criteria.link} />
          <SectionSources
            sourceIds={entry.criteria.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="documented-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Vendor documented"
            id="documented"
            title={entry.documented.title}
            intro={entry.documented.intro}
          />
          <SectionTable
            caption="Clients whose first-party documentation states they read SKILL.md, with the locations that documentation names."
            columns={entry.documented.columns}
            rows={entry.documented.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.documented.notes} />
          <InlineLink link={entry.documented.link} />
          <SectionSources
            sourceIds={entry.documented.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="showcase-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Showcase listed"
            id="showcase"
            title={entry.showcase.title}
            intro={entry.showcase.intro}
          />
          <SectionTable
            caption="Products listed on the Agent Skills client showcase whose own documentation was not opened for this page."
            columns={entry.showcase.columns}
            rows={entry.showcase.rows}
            labelWidth="w-[24%]"
          />
          <NoteList notes={entry.showcase.notes} />
          <InlineLink link={entry.showcase.link} />
          <SectionSources
            sourceIds={entry.showcase.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="paths-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Directories"
            id="paths"
            title={entry.paths.title}
            intro={entry.paths.intro}
          />
          <SectionTable
            caption="Each skill directory, and the documented clients whose own documentation prints that path."
            columns={entry.paths.columns}
            rows={entry.paths.rows}
            labelWidth="w-[22%]"
          />
          <NoteList notes={entry.paths.notes} />
          <InlineLink link={entry.paths.link} />
          <div className="mt-8">
            <ResourceCta location="agent_skills_support_inline" />
          </div>
          <SectionSources
            sourceIds={entry.paths.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="not-documented-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Gaps"
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
          <InlineLink link={entry.notDocumented.link} />
          <SectionSources
            sourceIds={entry.notDocumented.sourceIds}
            sources={entry.sources}
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
          <SectionSources
            sourceIds={entry.team.sourceIds}
            sources={entry.sources}
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
            every support claim on this page comes from the first-party
            documentation below, fetched on the date at the top of this page.
            Where the documentation says nothing, this page says so instead of
            filling the gap. Product behavior changes, so check the linked pages
            before you rely on a detail.
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
            Your teammates run different clients. Keep one team library anyway.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Save the skill once,
            keep its source visible, and let each teammate take the source, the
            command, or the files.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="agent_skills_support_closing" />
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
