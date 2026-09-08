import { Suspense } from "react"
import Link from "next/link"

import { formatArticleDate } from "@/components/resources/article-parts"
import { SkillCheckForm } from "@/components/skill-check/skill-check-form"
import type { SkillCheckDefinition, SkillCheckNote } from "@/lib/seo/skill-check"
import { siteConfig } from "@/lib/site"

function NoteGrid({ entries }: { entries: readonly SkillCheckNote[] }) {
  return (
    <dl className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-2">
      {entries.map((note) => (
        <div key={note.title} className="bg-card p-5 md:p-6">
          <dt className="text-base font-semibold leading-snug">{note.title}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {note.body}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function SkillCheckPage({ entry }: { entry: SkillCheckDefinition }) {
  return (
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
            <dt className="font-semibold text-foreground">Checked against the spec</dt>
            <dd>
              <time dateTime={entry.specCheckedOn}>
                {formatArticleDate(entry.specCheckedOn)}
              </time>
            </dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="tool-heading" className="pt-12">
        <h2 id="tool-heading" className="sr-only">
          Check a repository
        </h2>
        <Suspense
          fallback={
            <p className="mt-9 rounded-[3px] border border-border bg-card p-5 text-sm text-muted-foreground md:p-6">
              Loading the checker.
            </p>
          }
        >
          <SkillCheckForm entry={entry} />
        </Suspense>
      </section>

      <section aria-labelledby="checks-heading" className="pt-14">
        <h2
          id="checks-heading"
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {entry.checks.title}
        </h2>
        <p className="mt-5 max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
          {entry.checks.intro}
        </p>
        <NoteGrid entries={entry.checks.entries} />
      </section>

      <section aria-labelledby="limits-heading" className="pt-14">
        <h2
          id="limits-heading"
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {entry.limits.title}
        </h2>
        <p className="mt-5 max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
          {entry.limits.intro}
        </p>
        <NoteGrid entries={entry.limits.entries} />
      </section>

      <section aria-labelledby="agents-heading" className="pt-14">
        <h2
          id="agents-heading"
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Reading the report from an agent
        </h2>
        <p className="mt-5 max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
          The page and the endpoint take the same parameter, so a report is a link. Add
          <code className="mx-1 rounded-[3px] border border-border bg-card px-1.5 py-0.5 font-mono text-[0.8rem]">
            format=md
          </code>
          for the same report as Markdown, or send an Accept header asking for
          text/markdown.
        </p>
        <pre className="mt-6 overflow-auto rounded-[3px] border border-border bg-card p-4 font-mono text-[0.78rem] leading-6">
          <code>{`${siteConfig.url}/api/check?url=https://github.com/owner/repo&format=md`}</code>
        </pre>
      </section>

      <section aria-labelledby="related-heading" className="pt-14">
        <h2
          id="related-heading"
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Keep going
        </h2>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-3">
          {entry.related.map((link) => (
            <li key={link.href} className="bg-card p-5 md:p-6">
              <Link
                href={link.href}
                className="text-base font-semibold underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
              >
                {link.label}
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {link.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
