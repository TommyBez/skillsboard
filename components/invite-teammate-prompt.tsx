"use client"

import Link from "next/link"
import { UserPlusIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { CollapsibleBanner, type BannerState } from "@/components/interior/collapsible-banner"
import { Button } from "@/components/ui/button"
import { captureAnalyticsEvent } from "@/lib/analytics-client"
import {
  readInvitePromptState,
  subscribeToInvitePromptState,
  writeInvitePromptState,
  type InvitePromptState,
} from "@/lib/invite-prompt-state"

interface InviteTeammatePromptProps {
  actorIsSkillCreator: boolean
  teamId: string
}

export function InviteTeammatePrompt({ actorIsSkillCreator, teamId }: InviteTeammatePromptProps) {
  /* The prompt used to be permanent: once you saved a skill it sat on the
     library forever with no way to put it away. Dismissal has to outlive the
     page load or the control is theatre, so the state is persisted per team.
     Starting collapsed-open and correcting after mount means a dismissed
     banner can flash once on a cold load; that is the cost of keeping the
     markup server-rendered, and it is cheaper than reserving nothing and
     shifting the page. */
  const [state, setState] = useState<InvitePromptState>("expanded")

  /* Resolve storage and report the view in one pass. Split across two effects,
     the view event fired against the initial "expanded" state before the
     stored value landed, so a dismissed prompt still counted as seen — and a
     team change briefly carried the previous team's state. */
  useEffect(() => {
    const next = readInvitePromptState(teamId)
    setState(next)
    if (next === "dismissed") return
    captureAnalyticsEvent("team_invite_prompt_viewed", {
      actor_is_skill_creator: actorIsSkillCreator,
      surface: "library_after_first_skill",
      team_id: teamId,
      trigger: "library_revisit",
    })
  }, [actorIsSkillCreator, teamId])

  /* The first-skill step can be on screen with this banner already mounted
     behind it, and closing that step folds the ask. Without this the banner
     stayed expanded until the next reload, contradicting the answer the user
     had just given. */
  useEffect(
    () => subscribeToInvitePromptState(() => setState(readInvitePromptState(teamId))),
    [teamId],
  )

  function persist(next: BannerState) {
    setState(next)
    writeInvitePromptState(teamId, next)
  }

  if (state === "dismissed") return null

  return (
    <CollapsibleBanner
      title="Make it a team library."
      description="You've saved a recommendation. Invite one teammate so they can find and use it from their own agent setup."
      state={state}
      onStateChange={persist}
      icon={
        <span
          className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary"
          aria-hidden="true"
        >
          <UserPlusIcon className="size-4" />
        </span>
      }
      action={
        <Button
          variant="outline"
          className="w-fit"
          nativeButton={false}
          render={(
            <Link
              href="/settings/organization#invite"
              onClick={() => {
                captureAnalyticsEvent("team_invite_prompt_clicked", {
                  actor_is_skill_creator: actorIsSkillCreator,
                  surface: "library_after_first_skill",
                  team_id: teamId,
                  trigger: "library_revisit",
                })
              }}
            />
          )}
        >
          Invite a teammate
        </Button>
      }
    />
  )
}
