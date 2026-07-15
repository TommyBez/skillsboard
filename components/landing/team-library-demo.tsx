"use client"

import { useState } from "react"
import { ExternalLinkIcon, SearchIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const exampleSkills = [
  {
    name: "design-taste-frontend",
    source: "Leonxlnx/taste-skill",
    href: "https://github.com/Leonxlnx/taste-skill",
    description: "A strict design review system for production frontend work.",
    tags: ["frontend", "design"],
    command:
      "npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend",
  },
  {
    name: "find-skills",
    source: "vercel-labs/skills",
    href: "https://github.com/vercel-labs/skills",
    description: "Find the right reusable skill before solving a task from scratch.",
    tags: ["workflow", "research"],
    command:
      "npx skills add https://github.com/vercel-labs/skills --skill find-skills",
  },
  {
    name: "agent-browser",
    source: "vercel-labs/agent-browser",
    href: "https://github.com/vercel-labs/agent-browser",
    description: "Automate and verify real browser flows from the command line.",
    tags: ["workflow", "browser"],
    command:
      "npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser",
  },
]

const filters = ["all", "frontend", "workflow"] as const

export function TeamLibraryDemo() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof filters)[number]>("all")

  const normalizedQuery = query.trim().toLowerCase()
  const visibleSkills = exampleSkills.filter((skill) => {
    const matchesFilter = filter === "all" || skill.tags.includes(filter)
    const matchesQuery =
      !normalizedQuery ||
      `${skill.name} ${skill.source} ${skill.description} ${skill.tags.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery)

    return matchesFilter && matchesQuery
  })

  return (
    <section
      aria-label="Interactive example team library"
      className="surface-shadow overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Example team library</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Search, filter, and copy a real command.
            </p>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {visibleSkills.length} saved
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="grid gap-2">
            <label htmlFor="example-library-search" className="text-xs font-medium text-muted-foreground">
              Search example library
            </label>
            <div className="relative">
              <SearchIcon
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="example-library-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try design or browser"
                className="bg-background pl-10"
              />
            </div>
          </div>

          <div className="flex gap-1.5" role="group" aria-label="Filter example skills">
            {filters.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={filter === item ? "default" : "outline"}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className="capitalize"
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {visibleSkills.length ? (
        <ul>
          {visibleSkills.map((skill) => (
            <li
              key={skill.name}
              className="grid gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <a
                    href={skill.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-w-0 items-center gap-1.5 font-semibold tracking-[-0.02em] hover:text-primary"
                  >
                    <span className="truncate">{skill.name}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                  <span className="truncate font-mono text-[0.7rem] text-muted-foreground">
                    {skill.source}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {skill.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-1 font-mono text-[0.65rem] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-xl bg-muted/70 p-1.5 pl-3 lg:w-[15rem]">
                <code className="min-w-0 flex-1 truncate font-mono text-[0.68rem] text-muted-foreground">
                  {skill.command}
                </code>
                <CopyButton
                  value={skill.command}
                  compact
                  ariaLabel={`Copy install command for ${skill.name}`}
                  copiedAriaLabel={`Install command copied for ${skill.name}`}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-44 flex-col items-start justify-center gap-3 px-5 py-8">
          <p className="font-semibold">No example skills match.</p>
          <p className="text-sm text-muted-foreground">Clear the search or show every saved skill.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setQuery("")
              setFilter("all")
            }}
          >
            Reset example
          </Button>
        </div>
      )}
    </section>
  )
}
