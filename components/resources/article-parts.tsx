import { ExternalLinkIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"

/**
 * Presentational parts shared by the resource articles that answer a head
 * query on their own route (/claude-skills, /codex-skills). The content lives
 * in `lib/seo/<article>`; these components only render it, so a second article
 * does not fork the markup, the table semantics, or the focus styles.
 *
 * The props are structural on purpose: every article defines its own source
 * and section types, and they all satisfy the shapes below.
 */

export interface ArticleSourceLike {
  id: string
  label: string
  href: string
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

export function formatArticleDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

export function SectionSources({
  sourceIds,
  sources,
}: {
  sourceIds: readonly string[]
  sources: readonly ArticleSourceLike[]
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

export function SectionHeading({
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

export function SectionTable({
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

export function NoteList({ notes }: { notes: readonly string[] }) {
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

export function StepList({
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

export function CodeBlock({
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
