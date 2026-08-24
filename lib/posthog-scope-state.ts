export interface PostHogScopeClient {
  get_property: (key: string) => unknown
  identify: (userId: string) => void
  register: (properties: Record<string, unknown>) => void
  reset: () => void
  setPersonProperties: (properties: Record<string, unknown>) => void
  unregister: (property: string) => void
}

export interface DesiredPostHogScope {
  teamId: string | null
  userId: string | null
}

/**
 * Applies browser identity and event-time team context in a stable order.
 *
 * `$user_id` is set by PostHog after `identify`. An anonymous distinct ID is
 * intentionally not compared with the application user ID: resetting it
 * before the first identify would break anonymous-to-known attribution.
 */
export function applyPostHogScope(
  posthog: PostHogScopeClient,
  { teamId, userId }: DesiredPostHogScope,
) {
  if (userId) {
    const identifiedUser = posthog.get_property("$user_id")
    if (
      typeof identifiedUser === "string" &&
      identifiedUser.length > 0 &&
      identifiedUser !== userId
    ) {
      posthog.reset()
    }

    if (posthog.get_property("$user_id") !== userId) {
      posthog.identify(userId)
    }
  }

  const registeredTeam = posthog.get_property("team_id")
  if (teamId) {
    if (registeredTeam !== teamId) {
      // `team_id` is a super property, so it is attached to pageviews,
      // autocapture, exceptions, and every custom browser event that follows.
      posthog.register({ team_id: teamId })
      // Useful for person-level inspection only. Historical attribution uses
      // the immutable event property above, not this mutable person property.
      posthog.setPersonProperties({ active_team_id: teamId })
    }
  } else if (registeredTeam !== undefined && registeredTeam !== null) {
    // Public/account routes may keep the identified person, but must never
    // inherit the team from the protected route that preceded them.
    posthog.unregister("team_id")
  }
}
