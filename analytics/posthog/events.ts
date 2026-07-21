type NonTeamEventPropertiesMap = {
  landing_cta_clicked: {
    destination: "/library" | "/sign-up"
    location: "header" | "hero" | "closing"
    visitor_state: "anonymous" | "signed_in"
  }
  mcp_entry_clicked: {
    destination: "#mcp" | "/settings/mcp" | "/sign-up"
    location: "account_menu" | "app_navigation" | "landing_hero" | "landing_section" | "library_header"
    visitor_state: "anonymous" | "signed_in"
  }
  mcp_setup_viewed: Record<never, never>
  mcp_client_selected: {
    client: "claude_code" | "claude_desktop" | "cursor" | "other" | "vscode"
  }
  mcp_config_copied: {
    client: "claude_code" | "claude_desktop" | "cursor" | "generic" | "other" | "vscode"
  }
  mcp_authorization_approved: Record<never, never>
  mcp_authorization_denied: Record<never, never>
  mcp_tool_used: {
    succeeded: boolean
    tool_name: "add_skill" | "discover_repository_skills" | "discover_skills" | "get_skill_command" | "list_skills" | "search_skills"
  }
  signup_form_submitted: {
    method: "email_otp"
    signup_context: "new_team" | "team_invitation"
  }
  user_signed_up: {
    method: "email_otp"
    signup_context: "new_team" | "team_invitation"
  }
  user_signed_in: {
    method: "email_otp"
  }
  user_signed_out: Record<never, never>
}

type TeamEventPropertiesMap = {
  team_created: {
    creation_surface: "in_app" | "onboarding"
  }
  skill_saved: {
    has_note: boolean
    repo_name: string
    repo_owner: string
    skill_name: string
    surface: "mcp" | "web"
    tag_count: number
  }
  team_member_invited: {
    email_sent: boolean
    role: "admin" | "member"
  }
  invitation_accepted: Record<never, never>
  skill_usage_path_selected: {
    actor_is_skill_creator: boolean
    method: "command" | "source"
    skill_id: string
    skill_name: string
    surface: "library" | "mcp"
  }
  skill_downloaded: {
    actor_is_skill_creator: boolean
    method: "zip"
    skill_id: string
    skill_name: string
    surface: "library"
  }
  team_library_viewed: {
    filter_state: "none" | "search" | "search_and_tag" | "tag"
    has_skills: boolean
    skill_count: number
  }
  team_invite_prompt_viewed: {
    surface: "library_after_first_skill"
  }
  team_invite_prompt_clicked: {
    surface: "library_after_first_skill"
  }
  skill_note_updated: {
    has_note: boolean
    skill_id: string
  }
  skill_deleted: {
    skill_id: string
  }
  skill_refreshed: {
    repo_name: string
    repo_owner: string
    skill_id: string
  }
}

type AnalyticsEventPropertiesMap = NonTeamEventPropertiesMap & TeamEventPropertiesMap

export type AnalyticsEventName = keyof AnalyticsEventPropertiesMap
export type CapturableAnalyticsEventName = AnalyticsEventName

export type TeamScopedAnalyticsEventName = keyof TeamEventPropertiesMap
export type NonTeamScopedAnalyticsEventName = keyof NonTeamEventPropertiesMap

export type TeamScopedCapturableAnalyticsEventName = TeamScopedAnalyticsEventName
export type NonTeamScopedCapturableAnalyticsEventName = NonTeamScopedAnalyticsEventName

export type AnalyticsEventProperties<EventName extends AnalyticsEventName> =
  AnalyticsEventPropertiesMap[EventName]

export type AnalyticsCapturedEventProperties<EventName extends AnalyticsEventName> =
  AnalyticsEventProperties<EventName> &
    (EventName extends TeamScopedAnalyticsEventName ? { team_id: string } : object)

export type AnalyticsCapturedEventPropertiesArgs<EventName extends AnalyticsEventName> =
  keyof AnalyticsCapturedEventProperties<EventName> extends never
    ? []
    : [properties: AnalyticsCapturedEventProperties<EventName>]

type AnalyticsEventPropertiesField<EventName extends AnalyticsEventName> =
  keyof AnalyticsEventProperties<EventName> extends never
    ? { properties?: never }
    : { properties: AnalyticsEventProperties<EventName> }

type AnalyticsCapturedEventPropertiesField<EventName extends AnalyticsEventName> =
  keyof AnalyticsCapturedEventProperties<EventName> extends never
    ? { properties?: never }
    : { properties: AnalyticsCapturedEventProperties<EventName> }

export type AnalyticsEventCapture<
  EventName extends AnalyticsEventName = AnalyticsEventName,
> = EventName extends AnalyticsEventName
  ? { event: EventName } & AnalyticsEventPropertiesField<EventName>
  : never

export type AnalyticsCapturedEventCapture<
  EventName extends AnalyticsEventName = AnalyticsEventName,
> = EventName extends AnalyticsEventName
  ? { event: EventName } & AnalyticsCapturedEventPropertiesField<EventName>
  : never
