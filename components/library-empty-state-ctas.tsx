"use client"

import Link from "next/link"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { Button } from "@/components/ui/button"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

interface LibraryEmptyStateCtasProps {
  teamId: string
}

/**
 * CTAs for the true-empty library state ("Add your first skill").
 *
 * This is the exact point where both observed production users dropped off,
 * so each click is captured as `library_empty_state_cta_clicked`. The view
 * itself is already derivable from `team_library_viewed` with
 * `has_skills=false` and `filter_state="none"` — no separate viewed event.
 */
export function LibraryEmptyStateCtas({ teamId }: LibraryEmptyStateCtasProps) {
  return (
    <>
      <AddSkillDialog
        triggerLabel="Add a skill"
        onTriggerClick={() => {
          captureAnalyticsEvent("library_empty_state_cta_clicked", {
            cta: "add_skill",
            team_id: teamId,
          })
        }}
      />
      <Button
        variant="outline"
        nativeButton={false}
        render={(
          <Link
            href="/discover"
            onClick={() => {
              captureAnalyticsEvent("library_empty_state_cta_clicked", {
                cta: "find_skills",
                team_id: teamId,
              })
            }}
          />
        )}
      >
        Find skills
      </Button>
    </>
  )
}
