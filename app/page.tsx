import { Suspense } from "react"
import Link from "next/link"
import { connection } from "next/server"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  GitBranchIcon,
  LibraryBigIcon,
  NetworkIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { Brand } from "@/components/brand"
import { CopyButton } from "@/components/copy-button"
import { KineticMarquee } from "@/components/landing/kinetic-marquee"
import { HeroEntrance, HeroItem, MotionRuntime, Reveal } from "@/components/motion/reveal"
import { SkillDossier } from "@/components/skill-dossier"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { getLeaderboard, type CatalogSkill } from "@/lib/skills-sh"

const exampleCommand = "npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend"

const mcpConfig = `{
  "mcpServers": {
    "skills-board": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}`

const fallbackSkills: CatalogSkill[] = [
  {
    id: "vercel-labs/skills:find-skills",
    name: "find-skills",
    slug: "find-skills",
    description: "Discover agent skills that match the work in front of you.",
    source: "vercel-labs/skills",
    owner: "vercel-labs",
    repo: "skills",
    installUrl: "https://github.com/vercel-labs/skills",
    installs: 0,
  },
  {
    id: "Leonxlnx/taste-skill:design-taste-frontend",
    name: "design-taste-frontend",
    slug: "design-taste-frontend",
    description: "Audit and redesign frontend experiences with a strict anti-slop discipline.",
    source: "Leonxlnx/taste-skill",
    owner: "Leonxlnx",
    repo: "taste-skill",
    installUrl: "https://github.com/Leonxlnx/taste-skill",
    installs: 0,
  },
]

function formatInstalls(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k installs`
  return count > 0 ? `${count.toLocaleString()} installs` : undefined
}

function commandFor(skill: CatalogSkill) {
  return `npx skills add ${skill.installUrl} --skill ${skill.slug}`
}

async function loadTrendingSkills() {
  if (process.env.VERCEL !== "1" && !process.env.VERCEL_OIDC_TOKEN) return []

  try {
    return (await getLeaderboard("trending")).slice(0, 5)
  } catch {
    return []
  }
}

function primaryAction(signedIn: boolean) {
  return signedIn
    ? { href: "/library", label: "Open team library", mobileLabel: "Library" }
    : { href: "/sign-up", label: "Create your team library", mobileLabel: "Create" }
}

function HomeHeaderActionsView({ signedIn = false }: { signedIn?: boolean }) {
  const primary = primaryAction(signedIn)

  return (
    <nav className="flex items-center gap-1.5" aria-label="Main navigation">
      {!signedIn ? (
        <Button size="sm" variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>Sign in</Button>
      ) : null}
      <Button size="sm" className="sm:h-10 sm:px-4" nativeButton={false} render={<Link href={primary.href} />}>
        <span className="hidden sm:inline">{primary.label}</span>
        <span className="sm:hidden">{primary.mobileLabel}</span>
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
        {primary.label}<ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button size="lg" variant="outline" nativeButton={false} render={<Link href={signedIn ? "/discover" : "#catalog"} />}>
        Explore skills
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
        {primary.label}<ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button size="lg" variant="outline" nativeButton={false} render={<a href="https://github.com/TommyBez/skillsboard" target="_blank" rel="noreferrer" aria-label="View Skills Board source on GitHub" />}>
        View source<ArrowUpRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

async function HomeFinalActions() {
  const session = await getSession()
  return <HomeFinalActionsView signedIn={Boolean(session?.user)} />
}

function HeroSkillCards({ skills }: { skills: CatalogSkill[] }) {
  return (
    <HeroEntrance className="relative mx-auto grid w-full max-w-xl gap-3 lg:mx-0">
      {skills.map((skill, index) => (
        <HeroItem key={skill.id} className={index === 1 ? "min-w-0 ml-5 md:ml-14" : "min-w-0 mr-5 md:mr-14"}>
          <SkillDossier
            compact
            headingLevel="h2"
            name={skill.name}
            description={skill.description}
            source={skill.source}
            command={commandFor(skill)}
            metric={formatInstalls(skill.installs)}
            href={`https://skills.sh/${skill.source}/${skill.slug}`}
            hrefLabel="Skill details"
          />
        </HeroItem>
      ))}
    </HeroEntrance>
  )
}

