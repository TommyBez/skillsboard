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

export const TEAMMATE_RECOMMENDATION_WINDOW_MS = 48 * 60 * 60 * 1000

interface TeammateRecommendationCandidate {
  createdAt: Date
  createdBy: string
}

export function findRecentTeammateRecommendation<
  Candidate extends TeammateRecommendationCandidate,
>(
  skills: readonly Candidate[],
  userId: string,
  now = new Date(),
) {
  const nowMs = now.getTime()
  const cutoffMs = nowMs - TEAMMATE_RECOMMENDATION_WINDOW_MS

  return skills.find((item) => {
    const createdAtMs = item.createdAt.getTime()

    return (
      item.createdBy !== userId
      && createdAtMs >= cutoffMs
      && createdAtMs <= nowMs
    )
  })
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
