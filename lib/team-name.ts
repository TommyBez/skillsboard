export const TEAM_NAME_MIN_LENGTH = 2
export const TEAM_NAME_MAX_LENGTH = 80

/**
 * One source of truth for the team name rule, so the browser can show the same
 * message the server would return instead of leaving a blocked submit silent.
 * Returns an empty string when the value is acceptable.
 */
export function describeTeamNameError(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (trimmed.length < TEAM_NAME_MIN_LENGTH) {
    return `Team name must be at least ${TEAM_NAME_MIN_LENGTH} characters.`
  }
  if (trimmed.length > TEAM_NAME_MAX_LENGTH) {
    return `Team name must be ${TEAM_NAME_MAX_LENGTH} characters or less.`
  }
  return ""
}

export function readTeamName(formData: FormData): string {
  const value = formData.get("name")
  return typeof value === "string" ? value.trim() : ""
}
