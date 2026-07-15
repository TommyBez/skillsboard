import Link from "next/link"
import { LibraryBigIcon, SearchIcon, TagsIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { SkillDossier } from "@/components/skill-dossier"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAppContext } from "@/lib/app-context"
import { listOrganizationSkills } from "@/lib/db/queries"

interface LibraryPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { activeId } = await getAppContext()
  const [params, allSkills] = await Promise.all([
    searchParams,
    listOrganizationSkills(activeId),
  ])
  const query = params.q?.toLowerCase().trim() ?? ""
  const skills = allSkills.filter((item) => (
    (!query || `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(query))
    && (!params.tag || item.tags.includes(params.tag))
  ))
  const tags = [...new Set(allSkills.flatMap((item) => item.tags))].sort()

  return (
      <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-sm text-primary">Library</p>
            <h1 className="mt-3 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
              Skills your team has chosen to keep.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              GitHub-backed references, ready install commands, and one shared answer for your team and its agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 lg:justify-end">
            <div className="min-w-24">
              <p className="font-mono text-3xl font-semibold tabular-nums tracking-[-0.04em]">{allSkills.length}</p>
              <p className="text-sm text-muted-foreground">saved skills</p>
            </div>
            <div className="min-w-24 border-l border-border pl-5">
              <p className="font-mono text-3xl font-semibold tabular-nums tracking-[-0.04em]">{tags.length}</p>
              <p className="text-sm text-muted-foreground">active tags</p>
            </div>
            <AddSkillDialog />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="grid gap-2">
              <label htmlFor="library-search" className="text-sm font-semibold">Search library</label>
              <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="library-search" name="q" defaultValue={params.q} placeholder="Search skills, descriptions, and tags" className="pl-10" />
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
                  metric={`${item.repoStars.toLocaleString()} stars`}
                  tags={item.tags}
                  href={item.githubUrl}
                  hrefLabel="GitHub"
                />
              )
            })}
          </section>
        ) : (
          <section className="flex min-h-96 flex-col items-start justify-end rounded-2xl border border-border bg-card p-6 md:p-10">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <LibraryBigIcon className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{query || params.tag ? "No matching skills" : "Your library is ready"}</h2>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {query || params.tag ? "Try another search or clear the active filters." : "Add a GitHub skill or discover one from the public catalog."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {query || params.tag ? <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>Clear filters</Button> : <AddSkillDialog />}
              <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Discover skills</Button>
            </div>
          </section>
        )}
      </main>
  )
}
