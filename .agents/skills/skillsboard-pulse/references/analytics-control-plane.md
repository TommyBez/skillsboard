# PostHog analytics control plane

**Node:** `analytics.control_plane`

This node is required on every scheduled Pulse. It owns PostHog identity, asset lifecycle, official-tool boundaries, measurement outages, and operation readiness. Scorecard semantics belong to `analytics.scorecard`; survey treatment rules belong to `product.lifecycle`.

## Official control plane

Use only the official authenticated PostHog plugin, its live `posthog:posthog` skill, and the operations advertised in the current run. The plugin's live lifecycle, confirmation, and reversibility instructions are authoritative for the mechanism.

A plugin-required confirmation or narrower lifecycle is a capability gate, not permission to stop the whole Pulse or reinterpret the user's standing strategy authorization. If the scheduled context cannot satisfy an advertised confirmation safely, mark only that PostHog transition `manual_action` or `unavailable` with the exact plugin reason, contain dependent exposure when required, and continue every independent lane. Never bypass the plugin requirement or ask for a second strategic approval.

1. Discover capabilities with low-risk reads; never assume yesterday's inventory.
2. Verify production project `225645` before every dependent read or write.
3. Reconcile canonical dashboard `833923` and canonical Tracking QA insight `5096653` (`kI4byVGc`) by live ID and definition; stored IDs remain projections, not proof.
4. Read live state before every write. Manage only resources explicitly marked and registered as Pulse-owned.
5. Persist logical key, deterministic name, semantic version, canonical `definition_hash`, opaque live ID, lifecycle, and reconciliation time. Display name alone is not identity.
6. Reuse or update only an exact semantic match. A semantic change creates a new version and preserves comparable history.
7. Recover a lost create response only by adopting exactly one deterministic-name and exact-definition match; otherwise quarantine.
8. Before a flag-backed experiment, verify the Vercel production SHA contains code consuming the exact flag key. Otherwise route a repository PR and leave the experiment draft unexposed.
9. A rollback removes exposure before measurement ends.
10. Cross-user Activation and Retention use HogQL grouped by `properties.team_id`, never `person.properties.*`.

Never use a private endpoint, Personal API Key, custom REST or HogQL client, local scorecard runner, screenshot, repository guess, database proxy, or product database query as a substitute for the plugin. A valid zero is `available`; missing access or definition is `unavailable`; stale, partial, privacy-unsafe, malformed, or failed measurement is `broken`.

## Production tracking boundary

Trust only production product traffic. Filter the production host and exclude localhost, preview, internal, and test activity according to the verified event schema. Tracking QA verifies sensitive URL sanitization and that attribution, environment, and `team_id` cannot leak raw private values. A repository definition is not evidence that production emits it.

## Read, shadow, and enable gates

Authenticated production reads begin `read_only`. A PostHog write may become `shadow` only when the advertised operation can create or update a deterministic private, draft, or zero-exposure resource and exact readback confirms it.

Every effect must select the exact graph route and satisfy all `switches_all` values declared there. Asset definitions, flags/rollouts, experiments, and surveys use separate operation routes. Any flag, experiment, survey, or rollout exposure additionally requires the product-exposure route; a flag-backed experiment requires both flag and experiment operations. Missing, empty, or non-`1` switches fail closed.

Before enabling, require healthy production tracking, exact cohort and assignment unit, preregistered definition hash, live-code flag-consumption proof where applicable, WIP and interference capacity, guardrails, official readback, and an advertised rollback or safe containment path.

Team-level experiments assign consistently by `team_id`. A team may enter multiple non-interfering experiments; the global cap is owned by `pulse.scheduler`.

## Outage and containment

A plugin or mandatory-read failure blocks only dependent PostHog metrics and mutations. Continue independent trustworthy nodes and record the exact missing tool or capability for retry at the next scheduled run.

- Never launch, expand, evaluate, or mutate a PostHog-dependent resource while its control or measurement plane is unavailable.
- Low/medium-risk active exposure may continue for one heartbeat only when preregistered non-PostHog guardrails remain healthy; total unobservable exposure may not exceed 24 hours. Then pause.
- High-risk exposure moves to its preregistered safe state immediately.
- A measurement outage is `measurement_failure`, never `insufficient` or `inconclusive`.
- Allow one automatic instrumentation repair and clean relaunch. A second failure of the same measurement architecture retires and blocks that architecture until a substantively new definition is independently approved where required.

Containment removes exposure before closing measurement. Ambiguous identity, ownership, creation response, or live effect is quarantined. No time-based auto-release is allowed.

## Required state and digest

Keep only non-PII logical keys, versions, hashes, opaque IDs, lifecycle, control/readback timestamps, measurement health, affected route and node IDs, guardrail state, and result grade. The digest identifies the plugin, verified project, canonical assets, unavailable/broken fields, exposure age during outage, repairs, and next containment deadline without exposing queries or private row data.
