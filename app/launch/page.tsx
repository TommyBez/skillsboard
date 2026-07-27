import type { Metadata } from "next"
import Link from "next/link"
import {
  CableIcon,
  ExternalLinkIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { Brand } from "@/components/brand"
import {
  LaunchCta,
  LaunchFooterLink,
  LaunchHeader,
} from "@/components/launch/launch-actions"
import { Button } from "@/components/ui/button"
import { launchPath } from "@/lib/launch"
import { siteConfig } from "@/lib/site"

const description =
  "Keep the AI skills your team recommends in one searchable library, then use the source, command, ZIP, or MCP access that fits each teammate."

export const metadata: Metadata = {
  title: { absolute: "Meet Skills Board, the shared AI skill library for teams" },
  description,
  alternates: { canonical: launchPath },
  openGraph: {
    type: "website",
    url: launchPath,
    title: "Your team’s skills. All in one place.",
    description,
  },
}

const workflow = [
  {
    index: "01",
    title: "Add a recommendation",
    copy: "Save a useful skill from its GitHub source so the whole team can find it again.",
  },
  {
    index: "02",
    title: "Make it easy to find",
    copy: "Search the shared library and organize recommendations with team-specific tags and collections.",
  },
  {
    index: "03",
    title: "Let each teammate choose",
    copy: "Open the original source, copy a compatible command, or download the latest skill files as a ZIP.",
  },
] as const

const boundaries = [
  "A saved skill is a team recommendation, not a security review or compatibility certification.",
  "Skills Board follows the latest version available from the saved source; it does not preserve historical versions.",
  "MCP access can search and organize the library with granted scopes, but it does not install or execute skills in your agent.",
] as const

export default function LaunchPage() {
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <LaunchHeader />

      <main>
        <section className="relative isolate border-b border-border/70">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 72% 18%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 31rem)",
            }}
          />
          <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.65fr)] lg:items-end lg:py-28">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Shared AI skill library
              </p>
              <h1 className="mt-6 max-w-[15ch] text-balance text-5xl font-semibold leading-[0.94] tracking-display md:text-7xl">
                Your team already knows useful AI skills. Put them somewhere everyone can find.
              </h1>
              <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                Skills Board gives teammates one searchable place for the skills they recommend, without forcing everyone into the same agent or setup.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LaunchCta location="launch_hero" />
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-[3px]"
                  nativeButton={false}
                  render={(
                    <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" />
                  )}
                >
                  View the source
                  <ExternalLinkIcon data-icon="inline-end" />
                </Button>
              </div>
              <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Free forever · Open source
              </p>
            </div>

            <div className="border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                The familiar problem
              </p>
              <blockquote className="mt-6 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                “Which skill should I use for this?”
              </blockquote>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Answer once by adding the recommendation to the team library. The next teammate can search instead of asking from scratch.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="workflow-heading" className="border-b border-border/70">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,34rem)] md:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  One shared loop
                </p>
                <h2
                  id="workflow-heading"
                  className="mt-4 max-w-[15ch] text-balance text-4xl font-semibold leading-none tracking-display md:text-6xl"
                >
                  Save once. Find fast. Use it your way.
                </h2>
              </div>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-right">
                Keep the team’s judgment in one place while leaving the original source and usage choices visible.
              </p>
            </div>

            <ol className="mt-12 grid border border-border lg:grid-cols-3">
              {workflow.map((step, index) => (
                <li
                  key={step.index}
                  className={`min-h-64 p-6 md:p-8 ${index > 0 ? "border-t border-border lg:border-l lg:border-t-0" : ""}`}
                >
                  <p className="font-mono text-xs font-semibold tracking-[0.18em] text-primary">
                    {step.index}
                  </p>
                  <h3 className="mt-12 text-2xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {step.copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="agents-heading" className="border-b border-border/70">
          <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex size-11 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                <UsersIcon className="size-5" aria-hidden="true" />
              </div>
              <h2
                id="agents-heading"
                className="mt-6 max-w-[15ch] text-balance text-4xl font-semibold leading-none tracking-display md:text-5xl"
              >
                One library for a team using different agents.
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Claude, Codex, Cursor, or another setup: teammates can draw from the same recommendations and choose the path that fits their tools.
              </p>
            </div>

            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              <div className="bg-card p-6 md:p-7">
                <SearchIcon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-8 text-xl font-semibold">Search the library</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Find skills by task, problem, or the tags your team uses.
                </p>
              </div>
              <div className="bg-card p-6 md:p-7">
                <CableIcon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-8 text-xl font-semibold">Connect through MCP</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Sign in through the browser and grant only the scopes your compatible agent needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="boundaries-heading">
          <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Clear by design
              </p>
              <h2
                id="boundaries-heading"
                className="mt-4 text-balance text-4xl font-semibold leading-none tracking-display md:text-5xl"
              >
                A recommendation stays a recommendation.
              </h2>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {boundaries.map((boundary) => (
                <li key={boundary} className="flex gap-4 py-6">
                  <span className="mt-1 font-mono text-xs font-semibold text-primary" aria-hidden="true">
                    /
                  </span>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {boundary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border/70 bg-card">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 py-16 md:px-10 md:py-20 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Start with one useful skill
              </p>
              <h2 className="mt-4 max-w-[16ch] text-balance text-4xl font-semibold leading-none tracking-display md:text-5xl">
                Create the library your teammates can return to.
              </h2>
              <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Add the first recommendation, then invite a teammate or connect a compatible agent through MCP.
              </p>
            </div>
            <div className="shrink-0">
              <LaunchCta location="launch_closing" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-9 md:flex-row md:items-center md:justify-between md:px-10">
          <Brand />
          <nav
            aria-label="Launch page footer"
            className="flex flex-wrap items-center gap-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Link href="/resources" className="transition-colors hover:text-foreground">
              Resources
            </Link>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
            <LaunchFooterLink />
          </nav>
        </div>
      </footer>
    </div>
  )
}
