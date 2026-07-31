"use client"

/**
 * The heavy half of the ⌘K palette: the palette surface, the skill/collection
 * rows, and the dialogs its actions open. Loaded lazily by
 * components/command-menu.tsx so none of it sits in a route's critical JS —
 * the controller warms this chunk once the page is idle.
 */

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  CableIcon,
  CompassIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  LibraryBigIcon,
  PlusIcon,
  SunMoonIcon,
  TerminalIcon,
  UsersIcon,
} from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import type { CommandIndex } from "@/components/command-menu"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"
import {
  CommandPalette,
  type CommandItem,
  type CommandSelectModifiers,
} from "@/components/interior/command-palette"

const navigationItems: CommandItem[] = [
  {
    id: "go:library",
    label: "Team library",
    group: "Go to",
    keywords: "skills saved recommendations home",
    icon: <LibraryBigIcon className="size-4" />,
  },
  {
    id: "go:discover",
    label: "Discover public skills",
    group: "Go to",
    keywords: "catalog browse trending search public find",
    icon: <CompassIcon className="size-4" />,
  },
  {
    id: "go:collections",
    label: "Collections",
    group: "Go to",
    keywords: "groups folders sets",
    icon: <FolderOpenIcon className="size-4" />,
  },
  {
    id: "go:settings/mcp",
    label: "MCP setup",
    group: "Settings",
    keywords: "connect agent claude codex cursor client",
    icon: <CableIcon className="size-4" />,
  },
  {
    id: "go:settings/organization",
    label: "Team access",
    group: "Settings",
    keywords: "members invite roles organization",
    icon: <UsersIcon className="size-4" />,
  },
]

const actionItems: CommandItem[] = [
  {
    id: "action:add-skill",
    label: "Save a skill from GitHub",
    group: "Actions",
    keywords: "add new create import repository",
    icon: <PlusIcon className="size-4" />,
  },
  {
    id: "action:create-collection",
    label: "New collection",
    group: "Actions",
    keywords: "add create group folder set",
    icon: <FolderPlusIcon className="size-4" />,
  },
  {
    id: "action:toggle-theme",
    label: "Toggle light/dark theme",
    group: "Actions",
    keywords: "dark light mode appearance color scheme",
    icon: <SunMoonIcon className="size-4" />,
  },
]

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

interface CommandMenuBodyProps {
  index: CommandIndex | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenuBody({ index, open, onOpenChange }: CommandMenuBodyProps) {
  const router = useRouter()
  const reduced = useReducedMotion()
  const { setTheme, resolvedTheme } = useTheme()
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false)

  const dismiss = useCallback(() => onOpenChange(false), [onOpenChange])

  const items: CommandItem[] = [
    ...actionItems,
    ...navigationItems,
    ...(index?.skills.map((skill) => ({
      id: `skill:${skill.id}`,
      label: skill.title,
      group: "Skills",
      hint: skill.source,
      keywords: `${skill.skillName} ${skill.source} ${skill.tags.join(" ")}`,
      icon: <TerminalIcon className="size-4" />,
    })) ?? []),
    ...(index?.collections.map((collection) => ({
      id: `collection:${collection.id}`,
      label: collection.title,
      group: "Collections",
      hint: `${collection.skillCount} ${collection.skillCount === 1 ? "skill" : "skills"}`,
      keywords: "collection group set",
      icon: <FolderIcon className="size-4" />,
    })) ?? []),
  ]

  const select = useCallback(
    (item: CommandItem, modifiers: CommandSelectModifiers) => {
      if (item.id.startsWith("go:")) {
        onOpenChange(false)
        router.push(`/${item.id.slice(3)}`)
        return
      }

      if (item.id === "action:add-skill") {
        onOpenChange(false)
        setAddSkillOpen(true)
        return
      }
      if (item.id === "action:create-collection") {
        onOpenChange(false)
        setCreateCollectionOpen(true)
        return
      }
      if (item.id === "action:toggle-theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        return
      }

      if (item.id.startsWith("skill:")) {
        const skill = index?.skills.find((entry) => `skill:${entry.id}` === item.id)
        if (!skill) return
        onOpenChange(false)
        if (modifiers.withCommand) {
          void copyToClipboard(skill.command).then((copied) => {
            if (copied) toast.success(`Install command for ${skill.title} copied`)
            else toast.error("We couldn’t reach the clipboard. Copy it from the skill card instead.")
          })
          return
        }
        router.push(`/library?q=${encodeURIComponent(skill.title)}`)
        return
      }

      if (item.id.startsWith("collection:")) {
        onOpenChange(false)
        router.push(`/collections/${item.id.slice("collection:".length)}`)
      }
    },
    [router, setTheme, resolvedTheme, index, onOpenChange]
  )

  return (
    <>
      <AnimatePresence>
        {open ? (
          <m.div
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.16 }}
          >
            <button
              type="button"
              aria-label="Close command palette"
              tabIndex={-1}
              onClick={dismiss}
              className="absolute inset-0 cursor-default bg-black/25 supports-backdrop-filter:backdrop-blur-xs"
            />
            <m.div
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
                maxRows={7}
                footer={(
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
                    <span><kbd className="rounded border border-border px-1 py-px">↵</kbd> open</span>
                    <span><kbd className="rounded border border-border px-1 py-px">⌘↵</kbd> copy install command</span>
                    <span><kbd className="rounded border border-border px-1 py-px">↑↓</kbd> navigate</span>
                  </p>
                )}
              />
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>

      <AddSkillDialog open={addSkillOpen} onOpenChange={setAddSkillOpen} />
      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
        onCreated={(collectionId) => router.push(`/collections/${collectionId}`)}
      />
    </>
  )
}
