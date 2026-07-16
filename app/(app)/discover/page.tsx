import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeftIcon, SparklesIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { CatalogEmptyState, CatalogResults } from "@/components/catalog-results"
import { DiscoverFilters, DiscoverFiltersFallback } from "@/components/discover-filters"
import {
  DiscoverPendingProvider,
  DiscoverResultsFallback,
  DiscoverResultsSlot,
} from "@/components/discover-pending"
import { Button } from "@/components/ui/button"
import { getAppContext } from "@/lib/app-context"
import type { CatalogPage } from "@/lib/catalog"
import { listOrganizationSkills } from "@/lib/db/queries"
import { getCuratedSkills, getLeaderboard, searchCatalog } from "@/lib/skills-sh"

interface DiscoverPageProps {
  searchParams: Promise<{ q?: string; view?: "trending" | "hot" | "all-time" | "curated" }>
}

async function loadCatalog(params: Awaited<DiscoverPageProps["searchParams"]>): Promise<
  | { page: CatalogPage; unavailable: false }
  | { page: null; unavailable: true }
> {
  const view = params.view ?? "trending"

  try {
    const page = params.q && params.q.length >= 2
      ? await searchCatalog(params.q)
      : view === "curated"
        ? await getCuratedSkills()
        : await getLeaderboard(view)
    return { page, unavailable: false }
  } catch (error) {
    console.error("Unable to load the skills.sh catalog", error)
    return { page: null, unavailable: true }
  }
}

async function DiscoverResults({ searchParams }: DiscoverPageProps) {
  const [{ activeId }, params] = await Promise.all([getAppContext(), searchParams])
  const [saved, catalog] = await Promise.all([
    listOrganizationSkills(activeId),
    loadCatalog(params),
  ])

  if (catalog.unavailable || !catalog.page) {
    return (
      <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <SparklesIcon className="size-9 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">The public catalog is unavailable</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Try again in a moment, or add a skill directly from its repository.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Try again</Button>
          <AddSkillDialog triggerLabel="Add from source" />
        </div>
      </section>
    )
  }

  if (!catalog.page.skills.length) {
    return <CatalogEmptyState />
  }

  const savedKeys = saved.map((item) => `${item.githubUrl}:${item.skillName}`)
  const resultsKey = [
    catalog.page.source,
    catalog.page.query ?? "",
    catalog.page.view ?? "",
  ].join(":")

  return <CatalogResults key={resultsKey} initialPage={catalog.page} savedKeys={savedKeys} />
}

export default function DiscoverPage({ searchParams }: DiscoverPageProps) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section>
        <Button variant="ghost" className="-ml-3" nativeButton={false} render={<Link href="/library" />}>
          <ArrowLeftIcon data-icon="inline-start" />Back to library
        </Button>
        <div className="mt-6">
          <p className="font-mono text-sm text-primary">Find skills</p>
          <h1 className="mt-3 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
            Find a skill to recommend.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Browse the public catalog, inspect the source, then add the useful skills to your team library.
          </p>
        </div>
      </section>

      <DiscoverPendingProvider>
        <Suspense fallback={<DiscoverFiltersFallback />}>
          <DiscoverFilters />
        </Suspense>

        <DiscoverResultsSlot>
          <Suspense fallback={<DiscoverResultsFallback />}>
            <DiscoverResults searchParams={searchParams} />
          </Suspense>
        </DiscoverResultsSlot>
      </DiscoverPendingProvider>
    </main>
  )
}
