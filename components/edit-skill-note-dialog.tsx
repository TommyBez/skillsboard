"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { NotebookPenIcon } from "lucide-react"
import { toast } from "sonner"

import { updateSkillNote } from "@/app/actions/skills"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

interface EditSkillNoteDialogProps {
  skillId: string
  skillName: string
  note?: string | null
}

export function EditSkillNoteDialog({
  skillId,
  skillName,
  note = "",
}: EditSkillNoteDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const hasNote = Boolean(note?.trim())

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const result = await updateSkillNote({
        skillId,
        note: String(formData.get("note") ?? ""),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(hasNote ? "Note updated" : "Note saved")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unable to update skill note", error)
      toast.error("We couldn’t update this note. Try again.")
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
            aria-label={hasNote ? `Edit note for ${skillName}` : `Add note for ${skillName}`}
          />
        }
      >
        <NotebookPenIcon data-icon="inline-start" />
        {hasNote ? "Edit note" : "Add note"}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-lg">
        <form action={handleSubmit}>
          <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <NotebookPenIcon className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">
              {hasNote ? "Edit note" : "Add note"}
            </DialogTitle>
            <DialogDescription className="max-w-md leading-relaxed">
              Update the note your team sees for {skillName}. Clear the field to remove it.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 p-6">
            <Field>
              <FieldLabel htmlFor={`note-${skillId}`}>Note</FieldLabel>
              <Textarea
                key={note ?? ""}
                id={`note-${skillId}`}
                name="note"
                rows={4}
                maxLength={500}
                defaultValue={note ?? ""}
                placeholder="Why this skill belongs in the library, or when to use it."
              />
              <FieldDescription>Shared with your team in the library. Up to 500 characters.</FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
