"use client"

import { useRef, useState } from "react"
import { ArrowUpRightIcon, CheckIcon, GitForkIcon } from "lucide-react"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CatalogSkill, CatalogSkillDetail } from "@/lib/catalog"
import { buildInstallCommand } from "@/lib/install-command"

interface CatalogSkillDetailsDialogProps {
  item: CatalogSkill
  isSaved: boolean
}

export function CatalogSkillDetailsDialog({
  item,
  isSaved,
}: CatalogSkillDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [detail, setDetail] = useState<CatalogSkillDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestId = useRef(0)

  const name = detail?.name || item.name
  const description = detail?.description || item.description
  const command = buildInstallCommand(item.installUrl, item.slug)
  const installs = detail?.installs ?? item.installs
  const skillsShUrl = `https://skills.sh/${item.source}/${item.slug}`

  async function loadDetail() {
    const currentRequest = requestId.current + 1
    requestId.current = currentRequest
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/catalog/skill?id=${encodeURIComponent(item.id)}`)
      if (requestId.current !== currentRequest) return
      if (!response.ok) throw new Error("Skill details unavailable")
      setDetail((await response.json()) as CatalogSkillDetail)
    } catch (loadError) {
      if (requestId.current !== currentRequest) return
      console.error(loadError)
      setError("Couldn’t load this skill’s description. Try again.")
    } finally {
      if (requestId.current === currentRequest) setIsLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (nextOpen && !detail) void loadDetail()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={`Skill details for ${item.name}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          />
        }
      >
        Skill details
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-xl">
        <div className="grid gap-0">
          <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
            <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
              <GitForkIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{item.source}</span>
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">
              {name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Description and install details for {item.name}.
            </DialogDescription>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {installs.toLocaleString()} {installs === 1 ? "install" : "installs"}
            </p>
          </DialogHeader>

          <div className="grid gap-5 p-6">
            {isLoading && !detail ? (
              <div className="grid gap-3" aria-busy="true" aria-live="polite">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : null}

            {error && !detail ? (
              <div className="grid gap-3">
                <p className="text-sm text-destructive" role="alert">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={() => void loadDetail()}
                >
                  Try again
                </Button>
              </div>
            ) : null}

            {detail || (!isLoading && !error) ? (
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                {description}
              </p>
            ) : null}

            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/40 p-2 pl-3">
              <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <code className="block whitespace-nowrap font-mono text-[0.7rem] text-muted-foreground md:text-xs">
                  {command}
                </code>
              </div>
              <div className="shrink-0">
                <CopyButton
                  value={command}
                  ariaLabel={`Copy install command for ${name}`}
                  copiedAriaLabel={`Copied install command for ${name}`}
                  compact
                  iconOnly
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                aria-label={`Open ${name} on skills.sh`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                href={skillsShUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open on skills.sh
                <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
              </a>
              {isSaved ? (
                <span className="inline-flex h-8 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <CheckIcon className="size-3.5 text-primary" aria-hidden="true" />
                  In library
                  <span className="sr-only">: {name} is already saved</span>
                </span>
              ) : (
                <AddSkillDialog
                  defaultUrl={item.installUrl}
                  defaultName={item.slug}
                  triggerLabel="Save to library"
                  triggerAriaLabel={`Save ${name} to library`}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
