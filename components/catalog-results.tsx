"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckIcon, SearchIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { ButtonPendingContent } from "@/components/button-pending-content"
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
}: {
  item: CatalogSkill
  isSaved: boolean
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
      details={<CatalogSkillDetailsDialog item={item} isSaved={isSaved} />}
      actions={
        isSaved
          ? <InLibraryLabel name={item.name} />
          : <AddSkillDialog defaultUrl={item.installUrl} defaultName={item.slug} triggerLabel="Save to library" triggerAriaLabel={`Save ${item.name} to library`} />
      }
    />
  )
}

/** How many pages the sentinel may pull before handing control back. */
const MAX_AUTO_LOADS = 4

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
  /* Bound the automatic fetching. Without a cap the sentinel keeps pulling
     pages for as long as someone scrolls, so passing through the catalog on
     the way to the footer silently costs several requests. After this many
     automatic pages the control goes back to the reader. */
  const autoLoadsRef = useRef(0)
  const [autoExhausted, setAutoExhausted] = useState(false)
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
      // Keep the retry control mounted during pending requests so the button
      // can show its loading label; only clear the error after success.
      setError(null)
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
    if (!node || !canLoadMore || error || autoExhausted) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        // A request already in flight would make loadMore return immediately;
        // counting that callback would shrink the next automatic window.
        if (loadingRef.current) return
        if (autoLoadsRef.current >= MAX_AUTO_LOADS) {
          setAutoExhausted(true)
          return
        }
        autoLoadsRef.current += 1
        void loadMore()
      },
      { root: null, rootMargin: "320px 0px", threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoadMore, skills.length, error, autoExhausted, loadMore])

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
        {skills.map((item) => (
          <SkillCard
            key={item.id}
            item={item}
            isSaved={saved.has(`${item.installUrl}:${item.slug}`)}
          />
        ))}
      </section>

      {error ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingMore}
            aria-busy={isLoadingMore || undefined}
            onClick={() => void loadMore()}
          >
            <ButtonPendingContent pending={isLoadingMore} pendingLabel="Loading…">
              Try again
            </ButtonPendingContent>
          </Button>
        </div>
      ) : null}

      {canLoadMore && !error && autoExhausted ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingMore}
            aria-busy={isLoadingMore || undefined}
            onClick={() => {
              // An explicit request re-arms the automatic window.
              autoLoadsRef.current = 0
              setAutoExhausted(false)
              void loadMore()
            }}
          >
            <ButtonPendingContent pending={isLoadingMore} pendingLabel="Loading…">
              Load more skills
            </ButtonPendingContent>
          </Button>
        </div>
      ) : null}

      {canLoadMore && !error && !autoExhausted ? (
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
