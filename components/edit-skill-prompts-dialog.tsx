"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { MessageSquarePlusIcon, PencilLineIcon } from "lucide-react"
import { toast } from "sonner"

import { updateSkillExamplePrompts } from "@/app/actions/skills"
import { PromptExamplesEditor } from "@/components/prompt-examples-editor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EditSkillPromptsDialogProps {
  skillId: string
  skillName: string
  prompts: string[]
}

export function EditSkillPromptsDialog({
  skillId,
  skillName,
  prompts,
}: EditSkillPromptsDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const hasPrompts = prompts.length > 0

  async function handleSubmit(formData: FormData) {
    const examplePrompts = formData
      .getAll("examplePrompts")
      .map((prompt) => String(prompt).trim())
      .filter(Boolean)

    setIsPending(true)
    try {
      const result = await updateSkillExamplePrompts({
        skillId,
        examplePrompts,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(examplePrompts.length
        ? `${examplePrompts.length} example ${examplePrompts.length === 1 ? "prompt" : "prompts"} saved`
        : "Example prompts removed")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unable to update example prompts", error)
      toast.error("We couldn’t update these prompts. Try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={(
          <Button
            variant="outline"
            size="sm"
            aria-label={`${hasPrompts ? "Edit" : "Add"} example prompts for ${skillName}`}
          />
        )}
      >
        {hasPrompts
          ? <PencilLineIcon data-icon="inline-start" />
          : <MessageSquarePlusIcon data-icon="inline-start" />}
        {hasPrompts ? "Edit prompts" : "Add prompts"}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-2xl">
        <form action={handleSubmit}>
          <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              {hasPrompts
                ? <PencilLineIcon className="size-5" aria-hidden="true" />
                : <MessageSquarePlusIcon className="size-5" aria-hidden="true" />}
            </span>
            <DialogTitle className="text-balance text-2xl font-semibold tracking-[-0.035em]">
              {hasPrompts ? "Edit" : "Add"} example prompts
            </DialogTitle>
            <DialogDescription className="max-w-lg leading-relaxed">
              Show your team how to start with {skillName}. Every member of this team can improve this shared list.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <PromptExamplesEditor defaultValue={prompts} disabled={isPending} />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/35 p-4 sm:flex-row sm:justify-end">
            <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving prompts…" : "Save prompts"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
