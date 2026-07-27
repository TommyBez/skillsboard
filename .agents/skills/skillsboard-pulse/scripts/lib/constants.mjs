export const GRAPH_SCHEMA_VERSION = 3;
export const PULSE_POLICY_REFERENCE_PATTERN =
  /^\.agents\/skills\/skillsboard-pulse\/references\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export const ID_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
export const REPOSITORY_SKILL_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SHA256_PATTERN = /^[a-f0-9]{64}$/;
export const JSON_POINTER_PATTERN = /^(?:\/(?:[^~/]|~[01])*)+$/;

export const EFFECTS = new Set([
  "read",
  "local_state",
  "repository_write",
  "external_write",
  "public_effect",
  "spend",
  "human_only",
]);
export const AUTONOMY_STATES = new Set(["autonomous", "manual_only", "disabled"]);
export const SKILL_SOURCES = new Set(["repository", "runtime"]);
export const NODE_KINDS = new Set(["kernel", "mandatory", "policy"]);

export const EXECUTOR_RESULT_REQUIRED_KEYS = Object.freeze([
  "ambiguity",
  "attempt_id",
  "attempted",
  "capacity_consumed",
  "containment",
  "definition_hash",
  "definition_match",
  "effect",
  "evidence_refs",
  "live_id",
  "outcome",
  "readback",
  "reason_code",
  "reason_detail",
  "resource_key",
  "route_id",
  "schema_version",
]);
export const EXECUTOR_RESULT_ENUMS = Object.freeze({
  containment: ["cancelled", "corrected", "none", "paused", "quarantined", "rolled_back", "unavailable"],
  effect: ["external_write", "none", "public_effect", "read", "repository_write", "spend"],
  outcome: ["ambiguous", "completed", "contained", "failed", "no_action", "unavailable"],
  readback: ["ambiguous", "confirmed", "not_found", "not_required", "unavailable"],
  reason_code: [
    "authority_or_identity",
    "containment_applied",
    "effect_ambiguous",
    "invalid_result",
    "legal_or_consent",
    "measurement_failure",
    "operation_completed",
    "physical_unavailability",
    "provider_error",
    "runtime_exhausted",
    "spend_or_overage",
    "waiting_pr_approval",
  ],
});

export const BASE_SAFETY = Object.freeze({
  read: ["truth", "data_safety"],
  local_state: ["truth", "data_safety", "state", "idempotency"],
  repository_write: ["truth", "authority", "checkout", "ownership", "idempotency"],
  external_write: ["truth", "authority", "ownership", "idempotency", "data_safety"],
  public_effect: ["truth", "authority", "ownership", "idempotency", "data_safety"],
  spend: [
    "truth",
    "authority",
    "ownership",
    "idempotency",
    "caps",
    "readback",
    "containment",
    "incident",
    "budget",
  ],
  human_only: ["truth", "authority", "handoff"],
});

export const SET_ARRAY_KEYS = new Set([
  "mandatory_nodes",
  "mandatory_nodes_must_equal",
  "must_include_nodes",
  "must_include_operations",
  "must_include_state_views",
  "effects_allowed",
  "forbid_effects",
  "forbid_nodes",
  "allow_nodes",
  "requires",
  "conflicts_with",
  "provides",
  "required_capabilities",
  "skills",
  "interference_keys",
  "entry_nodes",
  "run_nodes",
  "operations",
  "state_views",
  "policy_selectors",
]);

export const SELECTION_RULE_KEYS = new Set([
  "must_include_nodes",
  "must_include_operations",
  "must_include_state_views",
  "effects_allowed",
  "forbid_effects",
  "forbid_nodes",
  "allow_nodes",
  "forbid_self_origin",
]);
