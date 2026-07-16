import type { ReactNode } from "react"
import { ArrowUpRightIcon, BracesIcon, GitForkIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SkillDossierProps {
  name: string
  description?: string | null
  note?: string | null
  source: string
  command: string
  metric?: string
  tags?: string[]
  status?: string
  href?: string
  hrefLabel?: string
  featured?: boolean
  compact?: boolean
  actions?: ReactNode
  className?: string
  headingLevel?: "h2" | "h3"
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
  href,
  hrefLabel = "View source",
  featured = false,
  compact = false,
  actions,
  className,
  headingLevel = "h3",
}: SkillDossierProps) {
  const Heading = headingLevel

  return (
    <article
      className={cn(
        "lift-on-hover focus-frame flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-border bg-card",
        featured && "surface-shadow md:min-h-80",
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
          <Heading className={cn("font-semibold tracking-[-0.035em]", featured ? "text-3xl md:text-4xl" : compact ? "text-lg" : "text-2xl")}>
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
      </div>

      <div className="border-t border-border bg-muted/40 p-3 md:p-4">
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-background/75 p-2 pl-3">
          <BracesIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <code className="min-w-0 flex-1 truncate font-mono text-[0.7rem] text-muted-foreground md:text-xs">{command}</code>
          <CopyButton
            value={command}
            label="Copy command"
            ariaLabel={`Copy install command for ${name}`}
            copiedAriaLabel={`Copied install command for ${name}`}
            compact
          />
        </div>
        {href || actions ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {href ? (
              <a aria-label={`${hrefLabel} for ${name}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary" href={href} target="_blank" rel="noreferrer">
                {hrefLabel}<ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
              </a>
            ) : <span />}
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  )
}
