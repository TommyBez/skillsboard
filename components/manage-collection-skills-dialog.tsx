"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkillToCollection, removeSkillFromCollection } from "@/app/actions/collections"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface CollectionSkillOption {
  id: string
  title: string
  source: string
  inCollection: boolean
}

interface ManageCollectionSkillsDialogProps {
  collectionId: string
  collectionTitle: string
  skills: CollectionSkillOption[]
}

export function ManageCollectionSkillsDialog({
  collectionId,
  collectionTitle,
  skills,
}: ManageCollectionSkillsDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  // Optimistic membership overrides on top of the server-provided props, and
  // a per-row pending set: rows flip instantly, several can save at once, and
  // only a failed row snaps back.
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const normalizedQuery = query.toLowerCase().trim()
  const visibleSkills = skills.filter((item) => (
    !normalizedQuery || `${item.title} ${item.source}`.toLowerCase().includes(normalizedQuery)
  ))
  const isInCollection = (skill: CollectionSkillOption) =>
    overrides.get(skill.id) ?? skill.inCollection

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      setQuery("")
      setOverrides(new Map())
    }
  }

  async function toggleSkill(skill: CollectionSkillOption) {
    const wasInCollection = isInCollection(skill)
    setOverrides((current) => new Map(current).set(skill.id, !wasInCollection))
    setPendingIds((current) => new Set(current).add(skill.id))
    try {
      const result = wasInCollection
        ? await removeSkillFromCollection({ collectionId, skillId: skill.id, surface: "collection_detail" })
        : await addSkillToCollection({ collectionId, skillId: skill.id, surface: "collection_detail" })
      if (!result.ok) {
        setOverrides((current) => new Map(current).set(skill.id, wasInCollection))
        toast.error(result.error)
        return
      }
      toast.success(wasInCollection
        ? `Removed ${skill.title} from ${collectionTitle}`
        : `Added ${skill.title} to ${collectionTitle}`)
      router.refresh()
    } catch (error) {
      setOverrides((current) => new Map(current).set(skill.id, wasInCollection))
      console.error("Unable to update collection skills", error)
      toast.error("We couldn’t update this collection. Try again.")
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(skill.id)
        return next
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" aria-label={`Add skills to ${collectionTitle}`} />}>
        <PlusIcon data-icon="inline-start" />
        Add skills
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
          <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PlusIcon className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">Add skills</DialogTitle>
          <DialogDescription className="max-w-md leading-relaxed">
            Pick skills from your team library to include in {collectionTitle}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your library"
              className="pl-10"
              aria-label="Search skills in your team library"
            />
          </div>

          {visibleSkills.length ? (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
              {visibleSkills.map((item) => {
                const inCollection = isInCollection(item)
                const isSaving = pendingIds.has(item.id)
                return (
                  <li
                    key={item.id}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-card/80 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{item.source}</p>
                    </div>
                    <Button
                      variant={inCollection ? "outline" : "default"}
                      size="sm"
                      disabled={isSaving}
                      aria-busy={isSaving || undefined}
                      onClick={() => void toggleSkill(item)}
                      aria-label={inCollection
                        ? `Remove ${item.title} from ${collectionTitle}`
                        : `Add ${item.title} to ${collectionTitle}`}
                    >
                      <ButtonPendingContent
                        pending={isSaving}
                        pendingLabel="Saving…"
                      >
                        {inCollection ? "Remove" : "Add"}
                      </ButtonPendingContent>
                    </Button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              {skills.length
                ? "No skills match this search."
                : "Your team library is empty. Save a skill first, then add it here."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
