import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeftIcon, SearchIcon, SparklesIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { SkillDossier } from "@/components/skill-dossier"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"
import { listOrganizationSkills } from "@/lib/db/queries"
import { getCuratedSkills, getLeaderboard, searchCatalog } from "@/lib/skills-sh"

interface DiscoverPageProps {
  searchParams: Promise<{ q?: string; view?: "trending" | "hot" | "all-time" | "curated" }>
}

const catalogViews = [
  { value: "trending", label: "Trending" },
  { value: "hot", label: "Hot" },
  { value: "all-time", label: "All time" },
  { value: "curated", label: "Curated" },
] as const

function installCount(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "install" : "installs"}`
}

async function loadCatalog(params: Awaited<DiscoverPageProps["searchParams"]>) {
  const view = params.view ?? "trending"

  try {
    const skills = params.q && params.q.length >= 2
      ? await searchCatalog(params.q)
      : view === "curated"
        ? await getCuratedSkills()
        : await getLeaderboard(view)
    return { skills, unavailable: false }
  } catch (error) {
    console.error("Unable to load the skills.sh catalog", error)
    return { skills: [] as Awaited<ReturnType<typeof getLeaderboard>>, unavailable: true }
  }
}

async function DiscoverContent({ searchParams }: DiscoverPageProps) {
  const [{ activeId }, params] = await Promise.all([getAppContext(), searchParams])
  const view = params.view ?? "trending"
  const [saved, catalog] = await Promise.all([
    listOrganizationSkills(activeId),
    loadCatalog(params),
  ])
  const savedKeys = new Set(saved.map((item) => `${item.githubUrl}:${item.skillName}`))

  return (
    <>
      <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="grid gap-2">
            <label htmlFor="catalog-search" className="text-sm font-semibold">Search skills.sh</label>
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="catalog-search" name="q" defaultValue={params.q} minLength={2} placeholder="Search the public catalog" className="pl-10" />
            </div>
          </div>
          <Button type="submit">Search</Button>
        </form>

        <nav aria-label="Catalog views" className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-4 pb-1">
          {catalogViews.map((item) => (
            <Button key={item.value} size="sm" variant={!params.q && view === item.value ? "default" : "outline"} nativeButton={false} render={<Link href={`/discover?view=${item.value}`} aria-current={!params.q && view === item.value ? "page" : undefined} />}>
              {item.label}
            </Button>
          ))}
        </nav>
      </section>

      {catalog.unavailable ? (
        <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <SparklesIcon className="size-9 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Skills.sh is unavailable right now</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              We couldn’t load the public catalog. Try again in a moment, or save a GitHub skill directly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Try again</Button>
            <AddSkillDialog triggerLabel="Save from GitHub" />
          </div>
        </section>
      ) : catalog.skills.length ? (
        <section aria-label="Catalog results" className="grid gap-4 md:grid-cols-2">
          {catalog.skills.map((item, index) => {
            const isSaved = savedKeys.has(`${item.installUrl}:${item.slug}`)
            const command = `npx skills add ${item.installUrl} --skill ${item.slug}`
            return (
              <SkillDossier
                key={item.id}
                featured={index === 0 && catalog.skills.length > 2}
                className={index === 0 && catalog.skills.length > 2 ? "md:col-span-2" : undefined}
                headingLevel="h2"
                name={item.name}
                description={item.description}
                source={item.source}
                command={command}
                metric={installCount(item.installs)}
                status={isSaved ? "Saved" : undefined}
                href={`https://skills.sh/${item.source}/${item.slug}`}
                hrefLabel="Skill details"
                actions={
                  isSaved
                    ? <Button aria-label={`${item.name} is already in library`} variant="outline" size="sm" disabled>In library</Button>
                    : <AddSkillDialog defaultUrl={item.installUrl} defaultName={item.slug} triggerLabel="Save to library" triggerAriaLabel={`Save ${item.name} to library`} />
                }
              />
            )
          })}
        </section>
      ) : (
        <section className="grid min-h-56 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <SearchIcon className="size-9 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">No skills found</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Try a broader search or return to the current trending catalog.</p>
          </div>
          <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>View trending</Button>
        </section>
      )}
    </>
  )
}

function DiscoverFallback() {
  return (
    <div className="grid gap-8" aria-label="Loading public skills">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl md:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default function DiscoverPage({ searchParams }: DiscoverPageProps) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section>
        <Button variant="ghost" className="-ml-3" nativeButton={false} render={<Link href="/library" />}>
          <ArrowLeftIcon data-icon="inline-start" />Back to library
        </Button>
        <div className="mt-6">
          <p className="font-mono text-sm text-primary">Discover</p>
          <h1 className="mt-3 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
            Find the next skill worth keeping.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Search the public skills.sh catalog, inspect the source, then save the useful work to your team library.
          </p>
        </div>
      </section>

      <Suspense fallback={<DiscoverFallback />}>
        <DiscoverContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
