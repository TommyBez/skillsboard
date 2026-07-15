import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { CopyButton } from "@/components/copy-button"
import { KineticMarquee } from "@/components/landing/kinetic-marquee"
import { SpotlightCard } from "@/components/landing/spotlight-card"
import { StickyStack } from "@/components/landing/sticky-stack"
import { HeroEntrance, HeroItem, Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { getLeaderboard, type CatalogSkill } from "@/lib/skills-sh"

const exampleCommand = "npx skills add https://github.com/vercel-labs/skills --skill find-skills"

const mcpConfig = `{
  "mcpServers": {
    "skills-board": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}`

function formatInstalls(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(count)
}

export default async function HomePage() {
  const session = await getSession()
  const primaryHref = session?.user ? "/library" : "/sign-up"
  const primaryLabel = session?.user ? "Open team library" : "Create your team library"

  let trending: CatalogSkill[] = []
  try {
    trending = (await getLeaderboard("trending")).slice(0, 6)
  } catch {
    trending = []
  }

  const stackCards = [
    {
      index: "01",
      verb: "Collect",
      copy: "Move the skills worth keeping out of bookmarks, Slack threads, and local config files. Every saved skill stays linked to its GitHub source.",
      artifact: (
        <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-4 py-3">
          <code className="truncate font-mono text-xs text-muted-foreground md:text-sm">{exampleCommand}</code>
          <CopyButton value={exampleCommand} />
        </div>
      ),
    },
    {
      index: "02",
      verb: "Share",
      copy: "Give product, design, and engineering the same trusted collection. Teammates can find the right skill and copy the install command without asking around.",
      artifact: (
        <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-background/60 p-4">
          {[
            ["ana@team.dev", "owner"],
            ["luca@team.dev", "member"],
            ["mei@team.dev", "member"],
          ].map(([email, role]) => (
            <div key={email} className="flex items-center justify-between font-mono text-xs md:text-sm">
              <span className="text-foreground">{email}</span>
              <span className="text-muted-foreground">{role}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      index: "03",
      verb: "Connect",
      copy: "Let MCP-compatible agents search the same library your team uses. OAuth keeps organization access scoped without adding another API key.",
      artifact: (
        <div className="w-full rounded-lg border border-border bg-background/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">mcp.json</span>
            <CopyButton value={mcpConfig} />
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed"><code>{mcpConfig}</code></pre>
        </div>
      ),
    },
  ]

  return (
    <main className="dark min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 md:px-8">
          <Brand />
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {!session?.user && (
              <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
                Sign in
              </Button>
            )}
            <Button nativeButton={false} render={<Link href={primaryHref} />}>
              {primaryLabel} <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Editorial manifesto hero */}
      <section className="relative border-b border-border/60">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
          <HeroEntrance className="flex flex-col gap-8">
            <HeroItem>
              <h1 className="max-w-[16ch] text-balance text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.98] tracking-tight">
                One trusted skill library for your whole product team.
              </h1>
            </HeroItem>
            <HeroItem>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
                  Curate the skills your product, design, and engineering teams use with AI agents. Keep each one connected to GitHub, ready to install, and available through MCP.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" nativeButton={false} render={<Link href={primaryHref} />}>
                    {primaryLabel} <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                  <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/discover" />}>
                    Explore skills
                  </Button>
                </div>
              </div>
            </HeroItem>
          </HeroEntrance>
        </div>
      </section>

      <KineticMarquee />

      {/* Sticky-stack scrolltelling: Collect / Share / Connect */}
      <section aria-label="How Skills Board works">
        <StickyStack
          cards={stackCards.map((card) => (
            <div key={card.index} className="w-full border-b border-border/60 bg-background">
              <div className="mx-auto grid min-h-[100dvh] max-w-[1360px] content-center gap-10 px-4 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:px-8">
                <div className="flex min-w-0 flex-col gap-5">
                  <span className="font-mono text-sm text-primary">{card.index}</span>
                  <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-none tracking-tight">
                    {card.verb}
                  </h2>
                  <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">{card.copy}</p>
                </div>
                <div className="flex min-w-0 items-center">{card.artifact}</div>
              </div>
            </div>
          ))}
        />
      </section>

      {/* Live registry index with real skills.sh data */}
      <section className="border-b border-border/60">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8 px-4 py-16 md:px-8 md:py-24">
          <Reveal className="flex items-end justify-between gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">Trending this week</h2>
            <Button variant="ghost" nativeButton={false} render={<Link href="/discover" />}>
              View all <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </Reveal>
          {trending.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {trending.map((skill, i) => (
                <Reveal key={skill.id} delay={Math.min(i * 0.05, 0.2)}>
                  <SpotlightCard className="h-full">
                    <div className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-sm text-foreground">{skill.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatInstalls(skill.installs)} installs
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{skill.description}</p>
                      <span className="mt-auto font-mono text-xs text-primary">{skill.source}</span>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Live catalog data appears here once discovery is connected. Browse the registry inside the app.
            </p>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section>
        <div className="mx-auto flex max-w-[1360px] flex-col items-start gap-8 px-4 py-20 md:px-8 md:py-32">
          <Reveal className="flex flex-col items-start gap-8">
            <p className="font-mono text-sm text-primary">Free to use. Open source by default.</p>
            <h2 className="max-w-[16ch] text-balance text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[1.02] tracking-tight">
              Give your team one place for the skills you actually use.
            </h2>
            <Button size="lg" nativeButton={false} render={<Link href={primaryHref} />}>
              {primaryLabel} <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-8 font-mono text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Brand />
          <p>one trusted skill library for product teams and their agents</p>
        </div>
      </footer>
    </main>
  )
}
