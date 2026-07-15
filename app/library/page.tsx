import { Suspense } from "react"
import Link from "next/link"
import { LibraryBigIcon, SearchIcon, TagsIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { SkillDossier } from "@/components/skill-dossier"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"
import { listOrganizationSkills } from "@/lib/db/queries"

interface LibraryPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>
}

async function LibraryStats() {
  const { activeId } = await getAppContext()
  const skills = await listOrganizationSkills(activeId)
  const tags = new Set(skills.flatMap((item) => item.tags))

  return (
    <div className="flex flex-wrap items-center gap-5 lg:justify-end">
      <div className="min-w-20">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-[-0.04em]">{skills.length}</p>
        <p className="text-sm text-muted-foreground">saved {skills.length === 1 ? "skill" : "skills"}</p>
      </div>
      <div className="min-w-20 border-l border-border pl-5">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-[-0.04em]">{tags.size}</p>
        <p className="text-sm text-muted-foreground">{tags.size === 1 ? "tag" : "tags"}</p>
      </div>
    </div>
  )
}

function LibraryStatsFallback() {
  return (
    <div className="flex gap-5" aria-label="Loading library summary">
      <Skeleton className="h-14 w-20 rounded-xl" />
      <Skeleton className="h-14 w-20 rounded-xl" />
    </div>
  )
}

async function LibraryResults({ searchParams }: LibraryPageProps) {
  const [{ activeId }, params] = await Promise.all([getAppContext(), searchParams])
  const allSkills = await listOrganizationSkills(activeId)
  const query = params.q?.toLowerCase().trim() ?? ""
  const skills = allSkills.filter((item) => (
    (!query || `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(query))
    && (!params.tag || item.tags.includes(params.tag))
  ))
  const tags = [...new Set(allSkills.flatMap((item) => item.tags))].sort()
  const hasFilters = Boolean(query || params.tag)

  return (
    <>
      <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="grid gap-2">
            <label htmlFor="library-search" className="text-sm font-semibold">Search saved skills</label>
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="library-search" name="q" defaultValue={params.q} placeholder="Search by name, description, or tag" className="pl-10" />
            </div>
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>

        {tags.length ? (
          <nav aria-label="Filter library by tag" className="mt-4 flex items-start gap-3 border-t border-border pt-4">
            <TagsIcon className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
              <Button size="sm" variant={!params.tag ? "default" : "outline"} nativeButton={false} render={<Link href="/library" aria-current={!params.tag ? "page" : undefined} />}>All</Button>
              {tags.map((tag) => (
                <Button key={tag} size="sm" variant={params.tag === tag ? "default" : "outline"} nativeButton={false} render={<Link href={`/library?tag=${encodeURIComponent(tag)}`} aria-current={params.tag === tag ? "page" : undefined} />}>
                  {tag}
                </Button>
              ))}
            </div>
          </nav>
        ) : null}
      </section>

      {skills.length ? (
        <section aria-label="Saved skills" className="grid gap-4 md:grid-cols-2">
          {skills.map((item, index) => {
            const command = `npx skills add ${item.githubUrl} --skill ${item.skillName}`
            return (
              <SkillDossier
                key={item.id}
                featured={index === 0 && skills.length > 2}
                className={index === 0 && skills.length > 2 ? "md:col-span-2" : undefined}
                headingLevel="h2"
                name={item.title}
                description={item.description ?? `${item.repoOwner}/${item.repoName}`}
                source={`${item.repoOwner}/${item.repoName}`}
                command={command}
                metric={`${item.repoStars.toLocaleString()} ${item.repoStars === 1 ? "star" : "stars"}`}
                tags={item.tags}
                href={item.githubUrl}
                hrefLabel="GitHub"
              />
            )
          })}
        </section>
      ) : (
        <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <LibraryBigIcon className="size-9 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{hasFilters ? "No matching skills" : "Save your first skill"}</h2>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {hasFilters ? "Try another search or clear the active filters." : "Add a GitHub-backed skill, or browse skills.sh to choose one for your team."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {hasFilters ? <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>Clear filters</Button> : <AddSkillDialog triggerLabel="Save from GitHub" />}
            <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Browse skills.sh</Button>
          </div>
        </section>
      )}
    </>
  )
}

function LibraryResultsFallback() {
  return (
    <div className="grid gap-8" aria-label="Loading saved skills">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl md:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default function LibraryPage({ searchParams }: LibraryPageProps) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-mono text-sm text-primary">Library</p>
          <h1 className="mt-3 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
            Your team’s saved skills.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            One trusted library of GitHub-backed skills, ready to install or retrieve through MCP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 lg:justify-end">
          <Suspense fallback={<LibraryStatsFallback />}>
            <LibraryStats />
          </Suspense>
          <AddSkillDialog />
        </div>
      </section>

      <Suspense fallback={<LibraryResultsFallback />}>
        <LibraryResults searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
