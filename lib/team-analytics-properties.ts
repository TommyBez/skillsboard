export function withTeamAnalyticsScope(
  properties: Record<string, unknown> | undefined,
  teamId: string,
): Record<string, unknown> & { team_id: string } {
  return {
    ...properties,
    team_id: teamId,
  }
}
