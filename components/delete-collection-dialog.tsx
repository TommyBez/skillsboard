"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteCollection } from "@/app/actions/collections"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteCollectionDialogProps {
  collectionId: string
  collectionTitle: string
}

export function DeleteCollectionDialog({ collectionId, collectionTitle }: DeleteCollectionDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    setIsPending(true)
    try {
      const result = await deleteCollection({ collectionId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Collection deleted")
      setIsOpen(false)
      router.push("/collections")
      router.refresh()
    } catch (error) {
      console.error("Unable to delete collection", error)
      toast.error("We couldn’t delete this collection. Try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Delete the ${collectionTitle} collection`}
          />
        }
      >
        <Trash2Icon data-icon="inline-start" />
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {collectionTitle}?</DialogTitle>
          <DialogDescription>
            This removes the collection for the whole team. The skills inside it stay in your library.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Deleting…" : "Delete collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
