"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkill } from "@/app/actions/skills"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface AddSkillDialogProps { defaultUrl?: string; defaultName?: string; triggerLabel?: string }

export function AddSkillDialog({ defaultUrl = "", defaultName = "", triggerLabel = "Add skill" }: AddSkillDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const result = await addSkill({ githubUrl: String(formData.get("githubUrl")), skillName: String(formData.get("skillName")), tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean) })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Skill saved to your team library")
      setIsOpen(false)
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save skill") }
    finally { setIsPending(false) }
  }
  return <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger render={<Button />}><PlusIcon data-icon="inline-start" />{triggerLabel}</DialogTrigger><DialogContent><form action={handleSubmit} className="flex flex-col gap-6"><DialogHeader><DialogTitle>Add a GitHub skill</DialogTitle><DialogDescription>Save its source location so your team always installs the latest version.</DialogDescription></DialogHeader><FieldGroup><Field><FieldLabel htmlFor="githubUrl">GitHub repository</FieldLabel><Input id="githubUrl" name="githubUrl" type="url" defaultValue={defaultUrl} placeholder="https://github.com/vercel-labs/skills" required /></Field><Field><FieldLabel htmlFor="skillName">Skill name</FieldLabel><Input id="skillName" name="skillName" defaultValue={defaultName} placeholder="find-skills" required /></Field><Field><FieldLabel htmlFor="tags">Tags</FieldLabel><Input id="tags" name="tags" placeholder="research, productivity" /><FieldDescription>Comma-separated, up to 10 tags.</FieldDescription></Field></FieldGroup><DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Fetching GitHub metadata..." : "Save skill"}</Button></DialogFooter></form></DialogContent></Dialog>
}
