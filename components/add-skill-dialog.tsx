"use client"

import { useRef, useState } from "react"
import { GitBranchIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkill, discoverRepositorySkills } from "@/app/actions/skills"
import { PromptExamplesEditor } from "@/components/prompt-examples-editor"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { DiscoveredGitHubSkill } from "@/lib/github-skill-discovery"

interface AddSkillDialogProps {
  defaultUrl?: string
  defaultName?: string
  triggerLabel?: string
  triggerAriaLabel?: string
}

const SKILL_VALUE_PREFIX = "skillsboard:"

function selectValue(path: string) {
  return `${SKILL_VALUE_PREFIX}${path}`
}

function skillPath(value: string | null) {
  return value?.startsWith(SKILL_VALUE_PREFIX)
    ? value.slice(SKILL_VALUE_PREFIX.length)
    : value
}

export function AddSkillDialog({
  defaultUrl = "",
  defaultName = "",
  triggerLabel = "Save a skill",
  triggerAriaLabel,
}: AddSkillDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState<"discover" | "save" | null>(null)
  const [repositoryUrl, setRepositoryUrl] = useState(defaultUrl)
  const [inspectedUrl, setInspectedUrl] = useState<string | null>(null)
  const [skills, setSkills] = useState<DiscoveredGitHubSkill[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const discoveryRequest = useRef(0)

  const selectedSkill = selectedPath === null
    ? null
    : skills.find((skill) => skill.path === selectedPath) ?? null
  const hasDiscovery = inspectedUrl !== null && skills.length > 0

  function resetDiscovery() {
    discoveryRequest.current += 1
    setInspectedUrl(null)
    setSkills([])
    setSelectedPath(null)
    setPendingMode(null)
  }

  async function inspectRepository(value = repositoryUrl) {
    const requestId = discoveryRequest.current + 1
    discoveryRequest.current = requestId
    setPendingMode("discover")

    try {
      const result = await discoverRepositorySkills({ githubUrl: value })
      if (requestId !== discoveryRequest.current) return
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const linked = result.linkedSkillPath === null
        ? undefined
        : result.skills.find((skill) => skill.path === result.linkedSkillPath)
      const preferred = result.skills.find((skill) => (
        skill.name.toLowerCase() === defaultName.trim().toLowerCase()
      ))
      const selection = linked
        ?? preferred
        ?? (result.skills.length === 1 ? result.skills[0] : null)

      setRepositoryUrl(result.githubUrl)
      setInspectedUrl(result.githubUrl)
      setSkills(result.skills)
      setSelectedPath(selection?.path ?? null)
    } catch (error) {
      if (requestId !== discoveryRequest.current) return
      console.error("Unable to inspect repository", error)
      toast.error("We couldn’t inspect this repository. Check the URL and try again.")
    } finally {
      if (requestId === discoveryRequest.current) setPendingMode(null)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)

    if (!nextOpen) {
      resetDiscovery()
      setRepositoryUrl(defaultUrl)
      return
    }

    if (defaultUrl) void inspectRepository(defaultUrl)
  }

  async function handleSubmit(formData: FormData) {
    if (!inspectedUrl) {
      await inspectRepository()
      return
    }
    if (selectedPath === null) {
      toast.error("Choose a skill from this repository.")
      return
    }

    setPendingMode("save")
    try {
      const note = String(formData.get("note") ?? "").trim()
      const examplePrompts = formData
        .getAll("examplePrompts")
        .map((prompt) => String(prompt).trim())
        .filter(Boolean)
      const result = await addSkill({
        githubUrl: inspectedUrl,
        skillPath: selectedPath,
        tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
        ...(note ? { note } : {}),
        examplePrompts,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Skill saved to your team library")
      handleOpenChange(false)
    } catch (error) {
      console.error("Unable to save skill", error)
      toast.error("We couldn’t save this skill. Check the repository and try again.")
    } finally {
      setPendingMode(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              Add its GitHub repository or direct skill link. Skills Board finds the installable skills and keeps the selected source, command, and ZIP together.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 p-6">
            <Field>
              <FieldLabel htmlFor="githubUrl">GitHub repository or skill URL</FieldLabel>
              <Input
                id="githubUrl"
                name="githubUrl"
                type="url"
                value={repositoryUrl}
                onChange={(event) => {
                  setRepositoryUrl(event.target.value)
                  resetDiscovery()
                }}
                disabled={pendingMode !== null}
                placeholder="https://github.com/vercel-labs/skills"
                required
              />
              <FieldDescription>Paste a repository or a direct skill link. We read its valid SKILL.md metadata; the install name is not entered manually.</FieldDescription>
            </Field>

            {skills.length > 1 ? (
              <Field className="reveal-enter">
                <FieldLabel htmlFor="skillPath">Skill</FieldLabel>
                <Select
                  id="skillPath"
                  value={selectedPath === null ? null : selectValue(selectedPath)}
                  onValueChange={(value) => setSelectedPath(skillPath(value))}
                  required
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Choose a skill from this repository" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {skills.map((skill) => (
                      <SelectItem key={`${skill.name}:${skill.path}`} value={selectValue(skill.path)}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>{selectedSkill?.description ?? `${skills.length} installable skills found.`}</FieldDescription>
              </Field>
            ) : selectedSkill ? (
              <Field className="reveal-enter">
                <FieldLabel>Skill found</FieldLabel>
                <div className="rounded-xl border border-border bg-muted/35 p-4">
                  <p className="font-mono text-sm font-semibold text-foreground">{selectedSkill.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{selectedSkill.description}</p>
                </div>
              </Field>
            ) : null}

            {selectedSkill ? (
              <div className="reveal-enter flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
                  <Textarea id="note" name="note" rows={3} maxLength={500} placeholder="Why this skill belongs in the library, or when to use it." />
                  <FieldDescription>Shared with your team in the library. Up to 500 characters.</FieldDescription>
                </Field>
                <PromptExamplesEditor disabled={pendingMode !== null} />
                <Field>
                  <FieldLabel htmlFor="tags">Tags (optional)</FieldLabel>
                  <Input id="tags" name="tags" placeholder="research, productivity" />
                  <FieldDescription>Comma-separated, up to 10 tags.</FieldDescription>
                </Field>
              </div>
            ) : null}
          </FieldGroup>

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button
              type="submit"
              disabled={pendingMode !== null || !repositoryUrl.trim() || (hasDiscovery && selectedPath === null)}
            >
              {pendingMode === "discover"
                ? "Inspecting repository…"
                : pendingMode === "save"
                  ? "Saving skill…"
                  : selectedSkill
                    ? "Save to library"
                    : hasDiscovery
                      ? "Choose a skill"
                      : "Find skills"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
