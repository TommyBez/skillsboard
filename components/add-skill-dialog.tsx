"use client"

import { useState } from "react"
import { GitBranchIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkill } from "@/app/actions/skills"
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
import { Input } from "@/components/ui/input"

interface AddSkillDialogProps {
  defaultUrl?: string
  defaultName?: string
  triggerLabel?: string
  triggerAriaLabel?: string
}

export function AddSkillDialog({
  defaultUrl = "",
  defaultName = "",
  triggerLabel = "Add skill",
  triggerAriaLabel,
}: AddSkillDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const result = await addSkill({
        githubUrl: String(formData.get("githubUrl")),
        skillName: String(formData.get("skillName")),
        tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Skill saved to your team library")
      setIsOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save skill")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button aria-label={triggerAriaLabel} />}>
        <PlusIcon data-icon="inline-start" />{triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-xl">
        <form action={handleSubmit}>
          <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GitBranchIcon className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">Add a GitHub skill</DialogTitle>
            <DialogDescription className="max-w-md leading-relaxed">
              Save the source location so your team always installs from the current repository.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 p-6">
            <Field>
              <FieldLabel htmlFor="githubUrl">GitHub repository</FieldLabel>
              <Input id="githubUrl" name="githubUrl" type="url" defaultValue={defaultUrl} placeholder="https://github.com/vercel-labs/skills" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="skillName">Skill name</FieldLabel>
              <Input id="skillName" name="skillName" defaultValue={defaultName} placeholder="find-skills" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <Input id="tags" name="tags" placeholder="research, productivity" />
              <FieldDescription>Comma-separated, up to 10 tags.</FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button type="submit" disabled={isPending}>{isPending ? "Fetching GitHub metadata..." : "Save skill"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
