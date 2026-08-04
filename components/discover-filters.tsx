"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { SearchIcon } from "lucide-react"

import { useDiscoverPending } from "@/components/discover-pending"
import { useSlashFocus } from "@/components/live-search-field"
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
  const inputRef = useRef<HTMLInputElement>(null)
  useSlashFocus(inputRef)

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
          ref={inputRef}
          id="catalog-search"
          name="q"
          value={value}
          onValueChange={onValueChange}
          placeholder="Search the public catalog"
          className="pl-10 pr-12"
          autoComplete="off"
          spellCheck={false}
          readOnly={!onValueChange}
        />
        <kbd
          aria-hidden="true"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
        >
          /
        </kbd>
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
                  prefetch
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
      <SearchField value="" />
      <nav aria-label="Catalog views" className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-4 pb-1">
        {catalogViews.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={item.value === "trending" ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={`/discover?view=${item.value}`} prefetch />}
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </section>
  )
}

export function DiscoverFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { startTransition } = useDiscoverPending()
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
      const href = query ? `/discover?${query}` : "/discover"

      startTransition(() => {
        router.replace(href, { scroll: false })
      })
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [value, qFromUrl, router, searchParams, startTransition])

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
      <SearchField value={value} onValueChange={setValue} />
      <CatalogViewTabs activeView={activeView} hasQuery={qFromUrl.length > 0} />
    </section>
  )
}
