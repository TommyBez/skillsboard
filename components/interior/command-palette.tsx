"use client"

/**
 * CommandPalette — "Results reorder as you type"
 *
 * Ported from https://www.interior.dev/docs/command-palette. API as documented:
 * items / onSelect / onDismiss / placeholder / label / maxRows / autoFocus.
 *
 * Results keep their identity across queries, so a row that survives a
 * keystroke travels to its new rank instead of being torn down and rebuilt.
 * The list height is fixed by maxRows, so ranking never resizes the dialog.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CommandItem {
  id: string
  label: string
  group?: string
  hint?: string
  icon?: React.ReactNode
  keywords?: string
}

interface CommandPaletteProps {
  items: readonly CommandItem[]
  onSelect: (item: CommandItem) => void
  onDismiss: () => void
  placeholder?: string
  label?: string
  maxRows?: number
  autoFocus?: boolean
  emptyLabel?: string
  className?: string
}

const ROW_HEIGHT = 38

/** Subsequence match, scored so earlier and tighter matches rank first. */
function score(item: CommandItem, query: string): number | null {
  if (!query) return 0
  const haystack = `${item.label} ${item.group ?? ""} ${item.keywords ?? ""}`.toLowerCase()
  const needle = query.toLowerCase()

  const direct = haystack.indexOf(needle)
  if (direct !== -1) return 1000 - direct

  let cursor = 0
  let gaps = 0
  for (const character of needle) {
    const found = haystack.indexOf(character, cursor)
    if (found === -1) return null
    gaps += found - cursor
    cursor = found + 1
  }
  return 500 - gaps
}

export function CommandPalette({
  items,
  onSelect,
  onDismiss,
  placeholder = "Search",
  label = "Command palette",
  maxRows = 7,
  autoFocus = true,
  emptyLabel = "No matches",
  className,
}: CommandPaletteProps) {
  const reduced = useReducedMotion()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = "command-palette-list"

  const results = useMemo(() => {
    return items
      .map((item) => ({ item, rank: score(item, query) }))
      .filter((entry): entry is { item: CommandItem; rank: number } => entry.rank !== null)
      .sort((a, b) => b.rank - a.rank)
      .map((entry) => entry.item)
  }, [items, query])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // The list is taller than its box once results exceed maxRows, so arrowing
  // past the fold would move a selection nobody could see.
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" })
  }, [active, results])

  /* Focus stays in the palette while it is open. The dialog claims
     aria-modal, the rows are not focusable, and every key this component
     handles is bound to the container — so letting Tab reach the page behind
     would strip the arrow keys and Escape from a keyboard user without any
     visible sign. Focus is handed back to whatever had it on dismissal. */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    return () => previous?.focus?.()
  }, [])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      // Nothing inside is tabbable but the field, so the trap is simply:
      // Tab keeps focus on it rather than escaping to the page behind.
      event.preventDefault()
      inputRef.current?.focus()
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      onDismiss()
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((index) => Math.min(results.length - 1, index + 1))
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((index) => Math.max(0, index - 1))
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      const chosen = results[active]
      if (chosen) onSelect(chosen)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-controls={listId}
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
          esc
        </kbd>
      </div>

      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={label}
        className="overflow-y-auto p-1.5"
        style={{ height: maxRows * ROW_HEIGHT + 12 }}
      >
        {/* The boundary stays mounted and the condition sits inside it. Wrapped
            the other way round, AnimatePresence unmounted together with the
            rows it was meant to watch, so the last result vanished instead of
            animating out. */}
        <AnimatePresence initial={false} mode="popLayout">
          {results.length === 0 ? (
            <motion.p
              key="empty"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
              transition={{ duration: reduced ? 0.1 : 0.16 }}
              className="grid h-full place-items-center text-[13px] text-muted-foreground"
            >
              {emptyLabel}
            </motion.p>
          ) : (
            results.map((item, index) => (
              <motion.div
                key={item.id}
                id={`cmd-${item.id}`}
                layout={!reduced}
                role="option"
                aria-selected={index === active}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                transition={
                  reduced
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 520, damping: 44 }
                }
                onPointerEnter={() => setActive(index)}
                onClick={() => onSelect(item)}
                style={{ height: ROW_HEIGHT }}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[13px]",
                  index === active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                )}
              >
                {item.icon ? (
                  <span className="shrink-0 text-muted-foreground">{item.icon}</span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.group ? (
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {item.group}
                  </span>
                ) : null}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
