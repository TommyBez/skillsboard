import { Suspense } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  BracesIcon,
  GitBranchIcon,
  NetworkIcon,
  SearchIcon,
} from "lucide-react"

import { Brand } from "@/components/brand"
import { CopyButton } from "@/components/copy-button"
import { TeamLibraryDemo } from "@/components/landing/team-library-demo"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"

const exampleCommand =
  "npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend"

const mcpExchange = `search_skills({ query: "frontend design" })

→ design-taste-frontend
  source: Leonxlnx/taste-skill
  tags: frontend, design

get_skill_command({ skillId: "<returned skill ID>" })

→ ${exampleCommand}`

function primaryAction(signedIn: boolean) {
  return signedIn
    ? { href: "/library", label: "Open your library" }
    : { href: "/sign-up", label: "Create your library" }
}

function HomeHeaderActionsView({ signedIn = false }: { signedIn?: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <nav className="flex items-center gap-1.5" aria-label="Main navigation">
      {!signedIn ? (
        <Button
          size="sm"
          variant="ghost"
          className="hidden sm:inline-flex"
          nativeButton={false}
          render={<Link href="/sign-in" />}
        >
          Sign in
        </Button>
      ) : null}
      <Button
        size="sm"
        className="sm:h-10 sm:px-4"
        nativeButton={false}
        render={<Link href={primary.href} />}
      >
        {primary.label}
        <ArrowRightIcon className="hidden sm:block" data-icon="inline-end" />
      </Button>
    </nav>
  )
}

async function HomeHeaderActions() {
  const session = await getSession()
  return <HomeHeaderActionsView signedIn={Boolean(session?.user)} />
}

function HomeHeroActionsView({ signedIn = false }: { signedIn?: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <div className="flex flex-wrap gap-3">
      <Button size="lg" nativeButton={false} render={<Link href={primary.href} />}>
        {primary.label}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button size="lg" variant="outline" nativeButton={false} render={<Link href="#how-it-works" />}>
        See how it works
      </Button>
    </div>
  )
}

async function HomeHeroActions() {
  const session = await getSession()
  return <HomeHeroActionsView signedIn={Boolean(session?.user)} />
}

