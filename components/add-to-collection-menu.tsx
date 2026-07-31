"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FolderPlusIcon, Loader2Icon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkillToCollection, removeSkillFromCollection } from "@/app/actions/collections"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AddToCollectionMenuProps {
  skillId: string
  skillName: string
  collections: { id: string; title: string }[]
  memberCollectionIds: string[]
}

export function AddToCollectionMenu({
  skillId,
  skillName,
  collections,
  memberCollectionIds,
}: AddToCollectionMenuProps) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  // Optimistic membership on top of the server-provided list: checkboxes
  // flip the moment they are clicked, several can save at once, and only a
  // failed toggle snaps back.
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const serverMemberIds = new Set(memberCollectionIds)
  const isMember = (collectionId: string) =>
    overrides.get(collectionId) ?? serverMemberIds.has(collectionId)
  const memberCount = collections.reduce(
    (total, item) => total + (isMember(item.id) ? 1 : 0),
    0,
  )

  async function toggleMembership(collectionId: string, collectionTitle: string, nextChecked: boolean) {
    const wasChecked = isMember(collectionId)
    setOverrides((current) => new Map(current).set(collectionId, nextChecked))
    setPendingIds((current) => new Set(current).add(collectionId))
    try {
      const result = nextChecked
        ? await addSkillToCollection({ collectionId, skillId, surface: "library" })
        : await removeSkillFromCollection({ collectionId, skillId, surface: "library" })
      if (!result.ok) {
        setOverrides((current) => new Map(current).set(collectionId, wasChecked))
        toast.error(result.error)
        return
      }
      toast.success(nextChecked
        ? `Added to ${collectionTitle}`
        : `Removed from ${collectionTitle}`)
      router.refresh()
    } catch (error) {
      setOverrides((current) => new Map(current).set(collectionId, wasChecked))
      console.error("Unable to update collection membership", error)
      toast.error("We couldn’t update this collection. Try again.")
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(collectionId)
        return next
      })
    }
  }

  async function handleCreated(collectionId: string) {
    try {
      const result = await addSkillToCollection({ collectionId, skillId, surface: "library" })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Added ${skillName} to the new collection`)
    } catch (error) {
      console.error("Unable to add skill to the new collection", error)
      toast.error(`The collection was created, but we couldn’t add ${skillName}. Add it from the collection menu.`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <Button
              variant="outline"
              size="sm"
              aria-busy={pendingIds.size > 0 || undefined}
              aria-label={`Manage collections for ${skillName}`}
            />
          )}
        >
          {pendingIds.size > 0 ? (
            <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" />
          ) : (
            <FolderPlusIcon data-icon="inline-start" />
          )}
          {memberCount ? `Collections (${memberCount})` : "Add to collection"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{collections.length ? "Add to collection" : "No collections yet"}</DropdownMenuLabel>
            {collections.map((item) => {
              const isSaving = pendingIds.has(item.id)
              return (
                <DropdownMenuCheckboxItem
                  key={item.id}
                  checked={isMember(item.id)}
                  closeOnClick={false}
                  disabled={isSaving}
                  onCheckedChange={(nextChecked) => void toggleMembership(item.id, item.title, nextChecked)}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {isSaving ? (
                      <Loader2Icon className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
                    ) : null}
                    <span className="truncate">{item.title}</span>
                  </span>
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuGroup>
          {collections.length ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <PlusIcon aria-hidden="true" />
            New collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateCollectionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
    </>
  )
}
