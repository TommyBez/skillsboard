"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DEBOUNCE_MS = 300

const catalogViews = [
  { value: "trending", label: "Trending" },
  { value: "hot", label: "Hot" },
  { value: "all-time", label: "All time" },
  { value: "curated", label: "Curated" },
] as const

function SearchField({
  value,
  onValueChange,
}: {
  value: string
  onValueChange?: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor="catalog-search" className="text-sm font-semibold">
        Search public skills
      </label>
      <div className="relative">
        <SearchIcon
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="catalog-search"
          name="q"
          value={value}
          onValueChange={onValueChange}
          placeholder="Search the public catalog"
          className="pl-10"
          autoComplete="off"
          spellCheck={false}
          readOnly={!onValueChange}
        />
      </div>
    </div>
  )
}

function CatalogViewTabs({
  activeView,
  hasQuery,
}: {
  activeView: (typeof catalogViews)[number]["value"]
  hasQuery: boolean
}) {
  return (
    <nav aria-label="Catalog views" className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-4 pb-1">
      {catalogViews.map((item) => (
        <Button
          key={item.value}
          size="sm"
          variant={!hasQuery && activeView === item.value ? "default" : "outline"}
          nativeButton={false}
          render={
            <Link
              href={`/discover?view=${item.value}`}
              aria-current={!hasQuery && activeView === item.value ? "page" : undefined}
            />
          }
        >
          {item.label}
        </Button>
      ))}
    </nav>
  )
}

/** Static shell for Cache Components — same layout as the live filters. */
export function DiscoverFiltersFallback() {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
      <SearchField value="" />
      <CatalogViewTabs activeView="trending" hasQuery={false} />
    </section>
  )
}

export function DiscoverFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qFromUrl = searchParams.get("q") ?? ""
  const viewParam = searchParams.get("view")
  const activeView = catalogViews.some((item) => item.value === viewParam)
    ? (viewParam as (typeof catalogViews)[number]["value"])
    : "trending"

  const [value, setValue] = useState(qFromUrl)

  useEffect(() => {
    setValue(qFromUrl)
  }, [qFromUrl])

  useEffect(() => {
    const trimmed = value.trim()
    if (trimmed === qFromUrl.trim()) return

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (trimmed.length >= 2) {
        params.set("q", trimmed)
      } else {
        params.delete("q")
      }

      const query = params.toString()
      router.replace(query ? `/discover?${query}` : "/discover", { scroll: false })
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [value, qFromUrl, router, searchParams])

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
      <SearchField value={value} onValueChange={setValue} />
      <CatalogViewTabs activeView={activeView} hasQuery={qFromUrl.length > 0} />
    </section>
  )
}
