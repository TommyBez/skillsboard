# PostHog analytics control plane

**Node:** `analytics.control_plane`

This node is required on every scheduled Pulse. It owns PostHog identity, asset lifecycle, official-tool boundaries, measurement outages, and operation readiness. Scorecard semantics belong to `analytics.scorecard`; survey treatment rules belong to `product.lifecycle`.

## Official control plane

Use only the official authenticated PostHog plugin, its live `posthog:posthog` skill, and the operations advertised in the current run. The plugin's live lifecycle, confirmation, and reversibility instructions are authoritative for the mechanism.

A plugin confirmation or narrower lifecycle gates only that transition. If it cannot be satisfied safely, use `manual_action` or `unavailable` with the plugin reason, contain dependent exposure when required, and continue independent lanes. Never bypass it or seek another strategic approval.

1. Discover capabilities with low-risk reads; never assume yesterday's inventory.
2. Verify production project `225645` before every dependent read or write.
3. Reconcile canonical dashboard `833923` and canonical Tracking QA insight `5096653` (`kI4byVGc`) by live ID and definition; stored IDs remain projections, not proof.
4. Read before writes; manage only registered Pulse-owned resources.
5. Persist logical key, deterministic name, version, `definition_hash`, live ID, lifecycle, and reconciliation. Display name is not identity.
6. Reuse only exact semantic matches; version semantic changes and preserve history.
7. Lost-create adoption requires one deterministic-name/exact-definition match; else quarantine.
8. Before flag-backed experiments, verify production SHA consumes the exact key; else route a repository PR and leave the draft unexposed.
9. A rollback removes exposure before measurement ends.
10. Cross-user Activation and Retention use HogQL grouped by `properties.team_id`, never `person.properties.*`.

Never substitute private endpoints or keys, custom clients, local runners, screenshots, repository guesses, or database proxies/queries for the plugin. Valid zero is `available`; missing access/definition is `unavailable`; unsafe, malformed, or failed measurement is `broken`.

## Capability recovery and Tracking QA repair

After initial official authenticated discovery failure, allow at most one retry per capability in that Pulse. If it fails, persist exact `unavailable` status/reason; continue independent lanes. Executable repair remains required. `provider_exposure_unavailable` reports failed exposure, not data absence. Repair paths: official PostHog `225645` live SDK-health/duplicate query (production window/dedupe key); official attribution property/definition readback, then instrumentation/definition repair; server classification by official live readback of the production-only Node gate and default `$is_server`, never a hardcoded environment label; official Neon read-only aggregate against official PostHog via `analytics.database_reconcile`. Missing instrumentation uses `delivery.repository` from this node; missing definitions use eligible provider routes; no proxy or DB mutation. A missing Neon operation is not a mismatch.

## Production tracking boundary

Trust only production traffic. Filter its verified host/schema and exclude localhost, preview, internal, and test activity. Tracking QA checks sensitive URL sanitization and no raw private values in attribution, environment, or `team_id`. Repository definition does not prove production emission.

## Read, shadow, and enable gates

Authenticated production reads begin `read_only`. A PostHog write may become `shadow` only when the advertised operation can create or update a deterministic private, draft, or zero-exposure resource and exact readback confirms it.

Every effect must select its graph route and satisfy all `switches_all` values declared there. Asset definitions, flags/rollouts, experiments, and surveys use separate operation routes. Any flag, experiment, survey, or rollout exposure additionally requires the product-exposure route; a flag-backed experiment requires both flag and experiment operations. Missing, empty, or non-`1` switches fail closed.

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