async function TrendingHeroSkills() {
  await connection()
  const trending = await loadTrendingSkills()
  return <HeroSkillCards skills={trending.length >= 2 ? trending.slice(0, 2) : fallbackSkills} />
}

function CatalogSkills({ skills }: { skills: CatalogSkill[] }) {
  return skills.length ? (
    <div className="mt-12 grid gap-4 lg:grid-cols-12">
      <Reveal className="lg:col-span-7">
        <SkillDossier
          featured
          name={skills[0].name}
          description={skills[0].description}
          source={skills[0].source}
          command={commandFor(skills[0])}
          metric={formatInstalls(skills[0].installs)}
          href={`https://skills.sh/${skills[0].source}/${skills[0].slug}`}
          hrefLabel="Skill details"
        />
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
        {skills.slice(1).map((skill, index) => (
          <Reveal key={skill.id} delay={Math.min(index * 0.05, 0.15)}>
            <SkillDossier
              compact
              name={skill.name}
              description={skill.description}
              source={skill.source}
              command={commandFor(skill)}
              metric={formatInstalls(skill.installs)}
              href={`https://skills.sh/${skill.source}/${skill.slug}`}
              hrefLabel="Skill details"
            />
          </Reveal>
        ))}
      </div>
    </div>
  ) : (
    <Reveal className="mt-12 rounded-2xl border border-border bg-card p-8 md:p-12">
      <h3 className="text-2xl font-semibold tracking-[-0.03em]">The live catalog is unavailable here.</h3>
      <p className="mt-2 max-w-xl text-muted-foreground">Open Discover in a connected deployment to search current skills.sh data.</p>
    </Reveal>
  )
}

async function TrendingCatalog() {
  await connection()
  return <CatalogSkills skills={await loadTrendingSkills()} />
}

