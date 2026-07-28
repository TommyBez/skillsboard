import Link from "next/link"
import { FolderOpenIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CollectionCardProps {
  id: string
  title: string
  description?: string | null
  tags: string[]
  skillCount: number
  createdByName?: string | null
  className?: string
}

export function CollectionCard({
  id,
  title,
  description,
  tags,
  skillCount,
  createdByName,
  className,
}: CollectionCardProps) {
  const createdByInitials = createdByName
    ? createdByName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null

  return (
    <article
      className={cn(
        "lift-on-hover focus-frame relative flex h-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <FolderOpenIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>Collection</span>
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {skillCount} {skillCount === 1 ? "skill" : "skills"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">
          <Link href={`/collections/${id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {title}
          </Link>
        </h2>
        {description ? (
          <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
        </div>
      ) : null}

      {createdByName ? (
        <div className="mt-auto flex min-w-0 items-center gap-2 pt-1 text-sm text-muted-foreground">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent font-mono text-[0.65rem] font-semibold text-accent-foreground"
            aria-hidden="true"
          >
            {createdByInitials}
          </span>
          <p className="truncate">
            Created by <span className="font-medium text-foreground">{createdByName}</span>
          </p>
        </div>
      ) : null}
    </article>
  )
}
