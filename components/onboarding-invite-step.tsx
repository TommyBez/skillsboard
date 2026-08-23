"use client"

import { InviteMemberForm } from "@/components/invite-member-form"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

/**
 * The invite ask, standing beside connecting an agent instead of waiting for a
 * first skill to be saved. The team is one person old here, so the actor is
 * never someone reacting to a teammate's skill, hence the fixed false.
 */
export function OnboardingInviteStep({ teamId }: { teamId: string }) {
  return (
    <InviteMemberForm
      className=""
      idPrefix="onboarding-invite"
      layout="stack"
      linkCopyAnalytics={{
        event: "team_invite_link_copied",
        properties: {
          actor_is_skill_creator: false,
          surface: "onboarding",
          team_id: teamId,
        },
      }}
      onSubmitIntent={() => {
        captureAnalyticsEvent("onboarding_step_clicked", {
          step: "invite_team",
          team_id: teamId,
        })
      }}
      surface="onboarding"
    />
  )
}
