export type LibraryFilterState = "none" | "search" | "tag" | "search_and_tag"

export function getLibraryFilterState(
  query: string,
  tag?: string,
): LibraryFilterState {
  if (query && tag) return "search_and_tag"
  if (query) return "search"
  if (tag) return "tag"
  return "none"
}

export function getLibraryNavigationKey(query: string, tag?: string) {
  return `${query}\u0000${tag ?? ""}`
}

interface InvitePromptEligibility {
  canManageLibrary: boolean
  memberCount: number
  pendingInvitationCount: number
  skillCount: number
}

export function isInvitePromptEligible({
  canManageLibrary,
  memberCount,
  pendingInvitationCount,
  skillCount,
}: InvitePromptEligibility) {
  return (
    canManageLibrary
    && skillCount > 0
    && memberCount === 1
    && pendingInvitationCount === 0
  )
}
