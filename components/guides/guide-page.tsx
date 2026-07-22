import Link from "next/link"
import { ArrowRightIcon, CheckIcon, ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import {
  ResourceCta,
  ResourceFooter,
  ResourceHeader,
} from "@/components/resources/resource-chrome"
import { buildGuideSchema } from "@/lib/seo/guide-schema"
import type { GuideDefinition } from "@/lib/seo/guides"
import { getRelatedResources, resourcePaths } from "@/lib/seo/resources"

const chapters = [
  { href: "#decision", label: "Choose a model" },
  { href: "#workflow", label: "Run the workflow" },
  { href: "#record", label: "Keep the record" },
  { href: "#pitfalls", label: "Avoid pitfalls" },
  { href: "#checklist", label: "Use the checklist" },
] as const

export function GuidePage({ guide }: { guide: GuideDefinition }) {
  const relatedResources = getRelatedResources(guide.path)

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <JsonLd data={buildGuideSchema(guide)} />

      <ResourceHeader landingPath={guide.path} location="guide_header" />

      <main>
        <article>
          <header className="relative isolate border-b border-border/70">
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-70"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle at 78% 8%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 34rem)",
              }}
            />
            <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
              <div>
                <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href={resourcePaths.index} className="transition-colors hover:text-foreground">
                    Resources
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">Guide</span>
                </nav>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {guide.eyebrow}
                </p>
                <h1 className="mt-5 max-w-[18ch] text-balance text-5xl font-semibold leading-[0.95] tracking-display md:text-7xl">
                  {guide.title}
                </h1>
                <p className="mt-7 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {guide.intro}
                </p>
              </div>
              <div className="border-l-2 border-primary pl-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Core principle
                </p>
                <p className="mt-3 text-pretty text-base font-medium leading-relaxed">
                  One canonical source. One visible recommendation. Explicit setup for every agent path.
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-5 py-14 md:px-10 md:py-20 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                In this guide
              </p>
              <nav aria-label="Guide chapters" className="mt-4 border-l border-border">
                {chapters.map((chapter) => (
                  <a
                    key={chapter.href}
                    href={chapter.href}
                    className="block border-l border-transparent px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {chapter.label}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 max-w-4xl">
              <section aria-labelledby="problem-heading">
                <h2 id="problem-heading" className="text-3xl font-semibold tracking-tight md:text-4xl">
                  The problem behind the query
                </h2>
                <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
                  {guide.problem}
                </p>
              </section>

              <section id="decision" aria-labelledby="decision-heading" className="scroll-mt-24 pt-16">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  01 / Decision
                </p>
                <h2 id="decision-heading" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {guide.decisionTitle}
                </h2>
                <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
                  {guide.decisionIntro}
                </p>

                <div className="mt-8 overflow-x-auto rounded-[3px] border border-border bg-card">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/55">
                        {guide.comparisonColumns.map((column) => (
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
                      {guide.comparisonRows.map((row) => (
                        <tr key={row.label} className="border-b border-border/70 last:border-b-0">
                          <th scope="row" className="w-[24%] px-5 py-5 align-top text-sm font-semibold">
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
              </section>

              <section id="workflow" aria-labelledby="workflow-heading" className="scroll-mt-24 pt-16">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  02 / Workflow
                </p>
                <h2 id="workflow-heading" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {guide.stepsTitle}
                </h2>
                <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
                  {guide.stepsIntro}
                </p>

                <ol className="mt-9 border-t border-border">
                  {guide.steps.map((step, index) => (
                    <li
                      key={step.title}
                      className="grid gap-3 border-b border-border py-7 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-5"
                    >
                      <span className="font-mono text-sm font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{step.body}</p>
                        <p className="mt-4 border-l-2 border-primary/60 pl-4 text-sm font-medium leading-relaxed">
                          Output: {step.output}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section
                aria-label="Create a shared skill library"
                className="mt-16 rounded-[3px] bg-[var(--surface-ink)] px-6 py-8 text-[var(--surface-ink-foreground)] md:px-9 md:py-10"
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Make the recommendation findable
                </p>
                <p className="mt-4 max-w-2xl text-pretty text-2xl font-semibold leading-tight md:text-3xl">
                  Skills Board keeps the source, install path, notes, and team recommendation in one searchable library.
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-[color-mix(in_oklch,var(--surface-ink-foreground)_72%,transparent)]">
                  It does not silently synchronize every agent. Your team keeps control of the reviewed source and chooses the path that fits each setup.
                </p>
                <div className="mt-7">
                  <ResourceCta landingPath={guide.path} location="guide_inline" />
                </div>
              </section>

              <section id="record" aria-labelledby="record-heading" className="scroll-mt-24 pt-16">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  03 / Record
                </p>
                <h2 id="record-heading" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {guide.templateTitle}
                </h2>
                <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
                  {guide.templateIntro}
                </p>
                <dl className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border md:grid-cols-2">
                  {guide.templateFields.map((field) => (
                    <div key={field.label} className="bg-card p-5">
                      <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        {field.label}
                      </dt>
                      <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section id="pitfalls" aria-labelledby="pitfalls-heading" className="scroll-mt-24 pt-16">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  04 / Pitfalls
                </p>
                <h2 id="pitfalls-heading" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {guide.pitfallsTitle}
                </h2>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {guide.pitfalls.map((pitfall) => (
                    <div key={pitfall.title} className="rounded-[3px] border border-border bg-card p-5">
                      <h3 className="font-semibold">{pitfall.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pitfall.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="checklist" aria-labelledby="checklist-heading" className="scroll-mt-24 pt-16">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  05 / Checklist
                </p>
                <h2 id="checklist-heading" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Ready to share with the team?
                </h2>
                <ul className="mt-8 space-y-3">
                  {guide.checklist.map((item) => (
                    <li key={item} className="flex gap-3 rounded-[3px] border border-border bg-card px-4 py-4">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="sources-heading" className="pt-16">
                <h2 id="sources-heading" className="text-2xl font-semibold tracking-tight">
                  Primary sources
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Product behavior changes. Use these official sources to verify current agent-specific setup before rollout.
                </p>
                <ul className="mt-6 space-y-4">
                  {guide.sources.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                      >
                        {source.label}
                        <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                      </a>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{source.note}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {relatedResources.length > 0 ? (
                <section className="mt-16 border-y border-border py-8">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        More resources
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Keep exploring
                      </h2>
                    </div>
                    <Link
                      href={resourcePaths.index}
                      className="text-sm font-semibold text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                    >
                      View all resources
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-4">
                    {relatedResources.map((resource) => (
                      <Link
                        key={resource.path}
                        href={resource.path}
                        className="group grid gap-3 rounded-[3px] border border-border bg-card p-5 transition-colors hover:border-primary/70 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                      >
                        <span>
                          <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                            {resource.contentType}
                          </span>
                          <span className="mt-2 block text-lg font-semibold group-hover:text-primary">
                            {resource.title}
                          </span>
                          <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                            {resource.description}
                          </span>
                        </span>
                        <ArrowRightIcon className="size-5 text-primary" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="py-16 text-center">
                <p className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                  Give the next teammate one trusted place to start.
                </p>
                <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                  Save the reviewed skill, document the path that works, and keep the recommendation visible to the whole team.
                </p>
                <div className="mt-7 flex justify-center">
                  <ResourceCta landingPath={guide.path} location="guide_closing" />
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>

      <ResourceFooter />
    </div>
  )
}
