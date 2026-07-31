"use client"

import { useRef, useState, type FormEvent } from "react"
import { GitBranchIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { addSkills, discoverRepositorySkills } from "@/app/actions/skills"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { TaskSteps } from "@/components/interior/task-steps"
import { PromptExamplesEditor } from "@/components/prompt-examples-editor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { DiscoveredGitHubSkill } from "@/lib/github-skill-discovery"

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
  const [pendingMode, setPendingMode] = useState<"discover" | "save" | null>(null)
  const [repositoryUrl, setRepositoryUrl] = useState(defaultUrl)
  const [inspectedUrl, setInspectedUrl] = useState<string | null>(null)
  const [skills, setSkills] = useState<DiscoveredGitHubSkill[]>([])
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const discoveryRequest = useRef(0)
  const lastSinglePath = useRef<string | null>(null)

  const selectedSkills = skills.filter((skill) => selectedPaths.includes(skill.path))
  const selectedCount = selectedSkills.length
  const singleSelectedSkill = selectedCount === 1 ? selectedSkills[0] : null
  // Note/prompts stay mounted through multi-select excursions so typed text
  // survives, but must reset when the single selection becomes a different
  // skill — the key below tracks the last single-selected skill's identity.
  if (singleSelectedSkill) lastSinglePath.current = singleSelectedSkill.path
  const allSelected = skills.length > 0 && selectedCount === skills.length
  const hasDiscovery = inspectedUrl !== null && skills.length > 0

  function resetDiscovery() {
    discoveryRequest.current += 1
    setInspectedUrl(null)
    setSkills([])
    setSelectedPaths([])
    setPendingMode(null)
    lastSinglePath.current = null
  }

  function toggleSkill(path: string, checked: boolean) {
    setSelectedPaths((current) => {
      if (checked) return current.includes(path) ? current : [...current, path]
      return current.filter((selected) => selected !== path)
    })
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
      setSelectedPaths(selection ? [selection.path] : [])
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
    if (selectedCount === 0) {
      toast.error("Choose at least one skill from this repository.")
      return
    }

    setPendingMode("save")
    try {
      // Notes and example prompts are skill-specific, so they only apply to
      // single-skill saves; their fields stay mounted (hidden) to keep typed
      // text while the selection changes.
      const note = singleSelectedSkill ? String(formData.get("note") ?? "").trim() : ""
      const examplePrompts = singleSelectedSkill
        ? formData
            .getAll("examplePrompts")
            .map((prompt) => String(prompt).trim())
            .filter(Boolean)
        : []
      const result = await addSkills({
        githubUrl: inspectedUrl,
        skillPaths: selectedSkills.map((skill) => skill.path),
        tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
        ...(note ? { note } : {}),
        examplePrompts,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const skippedCount = result.alreadySaved.length
      if (result.savedCount === 0) {
        toast.error(skippedCount === 1
          ? "This skill is already in your team library"
          : "These skills are already in your team library")
        return
      }

      toast.success(
        result.savedCount === 1
          ? "Skill saved to your team library"
          : `${result.savedCount} skills saved to your team library`,
        skippedCount
          ? {
              description: skippedCount === 1
                ? "1 skill was skipped because it is already in your library."
                : `${skippedCount} skills were skipped because they are already in your library.`,
            }
          : undefined,
      )
      handleOpenChange(false)
    } catch (error) {
      console.error("Unable to save skills", error)
      toast.error("We couldn’t save the selected skills. Check the repository and try again.")
    } finally {
      setPendingMode(null)
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    // Avoid React 19 form actions: useState pending updates inside actions
    // are deferred and never paint while the request is in flight.
    event.preventDefault()
    void handleSubmit(new FormData(event.currentTarget))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button aria-label={triggerAriaLabel} />}>
        <PlusIcon data-icon="inline-start" />{triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-xl">
        <form onSubmit={handleFormSubmit}>
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
                <FieldLabel id="skillSelectionLabel">Skills in this repository</FieldLabel>
                <div
                  role="group"
                  aria-labelledby="skillSelectionLabel"
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <label className="flex cursor-pointer items-center gap-3 border-b border-border bg-muted/35 px-4 py-2.5">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => (
                        setSelectedPaths(checked ? skills.map((skill) => skill.path) : [])
                      )}
                      disabled={pendingMode !== null}
                      aria-label={allSelected ? "Deselect all skills" : "Select all skills"}
                    />
                    <span className="text-sm font-medium text-foreground">Select all</span>
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {selectedCount} of {skills.length} selected
                    </span>
                  </label>
                  <div className="max-h-60 divide-y divide-border overflow-y-auto">
                    {skills.map((skill) => (
                      <label
                        key={`${skill.name}:${skill.path}`}
                        className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 has-[[data-checked]]:bg-muted/25"
                      >
                        <Checkbox
                          checked={selectedPaths.includes(skill.path)}
                          onCheckedChange={(checked) => toggleSkill(skill.path, checked)}
                          disabled={pendingMode !== null}
                          className="mt-0.5"
                          aria-label={`Select ${skill.name}`}
                        />
                        <span className="min-w-0">
                          <span className="block font-mono text-sm font-semibold text-foreground">{skill.name}</span>
                          <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{skill.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <FieldDescription>Choose one, several, or all skills to save to your team library.</FieldDescription>
              </Field>
            ) : singleSelectedSkill ? (
              <Field className="reveal-enter">
                <FieldLabel>Skill found</FieldLabel>
                <div className="rounded-xl border border-border bg-muted/35 p-4">
                  <p className="font-mono text-sm font-semibold text-foreground">{singleSelectedSkill.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{singleSelectedSkill.description}</p>
                </div>
              </Field>
            ) : null}

            {selectedCount > 0 ? (
              <div className="reveal-enter flex flex-col gap-5">
                <div
                  key={lastSinglePath.current ?? "none"}
                  className={singleSelectedSkill ? "flex flex-col gap-5" : "hidden"}
                >
                  <Field>
                    <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
                    <Textarea id="note" name="note" rows={3} maxLength={500} placeholder="Why this skill belongs in the library, or when to use it." />
                    <FieldDescription>Shared with your team in the library. Up to 500 characters.</FieldDescription>
                  </Field>
                  <PromptExamplesEditor disabled={pendingMode !== null} />
                </div>
                <Field>
                  <FieldLabel htmlFor="tags">Tags (optional)</FieldLabel>
                  <Input id="tags" name="tags" placeholder="research, productivity" />
                  <FieldDescription>
                    {selectedCount > 1
                      ? `Comma-separated, up to 10 tags, applied to all ${selectedCount} selected skills. Notes and example prompts can be added to each skill after saving.`
                      : "Comma-separated, up to 10 tags."}
                  </FieldDescription>
                </Field>
              </div>
            ) : null}
          </FieldGroup>

          {/* The dialog runs a two-phase operation — inspect the repository,
              then save the selection — and previously showed only a spinner.
              TaskSteps narrates which phase is running and what each one
              produced. */}
          {pendingMode !== null || hasDiscovery ? (
            <div className="border-t border-border px-4 pt-3">
              <TaskSteps
                label="Add skill progress"
                steps={[
                  {
                    id: "inspect",
                    label: "Inspect repository",
                    meta: hasDiscovery ? `${skills.length} found` : undefined,
                  },
                  {
                    id: "select",
                    label: "Choose skills to save",
                    meta: selectedCount > 0 ? `${selectedCount} selected` : undefined,
                  },
                  { id: "save", label: "Save to library" },
                ]}
                current={
                  pendingMode === "discover"
                    ? 0
                    : pendingMode === "save"
                      ? 2
                      : selectedCount > 0
                        ? 2
                        : 1
                }
              />
            </div>
          ) : null}

          <div className="flex justify-end border-t border-border bg-muted/35 p-4">
            <Button
              type="submit"
              disabled={pendingMode !== null || !repositoryUrl.trim() || (hasDiscovery && selectedCount === 0)}
              aria-busy={pendingMode !== null || undefined}
            >
              <ButtonPendingContent
                pending={pendingMode !== null}
                pendingLabel={
                  pendingMode === "discover"
                    ? "Inspecting repository…"
                    : selectedCount > 1
                      ? `Saving ${selectedCount} skills…`
                      : "Saving skill…"
                }
              >
                {selectedCount > 1
                  ? `Save ${selectedCount} skills to library`
                  : selectedCount === 1
                    ? "Save to library"
                    : hasDiscovery
                      ? "Select skills to save"
                      : "Find skills"}
              </ButtonPendingContent>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