function HomeFinalActionsView({ signedIn = false }: { signedIn?: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <div className="flex flex-wrap gap-3">
      <Button size="lg" nativeButton={false} render={<Link href={primary.href} />}>
        {primary.label}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        nativeButton={false}
        render={
          <a
            href="https://github.com/TommyBez/skillsboard"
            target="_blank"
            rel="noreferrer"
            aria-label="View Skills Board source on GitHub"
          />
        }
      >
        View source
        <ArrowUpRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

async function HomeFinalActions() {
  const session = await getSession()
  return <HomeFinalActionsView signedIn={Boolean(session?.user)} />
}

const journey = [
  {
    icon: SearchIcon,
    title: "Find",
    copy: "Search skills.sh and inspect the GitHub source before your team adopts it.",
    proof: (
      <a
        href="https://skills.sh/Leonxlnx/taste-skill/design-taste-frontend"
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center gap-2 font-mono text-xs text-foreground underline decoration-border underline-offset-4 hover:text-primary"
      >
        <span className="truncate">skills.sh/Leonxlnx/taste-skill/design-taste-frontend</span>
        <ArrowUpRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
      </a>
    ),
  },
  {
    icon: BadgeCheckIcon,
    title: "Save",
    copy: "Save the GitHub-backed reference, tags, and team context in one shared library.",
    proof: (
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span><strong className="font-medium text-foreground">Source</strong> GitHub</span>
        <span><strong className="font-medium text-foreground">Context</strong> Frontend design</span>
        <span><strong className="font-medium text-foreground">Access</strong> Product team</span>
      </div>
    ),
  },
  {
    icon: NetworkIcon,
    title: "Reuse",
    copy: "Copy the install command, or let an authenticated agent retrieve it through MCP.",
    proof: (
      <div className="flex min-w-0 items-center gap-2 rounded-xl bg-muted p-1.5 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
          {exampleCommand}
        </code>
        <CopyButton
          value={exampleCommand}
          compact
          ariaLabel="Copy the example install command"
          copiedAriaLabel="Example install command copied"
        />
      </div>
    ),
  },
]

export default function HomePage() {
  return (
      <main className="app-canvas min-h-[100dvh] overflow-x-clip bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border/75 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
            <Brand />
            <Suspense fallback={<HomeHeaderActionsView />}>
              <HomeHeaderActions />
            </Suspense>
          </div>
        </header>

        <section>
          <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[1440px] items-center gap-10 px-4 py-8 md:px-8 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(27rem,1.1fr)] lg:gap-14 lg:py-10">
            <div className="flex min-w-0 flex-col items-start gap-6">
              <h1 className="max-w-[19ch] text-balance text-[clamp(3rem,4.5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
                Keep the skills your team trusts.
              </h1>
              <div className="flex flex-col items-start gap-6">
                  <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                    Build a free team library for GitHub-backed skills, then give teammates and agents the same source, context, and install command.
                  </p>
                  <Suspense fallback={<HomeHeroActionsView />}>
                    <HomeHeroActions />
                  </Suspense>
              </div>
            </div>

            <div className="min-w-0 lg:pl-2">
                <TeamLibraryDemo />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-border/70 bg-card/45">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="max-w-[13ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">
                Find it once. Reuse it across your team.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                Discover through skills.sh, save the GitHub source with context, then install from your library or MCP.
              </p>
            </div>

            <div className="border-t border-border">
              {journey.map((item) => (
                <div
                  key={item.title}
                  className="grid gap-5 border-b border-border py-7 md:grid-cols-[3rem_minmax(9rem,0.55fr)_minmax(0,1.45fr)] md:items-start md:py-9"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.035em]">{item.title}</h3>
                    <p className="mt-2 max-w-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  </div>
                  <div className="min-w-0 md:pt-1">{item.proof}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-accent/30">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-20">
            <div>
              <NetworkIcon className="size-8 text-primary" aria-hidden="true" />
              <h2 className="mt-7 max-w-[12ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">
                Give agents the same library.
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Authenticated MCP lets agents search saved skills and retrieve the same GitHub-backed command your teammates copy.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <GitBranchIcon className="size-4 text-foreground" aria-hidden="true" />
                  GitHub-backed references
                </span>
                <span className="inline-flex items-center gap-2">
                  <BadgeCheckIcon className="size-4 text-foreground" aria-hidden="true" />
                  OAuth 2.1 access
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_22px_60px_hsl(var(--shadow-color)/0.09)]">
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <BracesIcon className="size-4 text-primary" aria-hidden="true" />
                    MCP search
                  </div>
                  <CopyButton
                    value={mcpExchange}
                    label="Copy example"
                    ariaLabel="Copy the example MCP search"
                    copiedAriaLabel="Example MCP search copied"
                  />
                </div>
                <pre className="whitespace-pre-wrap break-words p-5 font-mono text-xs leading-6 text-foreground sm:p-7 sm:text-sm sm:leading-7">
                  <code>{mcpExchange}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-7 px-4 py-20 md:px-8 md:py-28">
            <h2 className="max-w-[15ch] text-balance text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
              Stop asking where that skill went.
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Create one trusted library for the skills your product team and agents want to reuse.
            </p>
            <Suspense fallback={<HomeFinalActionsView />}>
              <HomeFinalActions />
            </Suspense>
          </div>
        </section>

        <footer className="border-t border-border/70">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
            <Brand />
            <p className="max-w-md text-sm text-muted-foreground md:text-right">
              Free to use. Open source. Built for product teams working with agents.
            </p>
          </div>
        </footer>
      </main>
  )
}