export default function HomePage() {

  return (
    <MotionRuntime>
      <main className="app-canvas min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/75 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
          <Brand />
          <Suspense fallback={<HomeHeaderActionsView />}>
            <HomeHeaderActions />
          </Suspense>
        </div>
      </header>

      <section className="border-b border-border/70">
        <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[1440px] items-center gap-12 px-4 py-12 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(25rem,0.95fr)] lg:gap-16 lg:py-8">
          <HeroEntrance className="flex min-w-0 flex-col items-start gap-7">
            <HeroItem>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">The team skill library</p>
            </HeroItem>
            <HeroItem>
              <h1 className="max-w-[13ch] text-balance text-[clamp(3.4rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
                Keep the skills your team uses.
              </h1>
            </HeroItem>
            <HeroItem>
              <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                A shared, GitHub-backed library for people and agents. Free to use and built for product teams.
              </p>
            </HeroItem>
            <HeroItem>
              <Suspense fallback={<HomeHeroActionsView />}>
                <HomeHeroActions />
              </Suspense>
            </HeroItem>
          </HeroEntrance>

          <Suspense fallback={<HeroSkillCards skills={fallbackSkills} />}>
            <TrendingHeroSkills />
          </Suspense>
        </div>
      </section>

      <section aria-label="Skills in the open ecosystem">
        <KineticMarquee />
      </section>

      <section className="border-b border-border/70">
        <Reveal className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-36">
          <p className="max-w-[18ch] text-balance text-[clamp(2.8rem,6vw,5.7rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            Bookmarks remember links. A team library remembers decisions.
          </p>
        </Reveal>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="max-w-[12ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">
              From useful find to shared standard.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Skills Board connects public discovery, team curation, and agent access without inventing another skill format.
            </p>
          </Reveal>

          <div className="border-t border-border">
            {[
              { icon: SearchIcon, title: "Discover", copy: "Search skills.sh from the same place your team keeps its approved collection." },
              { icon: LibraryBigIcon, title: "Curate", copy: "Save a GitHub-backed reference with tags, context, and a ready install command." },
              { icon: NetworkIcon, title: "Use everywhere", copy: "Give teammates and MCP-compatible agents access to the same organization library." },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06} className="grid gap-5 border-b border-border py-8 sm:grid-cols-[3.5rem_1fr] md:py-10">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em]">{item.title}</h3>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <h2 className="max-w-[13ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">
              Open ecosystem. Deliberate team memory.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(15rem,auto)]">
            <Reveal className="lg:col-span-7 lg:row-span-2">
              <div className="focus-frame flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-primary p-6 text-primary-foreground md:p-8">
                <GitBranchIcon className="size-8" aria-hidden="true" />
                <div className="mt-20">
                  <h3 className="max-w-[12ch] text-4xl font-semibold leading-none tracking-[-0.045em] md:text-6xl">Keep GitHub as the source.</h3>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80 md:text-lg">
                    Skills Board stores references, not detached copies. Your team keeps the open repositories and install conventions it already trusts.
                  </p>
                </div>
                <div className="mt-8 flex min-w-0 items-center gap-3 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs md:text-sm">{exampleCommand}</code>
                  <CopyButton value={exampleCommand} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.06} className="lg:col-span-5">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 md:p-8">
                <UsersIcon className="size-7 text-primary" aria-hidden="true" />
                <div className="mt-14">
                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">One library per team.</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">Organization access gives product, design, and engineering the same approved collection.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="lg:col-span-5">
              <div className="ink-panel flex h-full flex-col justify-between rounded-2xl p-6 md:p-8">
                <NetworkIcon className="size-7 text-primary" aria-hidden="true" />
                <div className="mt-14">
                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">Agents get the same answer.</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_68%,transparent)]">Authenticated MCP exposes the library without another API key or proprietary format.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="catalog" className="scroll-mt-20 border-b border-border/70">
        <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
          <Reveal className="flex flex-col items-start gap-5">
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Trending in the open catalog</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">A live view of the skills teams are exploring on skills.sh.</p>
          </Reveal>

          <Suspense fallback={<CatalogSkills skills={[]} />}>
            <TrendingCatalog />
          </Suspense>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
          <div className="ink-panel overflow-hidden rounded-2xl">
            <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-14">
              <Reveal>
                <NetworkIcon className="size-8 text-primary" aria-hidden="true" />
                <h2 className="mt-8 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">Your library can answer agents.</h2>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_68%,transparent)]">
                  Connect once with OAuth. Compatible clients can list, search, and retrieve approved install commands.
                </p>
                <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
                  {["list_skills", "search_skills", "get_skill_command", "discover_skills"].map((tool) => (
                    <li key={tool} className="flex items-center gap-2 font-mono text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_78%,transparent)]">
                      <CheckIcon className="size-4 text-primary" aria-hidden="true" />{tool}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.08} className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_58%,transparent)]">mcp.json</span>
                  <CopyButton value={mcpConfig} label="Copy config" />
                </div>
                <pre className="overflow-x-auto font-mono text-xs leading-7 text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_84%,transparent)] md:text-sm"><code>{mcpConfig}</code></pre>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Reveal className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-4 py-24 md:px-8 md:py-36">
          <h2 className="max-w-[14ch] text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
            Stop rediscovering the same good work.
          </h2>
          <Suspense fallback={<HomeFinalActionsView />}>
            <HomeFinalActions />
          </Suspense>
        </Reveal>
      </section>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <Brand />
          <p className="max-w-md text-sm text-muted-foreground md:text-right">Free to use. Open source. Built for the product teams already working with agents.</p>
        </div>
      </footer>
      </main>
    </MotionRuntime>
  )
}
