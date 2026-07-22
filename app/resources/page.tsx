import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import {
  ResourceCta,
  ResourceFooter,
  ResourceHeader,
} from "@/components/resources/resource-chrome"
import { buildResourceIndexSchema } from "@/lib/seo/resource-schema"
import {
  resourceEntries,
  resourcePaths,
  resourceSections,
} from "@/lib/seo/resources"

const description =
  "Explore practical guides and articles for sharing, reviewing, and managing reusable AI skills across your team and agent workflows."

export const metadata: Metadata = {
  title: { absolute: "AI Skill Guides and Articles | Skills Board" },
  description,
  alternates: { canonical: resourcePaths.index },
  openGraph: {
    type: "website",
    url: resourcePaths.index,
    title: "Skills Board Resources",
    description,
  },
}

const populatedSections = resourceSections
  .map((section) => ({
    ...section,
    entries: resourceEntries.filter(
      (entry) => entry.contentType === section.contentType,
    ),
  }))
  .filter((section) => section.entries.length > 0)

export default function ResourcesPage() {
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <JsonLd data={buildResourceIndexSchema()} />
      <ResourceHeader landingPath={resourcePaths.index} location="resources_header" />

      <main>
        <header className="relative isolate border-b border-border/70">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 75% 10%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 32rem)",
            }}
          />
          <div className="mx-auto w-full max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Resources
            </p>
            <h1 className="mt-5 max-w-[16ch] text-balance text-5xl font-semibold leading-[0.95] tracking-display md:text-7xl">
              Practical thinking for teams working with AI skills.
            </h1>
            <p className="mt-7 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Start with step-by-step guides. As the library grows, this is also where you’ll find focused articles on the decisions, patterns, and trade-offs behind durable team workflows.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1320px] px-5 py-14 md:px-10 md:py-20">
          {populatedSections.map((section, sectionIndex) => (
            <section
              key={section.contentType}
              aria-labelledby={`${section.contentType}-heading`}
              className={sectionIndex > 0 ? "border-t border-border pt-14 md:pt-20" : undefined}
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,30rem)] md:items-end">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {String(sectionIndex + 1).padStart(2, "0")} / {section.contentType}
                  </p>
                  <h2
                    id={`${section.contentType}-heading`}
                    className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
                  >
                    {section.title}
                  </h2>
                </div>
                <p className="text-pretty leading-relaxed text-muted-foreground md:text-right">
                  {section.description}
                </p>
              </div>

              <div className="mt-9 grid gap-4 lg:grid-cols-2">
                {section.entries.map((entry) => (
                  <Link
                    key={entry.path}
                    href={entry.path}
                    className="group flex min-h-64 flex-col rounded-[3px] border border-border bg-card p-6 transition-colors hover:border-primary/70 md:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {entry.contentType}
                      </p>
                      <ArrowUpRightIcon
                        className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-8 max-w-[24ch] text-balance text-2xl font-semibold leading-tight transition-colors group-hover:text-primary md:text-3xl">
                      {entry.title}
                    </h3>
                    <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                      {entry.description}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-8" aria-label="Topics">
                      {entry.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-[3px] border border-border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-16 border-t border-border py-16 text-center md:mt-24 md:py-20">
            <p className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Turn a useful workflow into a team recommendation.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Keep the source, setup path, and operating notes in one searchable library your teammates can return to.
            </p>
            <div className="mt-7 flex justify-center">
              <ResourceCta landingPath={resourcePaths.index} location="resources_closing" />
            </div>
          </section>
        </div>
      </main>

      <ResourceFooter />
    </div>
  )
}
