// @ts-check

export const ANALYTICS_SCHEMA_VERSION = 2

/**
 * PostHog/runtime-owned properties that queries may read even though callers do
 * not provide them as event-specific capture properties.
 */
export const ANALYTICS_SYSTEM_PROPERTY_NAMES = Object.freeze([
  "$pathname",
  "analytics_schema_version",
  "deployment_environment",
  "team_id",
])

/**
 * Canonical contract for PostHog events emitted by Skills Board.
 *
 * Property descriptors are intentionally data-only so this manifest can be
 * consumed by both the Next.js TypeScript application and the Node 20 GTM
 * scorecard without a build step.
 */
export const ANALYTICS_EVENT_MANIFEST = /** @type {const} */ ({
  $pageview: {
    capture: "automatic",
    properties: {},
    teamScoped: false,
    trackingHealth: true,
  },
  landing_cta_clicked: {
    capture: "custom",
    properties: {
      destination: ["/library", "/sign-up"],
      location: ["header", "hero", "closing"],
      visitor_state: ["anonymous", "signed_in"],
    },
    teamScoped: false,
    trackingHealth: true,
  },
  signup_form_submitted: {
    capture: "custom",
    properties: {
      method: ["email_otp"],
      signup_context: ["new_team", "team_invitation"],
    },
    teamScoped: false,
    trackingHealth: true,
  },
  user_signed_up: {
    capture: "custom",
    properties: {
      method: ["email_otp"],
      signup_context: ["new_team", "team_invitation"],
    },
    teamScoped: false,
    trackingHealth: true,
  },
  user_signed_in: {
    capture: "custom",
    properties: {
      method: ["email_otp"],
    },
    teamScoped: false,
    trackingHealth: false,
  },
  user_signed_out: {
    capture: "custom",
    properties: {},
    teamScoped: false,
    trackingHealth: false,
  },
  team_created: {
    capture: "custom",
    properties: {
      creation_surface: ["in_app", "onboarding"],
    },
    teamScoped: true,
    trackingHealth: true,
  },
  skill_saved: {
    capture: "custom",
    properties: {
      has_note: "boolean",
      repo_name: "string",
      repo_owner: "string",
      skill_name: "string",
      tag_count: "number",
    },
    teamScoped: true,
    trackingHealth: true,
  },
  team_member_invited: {
    capture: "custom",
    properties: {
      email_sent: "boolean",
      role: ["admin", "member"],
    },
    teamScoped: true,
    trackingHealth: true,
  },
  invitation_accepted: {
    capture: "custom",
    properties: {},
    teamScoped: true,
    trackingHealth: true,
  },
  skill_usage_path_selected: {
    capture: "custom",
    properties: {
      actor_is_skill_creator: "boolean",
      method: ["command", "source"],
      skill_id: "string",
      skill_name: "string",
      surface: ["library", "mcp"],
    },
    teamScoped: true,
    trackingHealth: true,
  },
  skill_downloaded: {
    capture: "custom",
    properties: {
      actor_is_skill_creator: "boolean",
      method: ["zip"],
      skill_id: "string",
      skill_name: "string",
      surface: ["library"],
    },
    teamScoped: true,
    trackingHealth: true,
  },
  team_library_viewed: {
    capture: "custom",
    properties: {
      filter_state: ["none", "search", "search_and_tag", "tag"],
      has_skills: "boolean",
      skill_count: "number",
    },
    teamScoped: true,
    trackingHealth: true,
  },
  team_invite_prompt_viewed: {
    capture: "custom",
    properties: {
      surface: ["library_after_first_skill"],
    },
    teamScoped: true,
    trackingHealth: false,
  },
  team_invite_prompt_clicked: {
    capture: "custom",
    properties: {
      surface: ["library_after_first_skill"],
    },
    teamScoped: true,
    trackingHealth: false,
  },
  skill_note_updated: {
    capture: "custom",
    properties: {
      has_note: "boolean",
      skill_id: "string",
    },
    teamScoped: true,
    trackingHealth: false,
  },
  skill_deleted: {
    capture: "custom",
    properties: {
      skill_id: "string",
    },
    teamScoped: true,
    trackingHealth: false,
  },
  skill_refreshed: {
    capture: "custom",
    properties: {
      repo_name: "string",
      repo_owner: "string",
      skill_id: "string",
    },
    teamScoped: true,
    trackingHealth: false,
  },
})

export const TRACKING_HEALTH_EVENT_NAMES = Object.freeze(
  Object.entries(ANALYTICS_EVENT_MANIFEST)
    .filter(([, definition]) => definition.trackingHealth)
    .map(([eventName]) => eventName),
)
