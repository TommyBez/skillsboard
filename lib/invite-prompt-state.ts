/**
 * One dismissal record for the "invite a teammate" ask, shared by the step
 * that opens right after a team's first skill is saved and by the library
 * banner that keeps the ask available afterwards. Both surfaces make the same
 * request, so dismissing one has to quiet the other; otherwise the second one
 * reads as nagging.
 *
 * The record lives in localStorage under the key the library banner has used
 * since it shipped, so already dismissed teams stay dismissed. It is mirrored
 * in memory and every write is broadcast, because the two surfaces can be on
 * screen at the same time: the library refresh mounts the banner behind the
 * step. Persisting alone left that banner expanded until the next reload.
 */

export type InvitePromptState = "collapsed" | "dismissed" | "expanded"

export const INVITE_PROMPT_STORAGE_PREFIX = "sb.invite-prompt."

export function invitePromptStorageKey(teamId: string) {
  return `${INVITE_PROMPT_STORAGE_PREFIX}${teamId}`
}

export function parseInvitePromptState(value: string | null): InvitePromptState {
  return value === "collapsed" || value === "dismissed" ? value : "expanded"
}

/**
 * Closing the first-skill step without inviting anyone folds the library
 * banner to its title instead of removing it: the user said "not now", not
 * "never". Creating an invitation is handled server side, where a pending
 * invitation already makes the banner ineligible.
 */
export function resolveInvitePromptStateAfterStep(
  current: InvitePromptState,
): InvitePromptState {
  return current === "dismissed" ? "dismissed" : "collapsed"
}

/* The session's view of the record, per team. It also carries the choice when
   storage is blocked, so a dismissal still holds for the rest of the visit. */
const rememberedStates = new Map<string, InvitePromptState>()
const listeners = new Set<() => void>()

/** Notified on every write so a surface that is already mounted can catch up. */
export function subscribeToInvitePromptState(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function readInvitePromptState(teamId: string): InvitePromptState {
  const remembered = rememberedStates.get(teamId)
  if (remembered) return remembered

  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(invitePromptStorageKey(teamId))
  } catch {
    // Private mode or blocked storage: treat the prompt as never dismissed.
  }

  const state = parseInvitePromptState(stored)
  rememberedStates.set(teamId, state)
  return state
}

export function writeInvitePromptState(teamId: string, state: InvitePromptState) {
  rememberedStates.set(teamId, state)

  try {
    window.localStorage.setItem(invitePromptStorageKey(teamId), state)
  } catch {
    // Non-fatal: the choice just will not survive this session.
  }

  for (const listener of [...listeners]) listener()
}
