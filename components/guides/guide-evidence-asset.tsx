import { ExternalLinkIcon } from "lucide-react"

import type { GuideEvidenceAsset } from "@/lib/seo/guides/types"

const evidenceDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

function formatEvidenceDate(value: string) {
  return evidenceDateFormatter.format(new Date(`${value}T00:00:00Z`))
}

export function GuideEvidenceAssetSection({ asset }: { asset: GuideEvidenceAsset }) {
  return (
    <section
      id="evidence-asset"
      aria-labelledby="evidence-asset-heading"
      className="scroll-mt-24 pt-16"
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {asset.eyebrow}
      </p>
      <h2
        id="evidence-asset-heading"
        className="mt-3 max-w-3xl text-pretty text-3xl font-semibold tracking-tight md:text-4xl"
      >
        {asset.title}
      </h2>
      <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
        {asset.summary}
      </p>

      <dl className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-3">
        <div className="bg-card p-5">
          <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Protocol version
          </dt>
          <dd className="mt-2 text-sm font-semibold">{asset.version}</dd>
        </div>
        <div className="bg-card p-5">
          <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Published
          </dt>
          <dd className="mt-2 text-sm font-semibold">
            <time dateTime={asset.publishedAt}>{formatEvidenceDate(asset.publishedAt)}</time>
          </dd>
        </div>
        <div className="bg-card p-5">
          <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Evidence status
          </dt>
          <dd className="mt-2 text-sm font-semibold">{asset.status}</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-8 border-y border-border py-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold">What the fixture measures</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {asset.scope.map((item) => (
              <li key={item} className="border-l-2 border-primary/60 pl-4">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold">What it cannot establish</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {asset.limitations.map((item) => (
              <li key={item} className="border-l-2 border-border pl-4">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-semibold">Reproducible method</h3>
      <ol className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {asset.methodology.map((step, index) => (
          <li key={step.title} className="rounded-[3px] border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h4 className="mt-3 font-semibold">{step.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[3px] bg-[var(--surface-ink)] px-6 py-7 text-[var(--surface-ink-foreground)] sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">Inspect, copy, and cite the complete protocol.</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color-mix(in_oklch,var(--surface-ink-foreground)_72%,transparent)]">
            The public Markdown file includes the fixture SKILL.md, exact prompt, pass criteria,
            blank result record, and version history.
          </p>
        </div>
        <a
          href={asset.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[3px] border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-white/35 hover:bg-white/15"
        >
          {asset.linkLabel}
          <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
