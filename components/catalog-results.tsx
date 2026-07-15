"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
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

function installCount(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "install" : "installs"}`
}

function SkillCard({
  item,
  featured,
  isSaved,
}: {
  item: CatalogSkill
  featured?: boolean
  isSaved: boolean
}) {
  const command = `npx skills add ${item.installUrl} --skill ${item.slug}`

  return (
    <SkillDossier
      featured={featured}
      className={featured ? "md:col-span-2" : undefined}
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
  const saved = new Set(savedKeys)

  const atSearchCap = page.source === "search" && page.perPage >= SEARCH_MAX_LIMIT && page.hasMore
  const canLoadMore = page.hasMore && page.source !== "curated" && !atSearchCap
  const searchTruncated = page.source === "search" && page.hasMore

  const loadMore = useEffectEvent(async () => {
    if (isLoadingMore || error || !canLoadMore) return

    const params = new URLSearchParams()
    if (page.source === "search" && page.query) {
      const nextLimit = Math.min(SEARCH_MAX_LIMIT, page.perPage + SEARCH_PAGE_SIZE)
      if (nextLimit <= page.perPage) return
      params.set("q", page.query)
      params.set("limit", String(nextLimit))
    } else if (page.source === "leaderboard" && page.view) {
      params.set("view", page.view)
      params.set("page", String(page.page + 1))
      params.set("perPage", String(page.perPage || CATALOG_PAGE_SIZE))
    } else {
      return
    }

    setIsLoadingMore(true)
    try {
      const response = await fetch(`/api/catalog?${params}`)
      if (!response.ok) throw new Error("Could not load more skills")
      const nextPage = (await response.json()) as CatalogPage

      if (page.source === "search") {
        setSkills(nextPage.skills)
      } else {
        setSkills((current) => {
          const seen = new Set(current.map((skill) => skill.id))
          return [...current, ...nextPage.skills.filter((skill) => !seen.has(skill.id))]
        })
      }
      setPage(nextPage)
      setError(null)
    } catch (loadError) {
      console.error(loadError)
      setError("Couldn’t load more skills. Try again.")
    } finally {
      setIsLoadingMore(false)
    }
  })

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !canLoadMore) return

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
  }, [canLoadMore, skills.length, error])

  return (
    <div className="grid gap-6">
      {searchTruncated ? (
        <p className="text-sm text-muted-foreground" role="status">
          {atSearchCap
            ? `Showing the top ${skills.length.toLocaleString()} matches. Narrow your query to dig further into the catalog.`
            : `Showing ${skills.length.toLocaleString()} matches. Scroll for more.`}
        </p>
      ) : page.source === "leaderboard" || page.source === "curated" ? (
        <p className="text-sm text-muted-foreground" role="status">
          Showing {skills.length.toLocaleString()} skills
          {canLoadMore ? " — scroll for more" : ""}.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          {skills.length.toLocaleString()} {skills.length === 1 ? "match" : "matches"}.
        </p>
      )}

      <section aria-label="Catalog results" className="grid gap-4 md:grid-cols-2">
        {skills.map((item, index) => (
          <SkillCard
            key={item.id}
            item={item}
            featured={index === 0 && skills.length > 2}
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
            onClick={() => {
              setError(null)
              void loadMore()
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {canLoadMore ? (
        <div
          ref={sentinelRef}
          className="grid gap-4 md:grid-cols-2"
          aria-hidden={!isLoadingMore}
          aria-busy={isLoadingMore}
        >
          {isLoadingMore ? (
            <>
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </>
          ) : (
            <div className="h-8 md:col-span-2" />
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
        <h2 className="text-3xl font-semibold tracking-[-0.04em]">No skills found</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">Try a broader search or return to the current trending catalog.</p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>View trending</Button>
    </section>
  )
}
