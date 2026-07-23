"use client"

import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { FolderPenIcon } from "lucide-react"
import { toast } from "sonner"

import { updateCollection } from "@/app/actions/collections"
import { CollectionDetailsFields, parseCollectionTags } from "@/components/collection-details-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"

interface EditCollectionDialogProps {
  collectionId: string
  title: string
  description?: string | null
  tags: string[]
}

export function EditCollectionDialog({
  collectionId,
  title,
  description,
  tags,
}: EditCollectionDialogProps) {
  const router = useRouter()
  const idPrefix = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const nextDescription = String(formData.get("description") ?? "").trim()
      const result = await updateCollection({
        collectionId,
        title: String(formData.get("title") ?? ""),
        ...(nextDescription ? { description: nextDescription } : {}),
        tags: parseCollectionTags(formData.get("tags")),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Collection updated")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unable to update collection", error)
      toast.error("We couldn’t update this collection. Try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" aria-label={`Edit the ${title} collection`} />}
      >
        <FolderPenIcon data-icon="inline-start" />
        Edit collection
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-lg">
        <form action={handleSubmit}>
          <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FolderPenIcon className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">Edit collection</DialogTitle>
            <DialogDescription className="max-w-md leading-relaxed">
              Update the title, description, and tags your team sees for this collection.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 p-6">
            <CollectionDetailsFields
              idPrefix={idPrefix}
              defaultTitle={title}
              defaultDescription={description}
              defaultTags={tags}
              disabled={isPending}
            />
          </FieldGroup>

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
