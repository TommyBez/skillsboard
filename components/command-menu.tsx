"use client"

/**
 * ⌘K for the app shell.
 *
 * Built on components/interior/command-palette.tsx (ported from
 * https://www.interior.dev/docs/command-palette). Originally five static
 * navigation rows; now it searches the team's actual skills and collections
 * (server-rendered into the shell by components/command-menu-index.tsx) and
 * can act without leaving the keyboard: Enter jumps to a skill in the
 * library, ⌘Enter copies its install command, and the Actions group opens
 * the save-skill and new-collection dialogs from any page.
 *
 * This file is only the controller: the global shortcut, the open state, and
 * a lazy mount of components/command-menu-body.tsx. The palette surface and
 * its dialogs ship as a separate chunk that is warmed during idle time, so
 * the shell pays nothing for ⌘K on initial load.
 */

import { Suspense, lazy, useEffect, useState } from "react"

const loadBody = () => import("@/components/command-menu-body")
const CommandMenuBody = lazy(async () => ({
  default: (await loadBody()).CommandMenuBody,
}))

export interface CommandIndex {
  skills: {
    id: string
    title: string
    skillName: string
    source: string
    tags: string[]
    command: string
  }[]
  collections: {
    id: string
    title: string
    skillCount: number
  }[]
}

export function CommandMenu({ index = null }: { index?: CommandIndex | null }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setMounted(true)
        setOpen((wasOpen) => !wasOpen)
      }
    }
    function onOpenRequest() {
      setMounted(true)
      setOpen(true)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("skillsboard:open-command-menu", onOpenRequest)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("skillsboard:open-command-menu", onOpenRequest)
    }
  }, [])

  // Warm the palette chunk once the page is idle so the first ⌘K feels
  // instant without the chunk competing with hydration.
  useEffect(() => {
    const warm = () => void loadBody()
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(idle)
    }
    const timer = window.setTimeout(warm, 2000)
    return () => window.clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <Suspense fallback={null}>
      <CommandMenuBody index={index} open={open} onOpenChange={setOpen} />
    </Suspense>
  )
}
