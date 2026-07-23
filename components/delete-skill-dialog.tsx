"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteSkill } from "@/app/actions/skills"
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

interface DeleteSkillDialogProps {
  skillId: string
  skillName: string
}

export function DeleteSkillDialog({ skillId, skillName }: DeleteSkillDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    setIsPending(true)
    try {
      const result = await deleteSkill({ skillId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Skill removed from the library")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unable to delete skill", error)
      toast.error("We couldn’t delete this skill. Try again.")
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
            size="icon-sm"
            className="size-8 rounded-lg"
            aria-label={`Delete ${skillName} from the library`}
            title="Delete"
          />
        }
      >
        <Trash2Icon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {skillName}?</DialogTitle>
          <DialogDescription>
            This removes the skill from your team library. The source repository is not affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Deleting…" : "Delete skill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
