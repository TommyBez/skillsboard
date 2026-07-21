"use client"

import { ChevronRightIcon, MessageSquareQuoteIcon } from "lucide-react"

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

interface SkillPromptListProps {
  prompts: string[]
  skillName: string
}

export function SkillPromptList({ prompts, skillName }: SkillPromptListProps) {
  if (!prompts.length) return null

  const firstPrompt = prompts[0]

  return (
    <section
      aria-label={`Example prompts for ${skillName}`}
      className="mt-1 rounded-2xl bg-primary/[0.045] p-3.5 shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary)_15%,transparent)]"
    >
      <div className="flex min-h-10 items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          <MessageSquareQuoteIcon className="size-4 shrink-0" aria-hidden="true" />
          Example prompts
        </p>

        {prompts.length > 1 ? (
          <Dialog>
            <DialogTrigger
              render={(
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 shrink-0 px-3 text-primary hover:text-primary"
                  aria-label={`View all ${prompts.length} example prompts for ${skillName}`}
                />
              )}
            >
              View all {prompts.length}
              <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden p-0 sm:max-w-2xl">
              <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
                <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <MessageSquareQuoteIcon className="size-5" aria-hidden="true" />
                </span>
                <DialogTitle className="text-balance text-2xl font-semibold tracking-[-0.035em]">
                  Example prompts for {skillName}
                </DialogTitle>
                <DialogDescription className="max-w-lg text-pretty leading-relaxed">
                  Ready-to-copy starting points shared by your team.
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-y-auto p-4 sm:p-6">
                <ul className="grid gap-3">
                  {prompts.map((prompt) => (
                    <li
                      key={prompt}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl bg-muted/40 p-4 shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                    >
                      <p className="min-w-0 whitespace-pre-wrap text-pretty text-sm leading-relaxed text-foreground/90">
                        {prompt}
                      </p>
                      <CopyButton
                        value={prompt}
                        label="Copy"
                        ariaLabel={`Copy example prompt for ${skillName}`}
                        copiedAriaLabel={`Copied example prompt for ${skillName}`}
                        className="h-10 self-start"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-t border-primary/10 pt-3">
        <p className="min-w-0 whitespace-pre-wrap text-pretty text-sm leading-relaxed text-foreground/90">
          {firstPrompt}
        </p>
        <CopyButton
          value={firstPrompt}
          label="Copy"
          ariaLabel={`Copy example prompt for ${skillName}`}
          copiedAriaLabel={`Copied example prompt for ${skillName}`}
          className="h-10 self-start"
        />
      </div>
    </section>
  )
}
