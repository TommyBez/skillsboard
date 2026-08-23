"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"

import { useDiscoverPending } from "@/components/discover-pending"
import { LiveSearchField, LiveSearchFieldFallback } from "@/components/live-search-field"
import { Button } from "@/components/ui/button"

/* One field, one behaviour: Discover searches with the same component the
   Library and Collections use, so clearing, Escape, Enter and the pending
   spinner work identically wherever you are. Two characters is the shortest
   query the public catalog answers usefully. */
const searchField = {
  id: "catalog-search",
  label: "Search public skills",
  placeholder: "Search the public catalog",
  minLength: 2,
} as const

const catalogViews = [
  { value: "trending", label: "Trending" },
  { value: "hot", label: "Hot" },
  { value: "all-time", label: "All time" },
  { value: "curated", label: "Curated" },
] as const

function CatalogViewTabs({
  activeView,
  hasQuery,
}: {
  activeView: (typeof catalogViews)[number]["value"]
  hasQuery: boolean
}) {
  const router = useRouter()
  const { startTransition } = useDiscoverPending()
  const reduced = useReducedMotion()

  return (
    <nav aria-label="Catalog views" className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-4 pb-1">
      {catalogViews.map((item) => {
        const href = `/discover?view=${item.value}`
        const isActive = !hasQuery && activeView === item.value

        return (
          /* The thumb travels between views instead of the selection blinking
             from one button to the next. These stay real links — modifier
             clicks and open-in-new-tab must keep working — so the indicator
             rides underneath them rather than replacing them with radios. */
          <span key={item.value} className="relative isolate shrink-0">
            {isActive ? (
              <motion.span
                layoutId="catalog-view-thumb"
                aria-hidden
                className="absolute inset-0 -z-10 rounded-lg bg-primary"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 520, damping: 44, mass: 0.7 }
                }
              />
            ) : null}
            <Button
              size="sm"
              variant={isActive ? "ghost" : "outline"}
              className={isActive ? "text-primary-foreground hover:bg-transparent" : undefined}
              nativeButton={false}
              render={
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                      return
                    }
                    event.preventDefault()
                    startTransition(() => {
                      router.push(href, { scroll: false })
                    })
                  }}
                />
              }
            >
              {item.label}
            </Button>
          </span>
        )
      })}
    </nav>
  )
}

/** Static shell for Cache Components — same layout as the live filters. */
export function DiscoverFiltersFallback() {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
      <LiveSearchFieldFallback {...searchField} />
      <nav aria-label="Catalog views" className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-4 pb-1">
        {catalogViews.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={item.value === "trending" ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={`/discover?view=${item.value}`} />}
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </section>
  )
}

export function DiscoverFilters() {
  const searchParams = useSearchParams()
  const qFromUrl = searchParams.get("q") ?? ""
  const viewParam = searchParams.get("view")
  const activeView = catalogViews.some((item) => item.value === viewParam)
    ? (viewParam as (typeof catalogViews)[number]["value"])
    : "trending"

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
      <LiveSearchField {...searchField} />
      <CatalogViewTabs activeView={activeView} hasQuery={qFromUrl.length > 0} />
    </section>
  )
}
