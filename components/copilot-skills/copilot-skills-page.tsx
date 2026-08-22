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
import { ResourceCta } from "@/components/resources/resource-chrome"
import type {
  CopilotSkillsDefinition,
  CopilotSkillsInlineLink,
} from "@/lib/seo/copilot-skills"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: CopilotSkillsInlineLink }) {
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

export function CopilotSkillsPage({
  entry,
}: {
  entry: CopilotSkillsDefinition
}) {
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
            <ResourceCta location="copilot_skills_hero" />
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
            What a GitHub Copilot skill is
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

        <section aria-labelledby="surfaces-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Surfaces"
            id="surfaces"
            title={entry.surfaces.title}
            intro={entry.surfaces.intro}
          />
          <SectionTable
            caption="Each Copilot surface, whether agent skills load there, and what the documentation adds."
            columns={entry.surfaces.columns}
            rows={entry.surfaces.rows}
            labelWidth="w-[32%]"
          />
          <NoteList notes={entry.surfaces.notes} />
          <InlineLink link={entry.surfaces.link} />
          <SectionSources
            sourceIds={entry.surfaces.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="locations-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Locations"
            id="locations"
            title={entry.locations.title}
            intro={entry.locations.intro}
          />
          <SectionTable
            caption="Every directory Copilot reads a skill from, and which documentation names it."
            columns={entry.locations.columns}
            rows={entry.locations.rows}
            labelWidth="w-[24%]"
          />
          <NoteList notes={entry.locations.notes} />
          <InlineLink link={entry.locations.link} />
          <SectionSources
            sourceIds={entry.locations.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="frontmatter-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Format"
            id="frontmatter"
            title={entry.frontmatter.title}
            intro={entry.frontmatter.intro}
          />
          <SectionTable
            caption="The SKILL.md frontmatter fields, in the specification and in the Copilot documentation."
            columns={entry.frontmatter.columns}
            rows={entry.frontmatter.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.frontmatter.notes} />
          <InlineLink link={entry.frontmatter.link} />
          <SectionSources
            sourceIds={entry.frontmatter.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="invocation-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Invocation"
            id="invocation"
            title={entry.invocation.title}
            intro={entry.invocation.intro}
          />
          <SectionTable
            caption="Every documented route by which a skill enters a Copilot session."
            columns={entry.invocation.columns}
            rows={entry.invocation.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.invocation.notes} />
          <InlineLink link={entry.invocation.link} />
          <SectionSources
            sourceIds={entry.invocation.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="instructions-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Instructions"
            id="instructions"
            title={entry.instructions.title}
            intro={entry.instructions.intro}
          />
          <SectionTable
            caption="Every Copilot customization feature, the file it lives in, and when Copilot reads it."
            columns={entry.instructions.columns}
            rows={entry.instructions.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.instructions.notes} />
          <InlineLink link={entry.instructions.link} />
          <SectionSources
            sourceIds={entry.instructions.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="distribution-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Distribution"
            id="distribution"
            title={entry.distribution.title}
            intro={entry.distribution.intro}
          />
          <SectionTable
            caption="Every documented way a skill reaches another person's machine."
            columns={entry.distribution.columns}
            rows={entry.distribution.rows}
            labelWidth="w-[16%]"
          />
          <NoteList notes={entry.distribution.notes} />
          <InlineLink link={entry.distribution.link} />
          <SectionSources
            sourceIds={entry.distribution.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="install-heading" className="pt-16">
          <SectionHeading
            eyebrow="07 / Install"
            id="install"
            title={entry.install.title}
            intro={entry.install.intro}
          />
          <StepList steps={entry.install.steps} />
          <CodeBlock
            label="SKILL.md starting point"
            value={entry.install.template}
            copy={{
              buttonLabel: "Copy SKILL.md",
              ariaLabel: "Copy the SKILL.md starting point",
              copiedAriaLabel: "SKILL.md starting point copied",
            }}
          />
          <SectionSources
            sourceIds={entry.install.sourceIds}
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
          <div className="mt-8">
            <ResourceCta location="copilot_skills_inline" />
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
            every claim about how GitHub Copilot handles skills comes from the
            first-party documentation below, fetched on the date at the top of
            this page. Where the documentation says nothing, this page says so
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
            Put your team's AI skills somewhere everyone can find them.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the first skill, and invite the people who keep asking which one to
            use.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="copilot_skills_closing" />
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
