"use client"

import { useEffect } from "react"
import { UserPlusIcon } from "lucide-react"

import { InviteMemberForm } from "@/components/invite-member-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { captureAnalyticsEvent } from "@/lib/analytics-client"
import {
  readInvitePromptState,
  resolveInvitePromptStateAfterStep,
  writeInvitePromptState,
} from "@/lib/invite-prompt-state"

interface FirstSkillInviteStepProps {
  onOpenChange: (open: boolean) => void
  open: boolean
  teamId: string
}

/**
 * The invite ask at the only moment it is obviously true: the team library
 * just went from empty to holding something worth sharing.
 *
 * The server decides eligibility (first skill in this team, solo team, no
 * pending invitation, actor can invite) and the save action returns the team
 * id, so this step never appears for someone joining a library that already
 * has skills. Everything here is the existing invitation path: an email
 * invitation plus the per invitation link the form already returns, which is
 * the link a user can paste in Slack.
 */
export function FirstSkillInviteStep({ onOpenChange, open, teamId }: FirstSkillInviteStepProps) {
  useEffect(() => {
    if (!open) return
    captureAnalyticsEvent("team_invite_prompt_viewed", {
      // Reaching this step means the actor just saved the team's first skill.
      actor_is_skill_creator: true,
      surface: "first_skill_invite_step",
      trigger: "first_skill_saved",
    })
  }, [open, teamId])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      // "Not now" is not "never": the library banner stays, folded.
      writeInvitePromptState(teamId, resolveInvitePromptStateAfterStep(readInvitePromptState(teamId)))
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8">
          <span
            className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <UserPlusIcon className="size-5" />
          </span>
          <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">
            Make it a team library.
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Your first skill is saved. Invite one teammate so they can find and use it from their
            own agent setup. Send the email, then copy the invite link to paste in Slack or a chat.
          </DialogDescription>
        </DialogHeader>

        <InviteMemberForm
          className=""
          idPrefix="first-skill-invite"
          layout="stack"
          linkCopyAnalytics={{
            event: "team_invite_link_copied",
            properties: {
              actor_is_skill_creator: true,
              surface: "first_skill_invite_step",
            },
          }}
          onSubmitIntent={() => {
            captureAnalyticsEvent("team_invite_prompt_clicked", {
              actor_is_skill_creator: true,
              surface: "first_skill_invite_step",
              trigger: "first_skill_saved",
            })
          }}
          surface="first_skill_invite_step"
        />

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Not now</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
