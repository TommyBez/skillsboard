"use client"

/**
 * FilterGrid — "Filtering rearranges, it does not blink"
 *
 * Ported from https://www.interior.dev/docs/filter-grid. API as documented:
 * items / filters / getKey / renderItem / label / defaultValue / columns /
 * rowHeight / maxRows / gap / emptyLabel.
 *
 * `items` is the full unfiltered set, because item count is what fixes the
 * reserved height — the grid must not resize when the filter changes.
 * `getKey` must be stable across filters, or a move degrades into an unmount
 * and remount and the rearrangement is lost.
 */

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { SegmentedControl } from "@/components/interior/segmented-control"
import { cn } from "@/lib/utils"

export interface FilterDefinition<T> {
  id: string
  label: string
  match: (item: T) => boolean
}

interface FilterGridProps<T> {
  items: readonly T[]
  /** Include an "all" entry whose match returns true; the first entry is the fallback. */
  filters: readonly FilterDefinition<T>[]
  getKey: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  label: string
  defaultValue?: string
  columns?: number
  rowHeight?: number
  maxRows?: number
  gap?: number
  emptyLabel?: string
  className?: string
}

export function FilterGrid<T>({
  items,
  filters,
  getKey,
  renderItem,
  label,
  defaultValue,
  columns = 3,
  rowHeight = 72,
  maxRows = 4,
  gap = 8,
  emptyLabel = "Nothing matches this filter",
  className,
}: FilterGridProps<T>) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(defaultValue ?? filters[0]?.id ?? "")

  const filter = filters.find((entry) => entry.id === active) ?? filters[0]
  const matched = filter ? items.filter(filter.match) : [...items]

  // Height comes from the FULL set, capped at maxRows — never from the match.
  const rows = Math.min(maxRows, Math.ceil(items.length / columns))
  const reserved = rows * rowHeight + Math.max(0, rows - 1) * gap

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <SegmentedControl
        label={label}
        options={filters.map((entry) => ({
          value: entry.id,
          label: entry.label,
        }))}
        value={active}
        onValueChange={setActive}
      />

      <div style={{ minHeight: reserved }} className="relative">
        {matched.length === 0 ? (
          <p role="status" className="py-6 text-center text-[13px] text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <motion.div
            layout={!reduced}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {matched.map((item) => (
                <motion.div
                  key={getKey(item)}
                  layout={!reduced}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  transition={
                    reduced
                      ? { duration: 0.1 }
                      : { type: "spring", stiffness: 420, damping: 38, mass: 0.8 }
                  }
                  style={{ height: rowHeight }}
                >
                  {renderItem(item)}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
