"use client"

/**
 * Search-as-you-type for listing pages. Keystrokes debounce into URL
 * replacements inside the page's filter transition, so results update live
 * while the URL stays shareable and back/forward keep working. Pressing "/"
 * anywhere on the page focuses the field — the fastest path from "I want a
 * skill" to typing its name.
 */

import { useEffect, useRef, useState } from "react"
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

interface LiveSearchFieldProps {
  id: string
  label: string
  placeholder: string
}

export function LiveSearchField({ id, label, placeholder }: LiveSearchFieldProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending, startTransition } = useFilterPending()
  const inputRef = useRef<HTMLInputElement>(null)
  const qFromUrl = searchParams.get("q") ?? ""
  const [value, setValue] = useState(qFromUrl)

  useEffect(() => {
    setValue(qFromUrl)
  }, [qFromUrl])

  useEffect(() => {
    const trimmed = value.trim()
    if (trimmed === qFromUrl.trim()) return

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (trimmed) params.set("q", trimmed)
      else params.delete("q")

      const query = params.toString()
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
      })
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [value, qFromUrl, pathname, router, searchParams, startTransition])

  useSlashFocus(inputRef)

  function clear() {
    setValue("")
    inputRef.current?.focus()
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={inputRef}
          id={id}
          name="q"
          value={value}
          onValueChange={setValue}
          onKeyDown={(event) => {
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
      </div>
    </div>
  )
}
