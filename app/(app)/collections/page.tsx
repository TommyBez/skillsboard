import { Suspense } from "react"
import Link from "next/link"
import { FolderOpenIcon, SearchIcon, TagsIcon } from "lucide-react"

import { CollectionCard } from "@/components/collection-card"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"
import { listOrganizationCollections } from "@/lib/db/queries"

interface CollectionsPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>
}

async function CollectionsStats() {
  const { activeId } = await getAppContext()
  const collections = await listOrganizationCollections(activeId)
  const grouped = collections.reduce((total, item) => total + item.skillCount, 0)

  return (
    <div className="flex flex-wrap items-center gap-5 lg:justify-end">
      <div className="min-w-20">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-display">{collections.length}</p>
        <p className="text-sm text-muted-foreground">{collections.length === 1 ? "collection" : "collections"}</p>
      </div>
      <div className="min-w-20 border-l border-border pl-5">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-display">{grouped}</p>
        <p className="text-sm text-muted-foreground">{grouped === 1 ? "grouped skill" : "grouped skills"}</p>
      </div>
    </div>
  )
}

function CollectionsStatsFallback() {
  return (
    <div className="flex gap-5" aria-label="Loading collections summary">
      <Skeleton className="h-14 w-20 rounded-xl" />
      <Skeleton className="h-14 w-20 rounded-xl" />
    </div>
  )
}

async function CollectionsResults({ searchParams }: CollectionsPageProps) {
  const [{ activeId }, params] = await Promise.all([getAppContext(), searchParams])
  const allCollections = await listOrganizationCollections(activeId)
  const query = params.q?.toLowerCase().trim() ?? ""
  const collections = allCollections.filter((item) => (
    (!query || `${item.title} ${item.description ?? ""} ${item.tags.join(" ")}`.toLowerCase().includes(query))
    && (!params.tag || item.tags.includes(params.tag))
  ))
  const tags = [...new Set(allCollections.flatMap((item) => item.tags))].sort()
  const hasFilters = Boolean(query || params.tag)
  const collectionsHref = (next: { q?: string; tag?: string | null }) => {
    const search = new URLSearchParams()
    const nextQuery = next.q === undefined ? params.q : next.q
    const nextTag = next.tag === undefined ? params.tag : next.tag
    if (nextQuery) search.set("q", nextQuery)
    if (nextTag) search.set("tag", nextTag)
    const value = search.toString()
    return value ? `/collections?${value}` : "/collections"
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="grid gap-2">
            <label htmlFor="collections-search" className="text-sm font-semibold">Search collections</label>
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="collections-search" name="q" defaultValue={params.q} placeholder="Search by title, description, or tag" className="pl-10" />
            </div>
          </div>
          {params.tag ? <input type="hidden" name="tag" value={params.tag} /> : null}
          <Button type="submit" variant="outline">Search</Button>
        </form>

        {tags.length ? (
          <nav aria-label="Filter collections by tag" className="mt-4 flex items-start gap-3 border-t border-border pt-4">
            <TagsIcon className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
              <Button size="sm" variant={!params.tag ? "default" : "outline"} nativeButton={false} render={<Link href={collectionsHref({ tag: null })} aria-current={!params.tag ? "page" : undefined} />}>All</Button>
              {tags.map((tag) => (
                <Button key={tag} size="sm" variant={params.tag === tag ? "default" : "outline"} nativeButton={false} render={<Link href={collectionsHref({ tag })} aria-current={params.tag === tag ? "page" : undefined} />}>
                  {tag}
                </Button>
              ))}
            </div>
          </nav>
        ) : null}
      </section>

      {collections.length ? (
        <section aria-label="Team skill collections" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((item) => (
            <CollectionCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              tags={item.tags}
              skillCount={item.skillCount}
              createdByName={item.createdByName}
            />
          ))}
        </section>
      ) : (
        <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <FolderOpenIcon className="size-9 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-3xl font-semibold tracking-display md:text-4xl">{hasFilters ? "No matching collections" : "Create your first collection"}</h2>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {hasFilters
                ? "Try another search or clear the active filters."
                : "Group the skills your team recommends by use case or project, so the whole set is easy to find."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {hasFilters ? <Button variant="outline" nativeButton={false} render={<Link href="/collections" />}>Clear filters</Button> : <CreateCollectionDialog />}
            <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>Browse library</Button>
          </div>
        </section>
      )}
    </>
  )
}

function CollectionsResultsFallback() {
  return (
    <div className="grid gap-8" aria-label="Loading collections">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  )
}

export default function CollectionsPage({ searchParams }: CollectionsPageProps) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-mono text-sm text-primary">Collections</p>
          <h1 className="mt-3 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl">
            Skills, grouped by use case.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Curate sets of skills for a project or workflow. Every collection is visible to your whole team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 lg:justify-end">
          <Suspense fallback={<CollectionsStatsFallback />}>
            <CollectionsStats />
          </Suspense>
          <CreateCollectionDialog />
        </div>
      </section>

      <Suspense fallback={<CollectionsResultsFallback />}>
        <CollectionsResults searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
