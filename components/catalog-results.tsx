"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckIcon, SearchIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { CatalogSkillDetailsDialog } from "@/components/catalog-skill-details-dialog"
import { SkillDossier } from "@/components/skill-dossier"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CATALOG_PAGE_SIZE,
  SEARCH_MAX_LIMIT,
  SEARCH_PAGE_SIZE,
  type CatalogPage,
  type CatalogSkill,
} from "@/lib/catalog"
import { buildInstallCommand } from "@/lib/install-command"

function installCount(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "install" : "installs"}`
}

function InLibraryLabel({ name }: { name: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <CheckIcon className="size-3.5 text-primary" aria-hidden="true" />
      In library
      <span className="sr-only">: {name} is already saved</span>
    </span>
  )
}

function SkillCard({
  item,
  isSaved,
  rank,
}: {
  item: CatalogSkill
  isSaved: boolean
  rank?: number
}) {
  const command = buildInstallCommand(item.installUrl, item.slug)

  return (
    <SkillDossier
      headingLevel="h2"
      name={item.name}
      description={item.description}
      source={item.source}
      command={command}
      metric={installCount(item.installs)}
      rank={rank}
      details={<CatalogSkillDetailsDialog item={item} isSaved={isSaved} />}
      actions={
        isSaved
          ? <InLibraryLabel name={item.name} />
          : <AddSkillDialog defaultUrl={item.installUrl} defaultName={item.slug} triggerLabel="Save to library" triggerAriaLabel={`Save ${item.name} to library`} />
      }
    />
  )
}

function canFetchMore(page: CatalogPage) {
  if (!page.hasMore || page.source === "curated") return false
  if (page.source === "search" && page.perPage >= SEARCH_MAX_LIMIT) return false
  return true
}

interface CatalogResultsProps {
  initialPage: CatalogPage
  savedKeys: string[]
}

export function CatalogResults({ initialPage, savedKeys }: CatalogResultsProps) {
  const [skills, setSkills] = useState(initialPage.skills)
  const [page, setPage] = useState(initialPage)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(page)
  const loadingRef = useRef(false)
  const saved = new Set(savedKeys)

  pageRef.current = page

  const atSearchCap = page.source === "search" && page.perPage >= SEARCH_MAX_LIMIT && page.hasMore
  const canLoadMore = canFetchMore(page)
  const searchTruncated = page.source === "search" && page.hasMore

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    const current = pageRef.current
    if (!canFetchMore(current)) return

    const params = new URLSearchParams()
    if (current.source === "search" && current.query) {
      const nextLimit = Math.min(SEARCH_MAX_LIMIT, current.perPage + SEARCH_PAGE_SIZE)
      if (nextLimit <= current.perPage) return
      params.set("q", current.query)
      params.set("limit", String(nextLimit))
    } else if (current.source === "leaderboard" && current.view) {
      params.set("view", current.view)
      params.set("page", String(current.page + 1))
      params.set("perPage", String(current.perPage || CATALOG_PAGE_SIZE))
    } else {
      return
    }

    loadingRef.current = true
    setIsLoadingMore(true)
    setError(null)

    try {
      const response = await fetch(`/api/catalog?${params}`)
      if (!response.ok) throw new Error("Could not load more skills")
      const nextPage = (await response.json()) as CatalogPage

      if (current.source === "search") {
        setSkills(nextPage.skills)
      } else {
        setSkills((existing) => {
          const seen = new Set(existing.map((skill) => skill.id))
          return [...existing, ...nextPage.skills.filter((skill) => !seen.has(skill.id))]
        })
      }
      setPage(nextPage)
      pageRef.current = nextPage
    } catch (loadError) {
      console.error(loadError)
      setError("Couldn’t load more skills. Try again.")
    } finally {
      loadingRef.current = false
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !canLoadMore || error) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore()
        }
      },
      { root: null, rootMargin: "320px 0px", threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoadMore, skills.length, error, loadMore])

  return (
    <div className="grid gap-6">
      {searchTruncated ? (
        <p className="text-sm tabular-nums text-muted-foreground" role="status">
          {atSearchCap
            ? `Showing the top ${skills.length.toLocaleString()} matches. Narrow your query to dig further into the catalog.`
            : `Showing ${skills.length.toLocaleString()} matches. Scroll for more.`}
        </p>
      ) : page.source === "leaderboard" || page.source === "curated" ? (
        <p className="text-sm tabular-nums text-muted-foreground" role="status">
          Showing {skills.length.toLocaleString()} skills
          {canLoadMore ? ". Scroll for more" : ""}.
        </p>
      ) : (
        <p className="text-sm tabular-nums text-muted-foreground" role="status">
          {skills.length.toLocaleString()} {skills.length === 1 ? "match" : "matches"}.
        </p>
      )}

      <section aria-label="Catalog results" className="cascade-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((item, index) => (
          <SkillCard
            key={item.id}
            item={item}
            isSaved={saved.has(`${item.installUrl}:${item.slug}`)}
            rank={page.source === "leaderboard" ? index + 1 : undefined}
          />
        ))}
      </section>

      {error ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadMore()}>
            Try again
          </Button>
        </div>
      ) : null}

      {canLoadMore && !error ? (
        <div
          ref={sentinelRef}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-hidden={!isLoadingMore}
          aria-busy={isLoadingMore}
        >
          {isLoadingMore ? (
            <>
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="hidden h-72 rounded-2xl xl:block" />
            </>
          ) : (
            <div className="h-8 md:col-span-2 xl:col-span-3" />
          )}
        </div>
      ) : null}
    </div>
  )
}

export function CatalogEmptyState() {
  return (
    <section className="grid min-h-56 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <SearchIcon className="size-9 text-primary" aria-hidden="true" />
      <div>
        <h2 className="text-3xl font-semibold tracking-display">No skills found</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">Try a broader search or return to the current trending catalog.</p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>View trending</Button>
    </section>
  )
}
