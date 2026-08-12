import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { JsonLd } from "@/components/json-ld"
import { ResourceCta } from "@/components/resources/resource-chrome"
import { buildClaudeSkillsSchema } from "@/lib/seo/claude-skills-schema"
import type {
  ClaudeSkillsDefinition,
  ClaudeSkillsSource,
} from "@/lib/seo/claude-skills"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function SectionSources({
  sourceIds,
  sources,
}: {
  sourceIds: readonly string[]
  sources: readonly ClaudeSkillsSource[]
}) {
  const cited = sourceIds.flatMap((sourceId) => {
    const source = sources.find((candidate) => candidate.id === sourceId)
    return source ? [source] : []
  })

  if (cited.length === 0) {
    return null
  }

  return (
    <aside
      aria-label="Sources for this section"
      className="mt-6 border-l-2 border-border pl-4"
    >
      <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Sources for this section
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {cited.map((source) => (
          <li key={source.id}>
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              {source.label}
              <ExternalLinkIcon className="size-3" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function SectionHeading({
  eyebrow,
  id,
  title,
  intro,
}: {
  eyebrow: string
  id: string
  title: string
  intro: string
}) {
  return (
    <>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
        {intro}
      </p>
    </>
  )
}

function SectionTable({
  caption,
  columns,
  rows,
  labelWidth,
}: {
  caption: string
  columns: readonly string[]
  rows: readonly { label: string; cells: readonly string[] }[]
  labelWidth: string
}) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className="mt-8 overflow-x-auto rounded-[3px] border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-muted/55">
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-border/70 last:border-b-0"
            >
              <th
                scope="row"
                className={`${labelWidth} px-5 py-5 align-top font-mono text-sm font-semibold`}
              >
                {row.label}
              </th>
              {row.cells.map((cell) => (
                <td
                  key={cell}
                  className="px-5 py-5 align-top text-sm leading-relaxed text-muted-foreground"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NoteList({ notes }: { notes: readonly string[] }) {
  return (
    <div className="mt-7 max-w-3xl space-y-4 text-[0.95rem] leading-7 text-muted-foreground">
      {notes.map((note) => (
        <p key={note} className="text-pretty">
          {note}
        </p>
      ))}
    </div>
  )
}

function StepList({
  steps,
}: {
  steps: readonly { title: string; body: string }[]
}) {
  return (
    <ol className="mt-9 border-t border-border">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="grid gap-3 border-b border-border py-7 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-5"
        >
          <span className="font-mono text-sm font-semibold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function CodeBlock({
  label,
  value,
  copy,
}: {
  label: string
  value: string
  copy?: { buttonLabel: string; ariaLabel: string; copiedAriaLabel: string }
}) {
  return (
    <div className="mt-8 overflow-hidden rounded-[3px] border border-border bg-[var(--surface-ink)] text-[var(--surface-ink-foreground)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {label}
        </p>
        {copy ? (
          <CopyButton
            value={value}
            label={copy.buttonLabel}
            ariaLabel={copy.ariaLabel}
            copiedAriaLabel={copy.copiedAriaLabel}
            className="border-white/20 bg-white/10 text-[var(--surface-ink-foreground)] hover:border-white/35 hover:bg-white/15 hover:text-[var(--surface-ink-foreground)]"
          />
        ) : null}
      </div>
      <pre
        aria-label={label}
        className="overflow-x-auto px-5 py-6 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        tabIndex={0}
      >
        <code>{value}</code>
      </pre>
    </div>
  )
}

export function ClaudeSkillsPage({ entry }: { entry: ClaudeSkillsDefinition }) {
  return (
    <>
      <JsonLd data={buildClaudeSkillsSchema(entry)} />

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
            <ResourceCta location="claude_skills_hero" />
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
                  {formatDate(entry.publishedAt)}
                </time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Last checked</dt>
              <dd>
                <time dateTime={entry.modifiedAt}>
                  {formatDate(entry.modifiedAt)}
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
            What is a Claude Skill?
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed">
            {entry.answer}
          </p>
          <SectionSources
            sourceIds={entry.answerSourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="format-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Format"
            id="format"
            title={entry.format.title}
            intro={entry.format.intro}
          />
          <SectionTable
            caption="SKILL.md frontmatter fields defined by the Agent Skills specification."
            columns={entry.format.columns}
            rows={entry.format.rows}
            labelWidth="w-[20%]"
          />
          <CodeBlock label="Skill directory" value={entry.format.tree} />
          <NoteList notes={entry.format.notes} />
          <SectionSources
            sourceIds={entry.format.sourceIds}
            sources={entry.sources}
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
            caption="The three stages of progressive disclosure and what each one costs."
            columns={entry.loading.columns}
            rows={entry.loading.rows}
            labelWidth="w-[16%]"
          />
          <NoteList notes={entry.loading.notes} />
          <SectionSources
            sourceIds={entry.loading.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="surfaces-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Surfaces"
            id="surfaces"
            title={entry.surfaces.title}
            intro={entry.surfaces.intro}
          />
          <SectionTable
            caption="How skills are installed, shared, and sandboxed on each surface."
            columns={entry.surfaces.columns}
            rows={entry.surfaces.rows}
            labelWidth="w-[16%]"
          />
          <NoteList notes={entry.surfaces.notes} />
          <SectionSources
            sourceIds={entry.surfaces.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="install-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Install"
            id="install"
            title={entry.install.title}
            intro={entry.install.intro}
          />
          <StepList steps={entry.install.steps} />
          <SectionSources
            sourceIds={entry.install.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="authoring-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Authoring"
            id="authoring"
            title={entry.authoring.title}
            intro={entry.authoring.intro}
          />
          <StepList steps={entry.authoring.steps} />
          <CodeBlock
            label="SKILL.md starting point"
            value={entry.authoring.template}
            copy={{
              buttonLabel: "Copy SKILL.md",
              ariaLabel: "Copy the SKILL.md starting point",
              copiedAriaLabel: "SKILL.md starting point copied",
            }}
          />
          <SectionSources
            sourceIds={entry.authoring.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="ecosystem-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / Ecosystem"
            id="ecosystem"
            title={entry.ecosystem.title}
            intro={entry.ecosystem.intro}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {entry.ecosystem.entries.map((source) => (
              <div
                key={source.name}
                className="rounded-[3px] border border-border bg-card p-5"
              >
                <h3 className="font-mono text-sm font-semibold">
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                  >
                    {source.name}
                    <ExternalLinkIcon className="size-3" aria-hidden="true" />
                  </a>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {source.body}
                </p>
              </div>
            ))}
          </div>
          <NoteList notes={entry.ecosystem.notes} />
          <SectionSources
            sourceIds={entry.ecosystem.sourceIds}
            sources={entry.sources}
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
          <div className="mt-8">
            <ResourceCta location="claude_skills_inline" />
          </div>
          <SectionSources
            sourceIds={entry.team.sourceIds}
            sources={entry.sources}
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
            every claim about the format and the products that run it comes from
            the first-party documentation below. Product behavior changes, so
            check the linked pages before you rely on a detail.
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
            Put the skills your team recommends somewhere everyone can find
            them.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the first skill, and invite the people who keep asking which one to
            use.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="claude_skills_closing" />
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
