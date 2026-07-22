"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FolderPlusIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkillToCollection, removeSkillFromCollection } from "@/app/actions/collections"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
  const [pendingCollectionId, setPendingCollectionId] = useState<string | null>(null)
  const memberIds = new Set(memberCollectionIds)

  async function toggleMembership(collectionId: string, collectionTitle: string, nextChecked: boolean) {
    setPendingCollectionId(collectionId)
    try {
      const result = nextChecked
        ? await addSkillToCollection({ collectionId, skillId, surface: "library" })
        : await removeSkillFromCollection({ collectionId, skillId, surface: "library" })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(nextChecked
        ? `Added to ${collectionTitle}`
        : `Removed from ${collectionTitle}`)
      router.refresh()
    } catch (error) {
      console.error("Unable to update collection membership", error)
      toast.error("We couldn’t update this collection. Try again.")
    } finally {
      setPendingCollectionId(null)
    }
  }

  async function handleCreated(collectionId: string) {
    const result = await addSkillToCollection({ collectionId, skillId, surface: "library" })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`Added ${skillName} to the new collection`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <Button
              variant="outline"
              size="sm"
              aria-label={`Manage collections for ${skillName}`}
            />
          )}
        >
          <FolderPlusIcon data-icon="inline-start" />
          {memberIds.size ? `Collections (${memberIds.size})` : "Add to collection"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>{collections.length ? "Add to collection" : "No collections yet"}</DropdownMenuLabel>
          {collections.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={memberIds.has(item.id)}
              closeOnClick={false}
              disabled={pendingCollectionId !== null}
              onCheckedChange={(nextChecked) => void toggleMembership(item.id, item.title, nextChecked)}
            >
              <span className="truncate">{item.title}</span>
            </DropdownMenuCheckboxItem>
          ))}
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
