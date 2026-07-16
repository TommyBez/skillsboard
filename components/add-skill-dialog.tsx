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
import { Textarea } from "@/components/ui/textarea"

interface AddSkillDialogProps {
  defaultUrl?: string
  defaultName?: string
  triggerLabel?: string
  triggerAriaLabel?: string
}

export function AddSkillDialog({
  defaultUrl = "",
  defaultName = "",
  triggerLabel = "Save a skill",
  triggerAriaLabel,
}: AddSkillDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const note = String(formData.get("note") ?? "").trim()
      const result = await addSkill({
        githubUrl: String(formData.get("githubUrl")),
        skillName: String(formData.get("skillName")),
        tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
        ...(note ? { note } : {}),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Skill saved to your team library")
      setIsOpen(false)
    } catch (error) {
      console.error("Unable to save skill", error)
      toast.error("We couldn’t save this skill. Check the repository URL and skill name, then try again.")
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
            <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">Save a skill</DialogTitle>
            <DialogDescription className="max-w-md leading-relaxed">
              Add its repository, skill name, and an optional note for your team. Skills Board keeps the latest source, install command, and ZIP together.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 p-6">
            <Field>
              <FieldLabel htmlFor="githubUrl">GitHub repository URL</FieldLabel>
              <Input id="githubUrl" name="githubUrl" type="url" defaultValue={defaultUrl} placeholder="https://github.com/vercel-labs/skills" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="skillName">Skill name</FieldLabel>
              <Input id="skillName" name="skillName" defaultValue={defaultName} placeholder="find-skills" required />
              <FieldDescription>This becomes the value after --skill in the install command.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
              <Textarea id="note" name="note" rows={3} maxLength={500} placeholder="Why this skill belongs in the library, or when to use it." />
              <FieldDescription>Shared with your team in the library. Up to 500 characters.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="tags">Tags (optional)</FieldLabel>
              <Input id="tags" name="tags" placeholder="research, productivity" />
              <FieldDescription>Comma-separated, up to 10 tags.</FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button type="submit" disabled={isPending}>{isPending ? "Fetching repository…" : "Save to library"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
