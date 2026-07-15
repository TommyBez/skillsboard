import Link from "next/link"
import { ArrowLeftIcon, SearchIcon, SparklesIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { SkillDossier } from "@/components/skill-dossier"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAppContext } from "@/lib/app-context"
import { listOrganizationSkills } from "@/lib/db/queries"
import { getCuratedSkills, getLeaderboard, searchCatalog } from "@/lib/skills-sh"

interface DiscoverPageProps {
  searchParams: Promise<{ q?: string; view?: "trending" | "hot" | "all-time" | "curated" }>
}

function installCount(count: number) {
  return `${count.toLocaleString()} installs`
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { activeId } = await getAppContext()
  const saved = await listOrganizationSkills(activeId)
  const params = await searchParams
  const view = params.view ?? "trending"
  let skills = [] as Awaited<ReturnType<typeof getLeaderboard>>
  let error = ""

  try {
    skills = params.q && params.q.length >= 2
      ? await searchCatalog(params.q)
      : view === "curated"
        ? await getCuratedSkills()
        : await getLeaderboard(view)
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Discovery is unavailable"
  }

  const savedKeys = new Set(saved.map((item) => `${item.githubUrl}:${item.skillName}`))

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
            {(["trending", "hot", "all-time", "curated"] as const).map((item) => (
              <Button key={item} size="sm" variant={!params.q && view === item ? "default" : "outline"} nativeButton={false} render={<Link href={`/discover?view=${item}`} aria-current={!params.q && view === item ? "page" : undefined} />}>
                {item.replace("-", " ")}
              </Button>
            ))}
          </nav>
        </section>

        {error ? (
          <section className="ink-panel flex min-h-96 flex-col items-start justify-end rounded-2xl p-6 md:p-10">
            <SparklesIcon className="size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Discovery needs Vercel OIDC.</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[color:color-mix(in_oklch,var(--surface-ink-foreground)_68%,transparent)]">
              {error}. Enable OIDC Federation on the connected Vercel project to load the public catalog.
            </p>
          </section>
        ) : skills.length ? (
          <section aria-label="Catalog results" className="grid gap-4 md:grid-cols-2">
            {skills.map((item, index) => {
              const isSaved = savedKeys.has(`${item.installUrl}:${item.slug}`)
              const command = `npx skills add ${item.installUrl} --skill ${item.slug}`
              return (
                <SkillDossier
                  key={item.id}
                  featured={index === 0 && skills.length > 2}
                  className={index === 0 && skills.length > 2 ? "md:col-span-2" : undefined}
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
                      : <AddSkillDialog defaultUrl={item.installUrl} defaultName={item.slug} triggerLabel="Save" triggerAriaLabel={`Save ${item.name} to library`} />
                  }
                />
              )
            })}
          </section>
        ) : (
          <section className="flex min-h-80 flex-col items-start justify-end rounded-2xl border border-border bg-card p-6 md:p-10">
            <SearchIcon className="size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">No skills found</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Try a broader search or return to the current trending catalog.</p>
            <Button className="mt-6" variant="outline" nativeButton={false} render={<Link href="/discover" />}>View trending</Button>
          </section>
        )}
      </main>
  )
}
