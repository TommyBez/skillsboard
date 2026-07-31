"use client"

/**
 * ⌘K for the app shell.
 *
 * Built on components/interior/command-palette.tsx (ported from
 * https://www.interior.dev/docs/command-palette). The app had three separate
 * search surfaces — Library, Collections, Discover — and no way to move
 * between them from the keyboard, which for a tool whose job is retrieving a
 * skill fast was the biggest single gap the audit found.
 */

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  CableIcon,
  CompassIcon,
  FolderOpenIcon,
  LibraryBigIcon,
  UsersIcon,
} from "lucide-react"

import {
  CommandPalette,
  type CommandItem,
} from "@/components/interior/command-palette"

const items: CommandItem[] = [
  {
    id: "library",
    label: "Team library",
    group: "Go to",
    keywords: "skills saved recommendations",
    icon: <LibraryBigIcon className="size-4" />,
  },
  {
    id: "discover",
    label: "Discover public skills",
    group: "Go to",
    keywords: "catalog browse trending search public",
    icon: <CompassIcon className="size-4" />,
  },
  {
    id: "collections",
    label: "Collections",
    group: "Go to",
    keywords: "groups folders sets",
    icon: <FolderOpenIcon className="size-4" />,
  },
  {
    id: "settings/mcp",
    label: "MCP setup",
    group: "Settings",
    keywords: "connect agent claude codex cursor client",
    icon: <CableIcon className="size-4" />,
  },
  {
    id: "settings/organization",
    label: "Team access",
    group: "Settings",
    keywords: "members invite roles organization",
    icon: <UsersIcon className="size-4" />,
  },
]

export function CommandMenu() {
  const router = useRouter()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((wasOpen) => !wasOpen)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const dismiss = useCallback(() => setOpen(false), [])

  const select = useCallback(
    (item: CommandItem) => {
      setOpen(false)
      router.push(`/${item.id}`)
    },
    [router]
  )

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.16 }}
        >
          <button
            type="button"
            aria-label="Close command palette"
            onClick={dismiss}
            className="absolute inset-0 cursor-default bg-black/25 supports-backdrop-filter:backdrop-blur-xs"
          />
          <motion.div
            className="relative w-full max-w-lg"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{
              duration: reduced ? 0.1 : 0.2,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <CommandPalette
              items={items}
              onSelect={select}
              onDismiss={dismiss}
              placeholder="Search skills, collections and settings"
              label="Command palette"
              maxRows={6}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
