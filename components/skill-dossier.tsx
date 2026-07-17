import type { ReactNode } from "react"
import { ArrowUpRightIcon, GitForkIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { TrackedAnchor } from "@/components/tracked-anchor"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.947 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.844-2.337 4.691-4.566 4.94.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.757 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  )
}

interface SkillDossierProps {
  name: string
  description?: string | null
  note?: string | null
  source: string
  command: string
  metric?: string
  tags?: string[]
  status?: string
  addedBy?: string | null
  href?: string
  hrefLabel?: string
  details?: ReactNode
  compact?: boolean
  actions?: ReactNode
  className?: string
  headingLevel?: "h2" | "h3"
  tracking?: {
    actorIsSkillCreator: boolean
    skillId: string
    skillName: string
    teamId: string
  }
}

export function SkillDossier({
  name,
  description,
  note,
  source,
  command,
  metric,
  tags = [],
  status,
  addedBy,
  href,
  hrefLabel = "View source",
  details,
  compact = false,
  actions,
  className,
  headingLevel = "h3",
  tracking,
}: SkillDossierProps) {
  const Heading = headingLevel
  const addedByInitials = addedBy
    ? addedBy
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null

  return (
    <article
      className={cn(
        "lift-on-hover focus-frame flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      <div className={cn("flex flex-1 flex-col", compact ? "gap-4 p-4" : "gap-5 p-5 md:p-6")}>
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
            <GitForkIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{source}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {status ? <Badge>{status}</Badge> : null}
            {metric ? <span className="font-mono text-xs tabular-nums text-muted-foreground">{metric}</span> : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Heading className={cn("font-semibold tracking-[-0.035em]", compact ? "text-lg" : "text-2xl")}>
            {name}
          </Heading>
          {description ? (
            <p className={cn("text-pretty leading-relaxed text-muted-foreground", compact ? "line-clamp-2 text-sm" : "line-clamp-3 text-sm md:text-base")}>
              {description}
            </p>
          ) : null}
          {note ? (
            <p className={cn("border-l-2 border-primary/50 pl-3 text-pretty leading-relaxed text-foreground/90", compact ? "line-clamp-2 text-sm" : "line-clamp-4 text-sm md:text-base")}>
              {note}
            </p>
          ) : null}
        </div>

        {tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
          </div>
        ) : null}

        {addedBy ? (
          <div className="mt-auto flex min-w-0 items-center gap-2 pt-1 text-sm text-muted-foreground">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent font-mono text-[0.65rem] font-semibold text-accent-foreground"
              aria-hidden="true"
            >
              {addedByInitials}
            </span>
            <p className="truncate">
              Added by <span className="font-medium text-foreground">{addedBy}</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border bg-muted/40 p-3 md:p-4">
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-background/75 p-2 pl-3">
          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <code className="block whitespace-nowrap font-mono text-[0.7rem] text-muted-foreground md:text-xs">{command}</code>
          </div>
          <div className="shrink-0">
            <CopyButton
              value={command}
              ariaLabel={`Copy install command for ${name}`}
              copiedAriaLabel={`Copied install command for ${name}`}
              analyticsEvent={tracking ? "skill_usage_path_selected" : undefined}
              analyticsProperties={tracking ? {
                actor_is_skill_creator: tracking.actorIsSkillCreator,
                method: "command",
                skill_id: tracking.skillId,
                skill_name: tracking.skillName,
                surface: "library",
                team_id: tracking.teamId,
              } : undefined}
              compact
              iconOnly
            />
          </div>
        </div>
        {details || href || actions ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {details ? details : href ? (
              tracking ? (
                <TrackedAnchor
                  aria-label={`${hrefLabel} for ${name}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  eventName="skill_usage_path_selected"
                  eventProperties={{
                    actor_is_skill_creator: tracking.actorIsSkillCreator,
                    method: "source",
                    skill_id: tracking.skillId,
                    skill_name: tracking.skillName,
                    surface: "library",
                    team_id: tracking.teamId,
                  }}
                >
                  {href.includes("github.com") ? <GitHubMark className="size-4" /> : hrefLabel}
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                </TrackedAnchor>
              ) : (
                <a aria-label={`${hrefLabel} for ${name}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary" href={href} target="_blank" rel="noreferrer">
                  {href.includes("github.com") ? <GitHubMark className="size-4" /> : hrefLabel}
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                </a>
              )
            ) : <span />}
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  )
}
