"use client"

/**
 * The one search-as-you-type field for every listing page — Library,
 * Collections, Discover. Keystrokes debounce into URL replacements inside the
 * page's filter transition, so results update live while the URL stays
 * shareable and back/forward keep working.
 *
 * Three shortcuts keep the field out of its own way: "/" anywhere on the page
 * focuses it, Enter commits the query now instead of serving out the rest of
 * the debounce, and emptying the field reverts the results immediately —
 * there is nothing left to wait for once the query is gone.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react"

import { useFilterPending } from "@/components/pending-filters"
import { Input } from "@/components/ui/input"

const DEBOUNCE_MS = 250

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
}

/** Focus the given input when "/" is pressed outside any editable element. */
export function useSlashFocus(inputRef: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [inputRef])
}

/** What the URL should carry for a given field value. Below `minLength` a
 *  query is not a query yet, so it reads as "no filter" rather than as a
 *  search nobody asked for. */
function toQuery(value: string, minLength: number) {
  const trimmed = value.trim()
  return trimmed.length >= minLength ? trimmed : ""
}

interface SearchFieldShellProps {
  id: string
  label: string
  children: React.ReactNode
}

function SearchFieldShell({ id, label, children }: SearchFieldShellProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

interface LiveSearchFieldProps {
  id: string
  label: string
  placeholder: string
  /** Shortest query worth sending. Discover's catalog search wants 2. */
  minLength?: number
}

export function LiveSearchField({ id, label, placeholder, minLength = 1 }: LiveSearchFieldProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending, startTransition } = useFilterPending()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | null>(null)
  const qFromUrl = searchParams.get("q") ?? ""
  const [value, setValue] = useState(qFromUrl)

  useEffect(() => {
    setValue(qFromUrl)
  }, [qFromUrl])

  const commit = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) params.set("q", query)
    else params.delete("q")

    const search = params.toString()
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
    })
  }, [pathname, router, searchParams, startTransition])

  useEffect(() => {
    const query = toQuery(value, minLength)
    if (query === toQuery(qFromUrl, minLength)) return

    // An emptied field has no "still typing" to wait out, so it reverts the
    // results on the spot; a live query waits for the typing to settle.
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      commit(query)
    }, query ? DEBOUNCE_MS : 0)

    return () => {
      if (debounceRef.current === null) return
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [value, qFromUrl, minLength, commit])

  useSlashFocus(inputRef)

  function clear() {
    setValue("")
    inputRef.current?.focus()
  }

  /** Enter means "I'm done" — spend none of the remaining debounce on it. */
  function flush() {
    if (debounceRef.current === null) return
    window.clearTimeout(debounceRef.current)
    debounceRef.current = null
    commit(toQuery(value, minLength))
  }

  return (
    <SearchFieldShell id={id} label={label}>
      <Input
        ref={inputRef}
        id={id}
        name="q"
        value={value}
        onValueChange={setValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            flush()
            return
          }
          if (event.key === "Escape" && value) {
            event.preventDefault()
            clear()
          }
        }}
        placeholder={placeholder}
        className="pl-10 pr-12"
        autoComplete="off"
        spellCheck={false}
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : value ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="grid size-5 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </button>
        ) : (
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
          >
            /
          </kbd>
        )}
      </div>
    </SearchFieldShell>
  )
}

/** Static twin for Cache Components shells — same field, nothing wired yet. */
export function LiveSearchFieldFallback({ id, label, placeholder }: LiveSearchFieldProps) {
  return (
    <SearchFieldShell id={id} label={label}>
      <Input
        id={id}
        name="q"
        defaultValue=""
        placeholder={placeholder}
        className="pl-10 pr-12"
        autoComplete="off"
        spellCheck={false}
        readOnly
      />
      <kbd
        aria-hidden="true"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
      >
        /
      </kbd>
    </SearchFieldShell>
  )
}
