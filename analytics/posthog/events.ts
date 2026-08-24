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
      | "connect_header"
      | "developers_header"
      | "agent_skills_header"
      | "agent_skills_hero"
      | "agent_skills_inline"
      | "agent_skills_closing"
      | "agent_skills_support_header"
      | "agent_skills_support_hero"
      | "agent_skills_support_inline"
      | "agent_skills_support_closing"
      | "agents_md_header"
      | "agents_md_hero"
      | "agents_md_inline"
      | "agents_md_closing"
      | "anthropic_skills_header"
      | "anthropic_skills_hero"
      | "anthropic_skills_inline"
      | "anthropic_skills_closing"
      | "best_claude_skills_header"
      | "best_claude_skills_hero"
      | "best_claude_skills_inline"
      | "best_claude_skills_closing"
      | "alternatives_header"
      | "alternatives_index"
      | "alternatives_github_repo_header"
      | "alternatives_github_repo_closing"
      | "alternatives_skills_sh_header"
      | "alternatives_skills_sh_closing"
      | "alternatives_smithery_header"
      | "alternatives_smithery_closing"
      | "alternatives_superpowers_header"
      | "alternatives_superpowers_closing"
      | "claude_skills_header"
      | "claude_skills_hero"
      | "claude_skills_inline"
      | "claude_skills_closing"
      | "codex_skills_header"
      | "codex_skills_hero"
      | "codex_skills_inline"
      | "codex_skills_closing"
      | "compare_header"
      | "compare_index"
      | "compare_skills_mcp_header"
      | "compare_skills_mcp_hero"
      | "compare_skills_mcp_inline"
      | "compare_skills_mcp_closing"
      | "compare_skills_plugins_header"
      | "compare_skills_plugins_hero"
      | "compare_skills_plugins_inline"
      | "compare_skills_plugins_closing"
      | "compare_skills_slash_commands_header"
      | "compare_skills_slash_commands_hero"
      | "compare_skills_slash_commands_inline"
      | "compare_skills_slash_commands_closing"
      | "compare_skills_subagents_header"
      | "compare_skills_subagents_hero"
      | "compare_skills_subagents_inline"
      | "compare_skills_subagents_closing"
      | "cowork_skills_header"
      | "cowork_skills_hero"
      | "cowork_skills_inline"
      | "cowork_skills_closing"
      | "manage_ai_skills_header"
      | "manage_ai_skills_hero"
      | "manage_ai_skills_inline"
      | "manage_ai_skills_closing"
      | "cursor_skills_header"
      | "cursor_skills_hero"
      | "cursor_skills_inline"
      | "cursor_skills_closing"
      | "guide_header"
      | "guide_inline"
      | "guide_closing"
      | "pricing_header"
      | "resources_header"
      | "resources_closing"
      | "opencode_skills_header"
      | "opencode_skills_hero"
      | "opencode_skills_inline"
      | "opencode_skills_closing"
      | "copilot_skills_header"
      | "copilot_skills_hero"
      | "copilot_skills_inline"
      | "copilot_skills_closing"
      | "skill_examples_header"
      | "skill_examples_hero"
      | "skill_examples_inline"
      | "skill_examples_closing"
      | "vercel_skills_header"
      | "vercel_skills_hero"
      | "vercel_skills_inline"
      | "vercel_skills_closing"
      | "where_skills_header"
      | "where_skills_hero"
      | "where_skills_inline"
      | "where_skills_closing"
  }
  /**
   * `/settings/mcp` stays in the destination union: the setup page now lives at
   * `/connect`, and the old value is what every event captured before the move
   * carries, so dropping it would rewrite history rather than record it.
   */
  mcp_entry_clicked: {
    destination: "#mcp" | "/connect" | "/settings/mcp" | "/sign-up"
    location:
      | "account_menu"
      | "app_navigation"
      | "landing_hero"
      | "landing_section"
      | "library_header"
      | "onboarding"
  }
  /**
   * Copying the plugin install commands. Non team scoped on purpose: the same
   * block runs on the landing page, where there is no team yet, and `location`
   * keeps the two surfaces apart.
   */
  plugin_install_copied: {
    location: "landing" | "mcp_settings" | "onboarding"
  }
  /**
   * A real copy action, not a route view. `$pageview` on `/connect` and
   * `/start` owns the denominator; `client` separates their copy surfaces.
   * Browser team context is injected centrally from an event-time scope
   * snapshot, without making leaf components fetch or receive the team.
   */
  mcp_config_copied: {
    client: "claude_code" | "claude_desktop" | "cursor" | "generic" | "other" | "vscode"
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
  /**
   * `surface` is threaded from the form that sent the invitation, through the
   * server action, so an invitation sent from the first run can be counted on
   * its own. Same values as `team_invite_link_copied`, so the emailed
   * invitation and the copied link read against each other per surface.
   */
  team_member_invited: {
    email_sent: boolean
    role: "admin" | "member"
    surface: "first_skill_invite_step" | "onboarding" | "organization_settings"
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
  /**
   * Only the two steps that have no event of their own. Connecting an agent is
   * already measured by `mcp_entry_clicked`, `plugin_install_copied`, and
   * `mcp_config_copied`, and counting it twice would inflate that step.
   */
  onboarding_step_clicked: {
    step: "first_skill" | "invite_team"
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
    surface: "first_skill_invite_step" | "onboarding" | "organization_settings"
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

/**
 * The keys a caller has to fill in. An event whose properties are all optional,
 * like the MCP setup funnel where the team is known on one surface and unknown
 * on the other, is called the same way as an event with no properties at all.
 */
export type RequiredAnalyticsPropertyKeys<Properties> = {
  [Key in keyof Properties]-?: object extends Pick<Properties, Key> ? never : Key
}[keyof Properties]

export type AnalyticsCapturedEventPropertiesArgs<EventName extends AnalyticsEventName> =
  RequiredAnalyticsPropertyKeys<AnalyticsCapturedEventProperties<EventName>> extends never
    ? keyof AnalyticsCapturedEventProperties<EventName> extends never
      ? []
      : [properties?: AnalyticsCapturedEventProperties<EventName>]
    : [properties: AnalyticsCapturedEventProperties<EventName>]

type AnalyticsEventPropertiesField<EventName extends AnalyticsEventName> =
  RequiredAnalyticsPropertyKeys<AnalyticsEventProperties<EventName>> extends never
    ? keyof AnalyticsEventProperties<EventName> extends never
      ? { properties?: never }
      : { properties?: AnalyticsEventProperties<EventName> }
    : { properties: AnalyticsEventProperties<EventName> }

type AnalyticsCapturedEventPropertiesField<EventName extends AnalyticsEventName> =
  RequiredAnalyticsPropertyKeys<AnalyticsCapturedEventProperties<EventName>> extends never
    ? keyof AnalyticsCapturedEventProperties<EventName> extends never
      ? { properties?: never }
      : { properties?: AnalyticsCapturedEventProperties<EventName> }
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
