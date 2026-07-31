"use client"

/**
 * The visible way into the ⌘K palette. The shortcut existed with no
 * affordance anywhere in the chrome — discoverable only by habit. This
 * renders as a fake search field on desktop and an icon button on small
 * screens, and simply asks the palette to open.
 */

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CommandMenuTrigger() {
  const [shortcut, setShortcut] = useState("⌘K")

  useEffect(() => {
    if (!/Mac|iP(hone|ad|od)/.test(navigator.platform)) setShortcut("Ctrl K")
  }, [])

  function openPalette() {
    window.dispatchEvent(new Event("skillsboard:open-command-menu"))
  }

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="hidden h-10 w-44 items-center gap-2 rounded-xl border border-border bg-card/65 px-3 text-sm text-muted-foreground transition-[border-color,background-color] duration-150 ease-out outline-none hover:border-foreground/25 hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 lg:flex"
        aria-label={`Search skills and collections (${shortcut})`}
      >
        <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">{shortcut}</kbd>
      </button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="hidden size-10 rounded-xl border-border bg-card/65 sm:flex lg:hidden"
        aria-label={`Search skills and collections (${shortcut})`}
        onClick={openPalette}
      >
        <SearchIcon className="size-4" aria-hidden="true" />
      </Button>
    </>
  )
}
