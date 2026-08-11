"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

import { FirstSkillInviteStep } from "@/components/first-skill-invite-step"
import { readInvitePromptState } from "@/lib/invite-prompt-state"

const FirstSkillInviteContext = createContext<((teamId: string) => void) | null>(null)

/**
 * Owns the invite step that follows a team's first saved skill.
 *
 * The save that earns the step also invalidates the library cache, and the
 * controls that start it sit in the parts of the page that refresh replaces:
 * the empty state gives way to the results grid, a catalog card turns into
 * "In library". Holding the step's state next to those controls threw it away
 * in the same commit that opened it, so the ask never appeared in the two
 * flows it exists for. The state lives in the app shell instead, which the
 * refresh reconciles in place.
 */
export function FirstSkillInviteProvider({ children }: { children: ReactNode }) {
  const [teamId, setTeamId] = useState<string | null>(null)

  const openFirstSkillInvite = useCallback((nextTeamId: string) => {
    // An owner who put this ask away for good does not get it again because
    // the library was emptied and restocked. "Not now" (collapsed) is a
    // different answer and still earns the step at the next first save.
    if (readInvitePromptState(nextTeamId) === "dismissed") return
    setTeamId(nextTeamId)
  }, [])

  return (
    <FirstSkillInviteContext.Provider value={openFirstSkillInvite}>
      {children}
      {teamId ? (
        <FirstSkillInviteStep
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setTeamId(null)
          }}
          teamId={teamId}
        />
      ) : null}
    </FirstSkillInviteContext.Provider>
  )
}

/**
 * Every surface that can save a skill today renders inside the app shell, so
 * the provider is always there. A surface mounted outside it simply gets no
 * follow-up step: a missing invite ask is worth less than a broken page.
 */
export function useFirstSkillInvite() {
  return useContext(FirstSkillInviteContext)
}
