"use client"

import Link from "next/link"
import { UserPlusIcon } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

export function InviteTeammatePrompt({ teamId }: { teamId: string }) {
  useEffect(() => {
    captureAnalyticsEvent("team_invite_prompt_viewed", {
      surface: "library_after_first_skill",
      team_id: teamId,
    })
  }, [teamId])

  return (
    <section className="grid items-center gap-5 border-y border-border py-6 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary" aria-hidden="true">
        <UserPlusIcon className="size-5" />
      </span>
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Next step</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">Make it a team library.</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          You&apos;ve saved a recommendation. Invite one teammate so they can find and use it from their own agent setup.
        </p>
      </div>
      <Button
        variant="outline"
        nativeButton={false}
        render={(
          <Link
            href="/settings/organization#invite"
            onClick={() => {
              captureAnalyticsEvent("team_invite_prompt_clicked", {
                surface: "library_after_first_skill",
                team_id: teamId,
              })
            }}
          />
        )}
      >
        Invite a teammate
      </Button>
    </section>
  )
}
