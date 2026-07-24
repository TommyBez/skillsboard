"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FolderMinusIcon } from "lucide-react"
import { toast } from "sonner"

import { removeSkillFromCollection } from "@/app/actions/collections"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"

interface RemoveFromCollectionButtonProps {
  collectionId: string
  collectionTitle: string
  skillId: string
  skillName: string
}

export function RemoveFromCollectionButton({
  collectionId,
  collectionTitle,
  skillId,
  skillName,
}: RemoveFromCollectionButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleRemove() {
    setIsPending(true)
    try {
      const result = await removeSkillFromCollection({
        collectionId,
        skillId,
        surface: "collection_detail",
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Removed ${skillName} from ${collectionTitle}`)
      router.refresh()
    } catch (error) {
      console.error("Unable to remove skill from collection", error)
      toast.error("We couldn’t remove this skill. Try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      aria-busy={isPending || undefined}
      onClick={handleRemove}
      aria-label={`Remove ${skillName} from the ${collectionTitle} collection`}
    >
      <ButtonPendingContent pending={isPending} pendingLabel="Removing…">
        <FolderMinusIcon data-icon="inline-start" />
        Remove
      </ButtonPendingContent>
    </Button>
  )
}
