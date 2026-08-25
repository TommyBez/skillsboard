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
import { SkillMdBuilder } from "@/components/skill-creator/skill-md-builder"
import { buildSkillCreatorSchema } from "@/lib/seo/skill-creator/schema"
import type {
  SkillCreatorDefinition,
  SkillCreatorInlineLink,
  SkillCreatorNote,
  SkillCreatorSource,
} from "@/lib/seo/skill-creator"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: SkillCreatorInlineLink }) {
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

function NoteGrid({ entries }: { entries: readonly SkillCreatorNote[] }) {
  return (
    <dl className="mt-9 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border">
      {entries.map((entry) => (
        <div key={entry.title} className="bg-card p-5 md:p-6">
          <dt className="text-base font-semibold leading-snug">{entry.title}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {entry.body}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function SkillCreatorPage({ entry }: { entry: SkillCreatorDefinition }) {
  const sources: readonly SkillCreatorSource[] = entry.sources

  return (
    <>
      <JsonLd data={buildSkillCreatorSchema(entry)} />

      <div className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-10 md:py-16">
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
          <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
            {entry.title}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-[1.05rem] leading-8 text-muted-foreground">
            {entry.intro.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
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
              <dt className="font-semibold text-foreground">Price</dt>
              <dd>Free, no account</dd>
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

        <section aria-labelledby="tool-heading" className="pt-12">
          <h2
            id="tool-heading"
            className="text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {entry.tool.title}
          </h2>
          <p className="mt-4 max-w-3xl text-pretty text-[1.05rem] leading-8 text-muted-foreground">
            {entry.tool.intro}
          </p>
          <SkillMdBuilder
            exampleDraft={entry.tool.exampleDraft}
            privacyNote={entry.tool.privacyNote}
          />
          <SectionSources
            sourceIds={entry.tool.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="fields-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Format"
            id="fields"
            title={entry.fields.title}
            intro={entry.fields.intro}
          />
          <SectionTable
            caption="The six frontmatter fields the Agent Skills specification defines, with the limit on each and what the field changes."
            columns={entry.fields.columns}
            rows={entry.fields.rows}
            labelWidth="w-[16%]"
          />
          <NoteList notes={entry.fields.notes} />
          <InlineLink link={entry.fields.link} />
          <div className="mt-8">
            <ResourceCta location="skill_creator_inline" />
          </div>
          <SectionSources
            sourceIds={entry.fields.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="checks-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Limits"
            id="checks"
            title={entry.checks.title}
            intro={entry.checks.intro}
          />
          <NoteGrid entries={entry.checks.entries} />
          <NoteList notes={entry.checks.notes} />
          <InlineLink link={entry.checks.link} />
          <SectionSources
            sourceIds={entry.checks.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="official-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / The official one"
            id="official"
            title={entry.official.title}
            intro={entry.official.intro}
          />
          <NoteGrid entries={entry.official.entries} />
          <NoteList notes={entry.official.notes} />
          <InlineLink link={entry.official.link} />
          <SectionSources
            sourceIds={entry.official.sourceIds}
            sources={sources}
          />
        </section>

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            04 / Questions
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
                <dt className="font-semibold text-foreground">{item.question}</dt>
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
            <span className="font-semibold text-foreground">Editorial method:</span>{" "}
            every constraint the tool enforces and every claim on this page comes
            from the first-party documentation below, fetched on the date beside
            each entry. Where two sources disagree, both are named. Where nothing
            is documented, the page says so instead of filling it in.
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
            The file is the easy part. Finding it again is not.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Skills Board is the web app where a team keeps and shares its AI
            skills. Commit the folder, save it once, and a teammate can open the
            source, copy an install command, or download the latest files as a
            ZIP. Free forever, MIT licensed, and open source.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="skill_creator_closing" />
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
