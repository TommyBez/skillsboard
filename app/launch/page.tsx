import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowDownIcon,
  CheckIcon,
  ExternalLinkIcon,
  PlayIcon,
} from "lucide-react"

import { Brand } from "@/components/brand"
import {
  LaunchCta,
  LaunchFooterLink,
  LaunchHeader,
} from "@/components/launch/launch-actions"
import { Button } from "@/components/ui/button"
import { launchIsPublic, launchPath } from "@/lib/launch"
import { siteConfig } from "@/lib/site"

const description =
  "Introducing Skills Board: a shared, searchable library for the AI skills your team recommends."

export const metadata: Metadata = {
  title: { absolute: "Introducing Skills Board" },
  description,
  alternates: { canonical: launchPath },
  robots: launchIsPublic
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    url: launchPath,
    title: "Introducing Skills Board",
    description,
    images: [
      {
        url: "/launch/skills-board-launch-og.jpg",
        width: 1200,
        height: 630,
        alt: "Introducing Skills Board: a shared answer to which skill should I use?",
      },
    ],
  },
}

const demoSteps = [
  {
    index: "01",
    title: "Alex saves what worked",
    copy: "The source, a team note, an example prompt, and useful tags stay together.",
  },
  {
    index: "02",
    title: "The recommendation becomes shared",
    copy: "It is available to teammates in the same library, not buried in a private bookmark.",
  },
  {
    index: "03",
    title: "Sam finds and uses it",
    copy: "Search leads back to the source, a compatible command, or the latest skill files.",
  },
] as const

const availableNow = [
  "Shared team libraries with invitations and roles",
  "Search, tags, collections, notes, and example prompts",
  "Original source, compatible install command, and latest ZIP",
  "Optional MCP access with explicit scopes",
] as const

const boundaries = [
  "A recommendation is not a security review or compatibility certification.",
  "Skills Board follows the latest version at the saved source; it does not pin historical versions.",
  "MCP can search and organize the library, but it does not install or execute skills in your agent.",
] as const

export default function LaunchPage() {
  if (!launchIsPublic && process.env.VERCEL_ENV === "production") {
    notFound()
  }

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <LaunchHeader />

      <main>
        <article>
          <header className="relative isolate border-b border-border/70">
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-80"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle at 76% 18%, color-mix(in oklch, var(--primary) 20%, transparent), transparent 30rem)",
              }}
            />
            <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.62fr)] lg:items-end lg:py-28">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Introducing Skills Board
                </p>
                <h1 className="mt-6 max-w-[14ch] text-balance text-5xl font-semibold leading-[0.94] tracking-display md:text-7xl">
                  We built a shared answer to “which skill should I use?”
                </h1>
                <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Skills Board keeps the AI skills a team recommends in one searchable library. Save the source, add the context that matters, and let each teammate choose the path that fits their setup.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <LaunchCta location="launch_hero" />
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-[3px]"
                    nativeButton={false}
                    render={<a href="#demo" />}
                  >
                    Watch the demo
                    <ArrowDownIcon data-icon="inline-end" />
                  </Button>
                </div>
                <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Free forever · Open source
                </p>
              </div>

              <aside className="border border-border bg-card/85 p-6 shadow-sm backdrop-blur-sm md:p-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  The launch note
                </p>
                <p className="mt-6 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                  The useful part is not only the skill URL. It is the team’s judgment around it.
                </p>
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  That judgment was disappearing into chat threads, private bookmarks, and individual agent setups. Skills Board gives it a shared home.
                </p>
              </aside>
            </div>
          </header>

          <section id="demo" aria-labelledby="demo-heading" className="scroll-mt-20 border-b border-border/70">
            <div className="mx-auto w-full max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,34rem)] md:items-end">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    The handoff, not a feature tour
                  </p>
                  <h2
                    id="demo-heading"
                    className="mt-4 max-w-[15ch] text-balance text-4xl font-semibold leading-none tracking-display md:text-6xl"
                  >
                    See the team loop in 62 seconds.
                  </h2>
                </div>
                <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-right">
                  Recorded from the current product with synthetic identities and a public skill. No customer data or staged prototype.
                </p>
              </div>

              <div className="surface-shadow mt-10 overflow-hidden border border-border bg-card">
                <video
                  className="aspect-[8/5] h-auto w-full bg-[#f4f3e9]"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/launch/skills-board-product-demo-poster.jpg"
                  aria-label="Skills Board product demo: one teammate saves a skill and another finds and uses it"
                >
                  <source src="/launch/skills-board-product-demo.mp4" type="video/mp4" />
                  <track
                    kind="captions"
                    src="/launch/skills-board-product-demo.vtt"
                    srcLang="en"
                    label="English"
                  />
                  Your browser does not support embedded video.
                </video>
              </div>

              <ol className="mt-8 grid border border-border lg:grid-cols-3">
                {demoSteps.map((step, index) => (
                  <li
                    key={step.index}
                    className={`min-h-56 p-6 md:p-8 ${index > 0 ? "border-t border-border lg:border-l lg:border-t-0" : ""}`}
                  >
                    <p className="font-mono text-xs font-semibold tracking-[0.18em] text-primary">
                      {step.index}
                    </p>
                    <h3 className="mt-10 text-2xl font-semibold tracking-tight">
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

          <section aria-labelledby="available-heading" className="border-b border-border/70">
            <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Available now
                </p>
                <h2
                  id="available-heading"
                  className="mt-4 max-w-[13ch] text-balance text-4xl font-semibold leading-none tracking-display md:text-5xl"
                >
                  One library. Different agents and setups.
                </h2>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  Skills Board keeps the recommendation shared without pretending every teammate works the same way.
                </p>
              </div>

              <ul className="divide-y divide-border border-y border-border">
                {availableNow.map((item) => (
                  <li key={item} className="flex gap-4 py-6">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center bg-primary/12 text-primary">
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </span>
                    <p className="text-pretty text-lg leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="boundaries-heading">
            <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-16">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  What it does not promise
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
        </article>
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
            <a
              href="#demo"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              Demo
              <PlayIcon className="size-3.5" aria-hidden="true" />
            </a>
            <LaunchFooterLink />
          </nav>
        </div>
      </footer>
    </div>
  )
}
