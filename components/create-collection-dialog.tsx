"use client"

import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { FolderPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { createCollection } from "@/app/actions/collections"
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

interface CreateCollectionDialogProps {
  triggerLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreated?: (collectionId: string) => Promise<void> | void
}

export function CreateCollectionDialog({
  triggerLabel = "New collection",
  open,
  onOpenChange,
  onCreated,
}: CreateCollectionDialogProps) {
  const router = useRouter()
  const idPrefix = useId()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const description = String(formData.get("description") ?? "").trim()
      const result = await createCollection({
        title: String(formData.get("title") ?? ""),
        ...(description ? { description } : {}),
        tags: parseCollectionTags(formData.get("tags")),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Collection created")
      handleOpenChange(false)
      try {
        // The collection already exists: a follow-up failure must not
        // reopen the dialog or read as a creation error. Callers surface
        // their own feedback.
        await onCreated?.(result.collectionId)
      } catch (error) {
        console.error("Collection created, but the follow-up action failed", error)
      }
      router.refresh()
    } catch (error) {
      console.error("Unable to create collection", error)
      toast.error("We couldn’t create this collection. Try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {isControlled ? null : (
        <DialogTrigger render={<Button />}>
          <FolderPlusIcon data-icon="inline-start" />
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-lg">
        <form action={handleSubmit}>
          <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FolderPlusIcon className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">New collection</DialogTitle>
            <DialogDescription className="max-w-md leading-relaxed">
              Group related skills by use case or project so teammates can find the whole set at once. Collections are visible to everyone in your team.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 p-6">
            <CollectionDetailsFields idPrefix={idPrefix} disabled={isPending} />
          </FieldGroup>

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
