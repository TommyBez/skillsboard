"use client"

import { DownloadIcon, ExternalLinkIcon, UsersIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { TrackedAnchor } from "@/components/tracked-anchor"
import { Button } from "@/components/ui/button"
import type { ClientAnalyticsEvent } from "@/lib/analytics-client"

interface TeammateReusePromptProps {
  addedBy?: string | null
  command: string
  href: string
  skillId: string
  skillName: string
  skillTitle: string
  teamId: string
}

export function TeammateReusePrompt({
  addedBy,
  command,
  href,
  skillId,
  skillName,
  skillTitle,
  teamId,
}: TeammateReusePromptProps) {
  const commandAnalytics: ClientAnalyticsEvent = {
    event: "skill_usage_path_selected",
    properties: {
      actor_is_skill_creator: false,
      method: "command",
      skill_id: skillId,
      skill_name: skillName,
      surface: "library",
      team_id: teamId,
    },
  }
  const sourceAnalytics: ClientAnalyticsEvent = {
    event: "skill_usage_path_selected",
    properties: {
      actor_is_skill_creator: false,
      method: "source",
      skill_id: skillId,
      skill_name: skillName,
      surface: "library",
      team_id: teamId,
    },
  }

  return (
    <section
      aria-labelledby="teammate-skill-heading"
      className="grid items-center gap-5 rounded-2xl border border-primary/25 bg-primary/[0.045] p-5 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.05)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:p-6"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
        <UsersIcon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">From your team</p>
        <h2 id="teammate-skill-heading" className="mt-1 text-xl font-semibold tracking-[-0.025em]">
          Put a teammate&apos;s skill to work.
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {addedBy ? `${addedBy} added ${skillTitle}.` : `A teammate added ${skillTitle}.`} Choose the source, command, or ZIP that fits your setup.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <CopyButton
          analytics={commandAnalytics}
          ariaLabel={`Copy install command for ${skillTitle}`}
          copiedAriaLabel={`Copied install command for ${skillTitle}`}
          className="h-10 rounded-xl px-4"
          label="Copy command"
          value={command}
        />
        <Button
          variant="outline"
          nativeButton={false}
          render={(
            <TrackedAnchor
              analytics={sourceAnalytics}
              href={href}
              target="_blank"
              rel="noreferrer"
            />
          )}
        >
          Open source
          <ExternalLinkIcon data-icon="inline-end" />
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href={`/api/skills/${skillId}/download`} />}
        >
          Download ZIP
          <DownloadIcon data-icon="inline-end" />
        </Button>
      </div>
    </section>
  )
}
