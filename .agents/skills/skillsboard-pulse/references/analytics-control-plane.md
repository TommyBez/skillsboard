# PostHog analytics control plane

**Node:** `analytics.control_plane`

This node is required on every scheduled Pulse. It owns PostHog identity, asset lifecycle, official-tool boundaries, measurement outages, and operation readiness. Scorecard semantics belong to `analytics.scorecard`; survey treatment rules belong to `product.lifecycle`.

## Official control plane

Use only the official authenticated PostHog plugin, its live `posthog:posthog` skill, and the operations advertised in the current run. The plugin's live lifecycle, confirmation, and reversibility instructions are authoritative for the mechanism.

A plugin confirmation or narrower lifecycle gates only that transition. If it cannot be satisfied safely, use `manual_action` or `unavailable` with the plugin reason, contain dependent exposure when required, and continue independent lanes. Never bypass it or seek another strategic approval.

1. Use an exact currently advertised operation directly when available; otherwise discover capabilities with low-risk reads. Never assume yesterday's inventory.
2. Verify production project `225645` from the current authenticated operation context or a bounded identity read. Do not require a separate broad project metadata call before every dependent operation.
3. Reconcile canonical dashboard `833923` and canonical Tracking QA insight `5096653` (`kI4byVGc`) by live ID and definition; stored IDs remain projections, not proof.
4. Read before writes; manage only registered Pulse-owned resources.
5. Persist logical key, deterministic name, version, `definition_hash`, live ID, lifecycle, and reconciliation. Display name is not identity.
6. Reuse only exact semantic matches; version semantic changes and preserve history.
7. Lost-create adoption requires one deterministic-name/exact-definition match; else quarantine.
8. Before flag-backed experiments, verify production SHA consumes the exact key; else route a repository PR and leave the draft unexposed.
9. A rollback removes exposure before measurement ends.
10. Cross-user Activation and Retention use HogQL grouped by `properties.team_id`, never `person.properties.*`.

Never substitute private endpoints or keys, custom clients, local runners, screenshots, repository guesses, or database proxies/queries for the plugin. Valid zero is `available`; missing access/definition is `unavailable`; unsafe, malformed, or failed measurement is `broken`.

PostHog may return `created_by` fields and the browser-safe `phc_` project token. Use only required fields and never persist extras. Inside the same authenticated connector these are not incidents or blockers. Privileged keys, wrong-recipient disclosure, or unauthorized cross-project data remain incident-eligible.

## Capability recovery and Tracking QA repair

Apply the kernel's tuple-scoped three-total-attempt budget to retryable PostHog capability reads, with fresh discovery before each retry and one eligible retry for a malformed read through a narrower advertised projection. Do not spend another resource's budget or retry deterministic auth, scope, terms, unsupported-operation, or validation failures. After the final eligible attempt, persist exact `unavailable` status/reason and continue independent lanes. Executable repair remains required. `provider_exposure_unavailable` reports failed exposure, not data absence. Repair paths: official PostHog `225645` live SDK-health/duplicate query (production window/dedupe key); official attribution property/definition readback, then instrumentation/definition repair; server classification by official live readback of the production-only Node gate and default `$is_server`, never a hardcoded environment label; official Neon read-only aggregate against official PostHog via `analytics.database_reconcile`. Missing instrumentation uses `delivery.repository` from this node; missing definitions use eligible provider routes; no proxy or DB mutation. A missing Neon operation is not a mismatch.

## Production tracking boundary

Trust only production traffic. Filter its verified host/schema and exclude localhost, preview, internal, and test activity. Tracking QA checks sensitive URL sanitization and no raw private values in attribution, environment, or `team_id`. Repository definition does not prove production emission.

## Read, shadow, and enable gates

Authenticated production reads begin `read_only`. A deterministic private measurement asset such as a dashboard, insight, cohort definition, or event definition may become `enabled` after project identity, ownership, semantic version, `definition_hash`, asset-cap, and exact official readback pass; it does not inherit exposure gates. A flag, experiment, survey, rollout, or other user-visible resource may become only `shadow` before its exposure gates pass.

Every effect must select its exact graph route. Asset definitions, flags/rollouts, experiments, and surveys use separate operations. Any exposure additionally requires the product-lifecycle eligibility, assignment, WIP, guardrail, readback, and containment gates; a flag-backed experiment requires both flag and experiment operations.

Before enabling **exposure**, require healthy production tracking, exact cohort and assignment unit, preregistered definition hash, live-code flag-consumption proof where applicable, WIP and interference capacity, guardrails, official readback, and an advertised rollback or safe containment path.

Team-level experiments assign consistently by `team_id`. A team may enter multiple non-interfering experiments; the global cap is owned by `pulse.scheduler`.

## Outage and containment

A plugin or mandatory-read failure blocks only dependent PostHog metrics and mutations. Continue independent trustworthy nodes and record the exact missing tool or capability for retry at the next scheduled run.

An over-broad authorized projection may block only that metadata read, never independent PostHog operations.

- Never launch, expand, evaluate, or mutate a PostHog-dependent resource while its control or measurement plane is unavailable.
- Low/medium-risk active exposure may continue for one heartbeat only when preregistered non-PostHog guardrails remain healthy; total unobservable exposure may not exceed 24 hours. Then pause.
- High-risk exposure moves to its preregistered safe state immediately.
- A measurement outage is `measurement_failure`, never `insufficient` or `inconclusive`.
- Allow one automatic instrumentation repair and clean relaunch per distinct verified `root_cause_hash + definition_hash`, subject to a rolling circuit breaker. Retire an architecture only after the same cause/hash repeats after its clean relaunch; a different evidenced cause may receive its own bounded repair. Repository repairs still require independent PR approval.

Containment removes exposure before closing measurement. Ambiguous identity, ownership, creation response, or live effect is quarantined. No time-based auto-release is allowed.

## Required state and digest

Keep only non-PII logical keys, versions, hashes, opaque IDs, lifecycle, control/readback timestamps, measurement health, affected route and node IDs, guardrail state, and result grade. The digest identifies the plugin, verified project, canonical assets, unavailable/broken fields, exposure age during outage, repairs, and next containment deadline without exposing queries or private row data.
