import type { StoredEmailCaptureSource } from "@/lib/email/email-capture"

type NonTeamEventPropertiesMap = {
  email_capture_submitted: {
    /**
     * The capture surface: the landing band, a guide, or an alternative page,
     * or `unknown` when a direct post carried a source we do not render. The
     * type comes from the capture rules rather than being spelled twice, so
     * the property and the stored column cannot drift apart.
     */
    source: StoredEmailCaptureSource
  }
  landing_cta_clicked: {
    destination: "/library" | "/sign-up"
    location:
      | "header"
      | "hero"
      | "closing"
      | "about_header"
      | "alternatives_header"
      | "alternatives_index"
      | "alternatives_github_repo_header"
      | "alternatives_github_repo_closing"
      | "alternatives_skills_sh_header"
      | "alternatives_skills_sh_closing"
      | "alternatives_smithery_header"
      | "alternatives_smithery_closing"
      | "guide_header"
      | "guide_inline"
      | "guide_closing"
      | "pricing_header"
      | "resources_header"
      | "resources_closing"
  }
  mcp_entry_clicked: {
    destination: "#mcp" | "/settings/mcp" | "/sign-up"
    location: "account_menu" | "app_navigation" | "landing_hero" | "landing_section" | "library_header"
  }
  mcp_client_selected: {
    client: "claude_code" | "claude_desktop" | "cursor" | "other" | "vscode"
  }
  mcp_authorization_approved: Record<never, never>
  mcp_authorization_denied: Record<never, never>
  mcp_tool_used: {
    succeeded: boolean
    tool_name:
      | "add_skill"
      | "add_skill_to_collection"
      | "create_collection"
      | "discover_repository_skills"
      | "discover_skills"
      | "get_collection_install_command"
      | "get_collection_skills"
      | "get_skill_command"
      | "list_collections"
      | "list_skills"
      | "remove_skill_from_collection"
      | "search_collections"
      | "search_skills"
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
    example_prompt_count: number
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
    surface: "collection" | "library" | "mcp"
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
  library_empty_state_cta_clicked: {
    cta: "add_skill" | "find_skills"
  }
  mcp_setup_viewed: Record<never, never>
  mcp_config_copied: {
    client: "claude_code" | "claude_desktop" | "cursor" | "generic" | "other" | "vscode"
  }
  team_invite_prompt_viewed: {
    actor_is_skill_creator: boolean
    surface: "first_skill_invite_step" | "library_after_first_skill"
    trigger: "first_skill_saved" | "library_revisit"
  }
  team_invite_prompt_clicked: {
    actor_is_skill_creator: boolean
    surface: "first_skill_invite_step" | "library_after_first_skill"
    trigger: "first_skill_saved" | "library_revisit"
  }
  team_invite_link_copied: {
    actor_is_skill_creator: boolean
    surface: "first_skill_invite_step" | "organization_settings"
  }
  skill_note_updated: {
    has_note: boolean
    skill_id: string
  }
  skill_example_prompts_updated: {
    example_prompt_count: number
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
  collection_created: {
    collection_id: string
    has_description: boolean
    surface: "mcp" | "web"
    tag_count: number
  }
  collection_updated: {
    collection_id: string
    has_description: boolean
    tag_count: number
  }
  collection_deleted: {
    collection_id: string
    skill_count: number
  }
  collection_skill_added: {
    collection_id: string
    skill_id: string
    surface: "collection_detail" | "library" | "mcp"
  }
  collection_skill_removed: {
    collection_id: string
    skill_id: string
    surface: "collection_detail" | "library" | "mcp"
  }
  collection_distribution_published: {
    collection_id: string
    is_update: boolean
    recovered_source_count: number
    revision: number
    skill_count: number
  }
  collection_distribution_disabled: {
    collection_id: string
  }
  collection_distribution_link_rotated: {
    collection_id: string
  }
  collection_install_command_copied: {
    collection_id: string
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
