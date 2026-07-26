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

Use the kernel retry budget. Discovery and SDK doctor are optional diagnostics: record their absence, but it alone is not `measurement_failure` and cannot stop repository repair, provider-independent work, or a metric with available mandatory reads. Define mandatory reads per item and fail closed only its dependent item.

`provider_exposure_unavailable` means failed exposure, not absent data. Assume event capture is not duplicating until concrete contrary evidence exists. A missing custom key or preventive health check is not evidence and creates no pending work, required read, monitoring obligation, or success gate. Open a bounded duplicate investigation only after a reproducible repeated capture, a provider integrity alert, or an observed incompatible repeated business event. Repair instrumentation via `delivery.repository`; definitions and attribution via eligible provider routes. Validate Node server classification from production `$is_server`; Neon is read-only via `analytics.database_reconcile`. Never use proxies, private clients, hardcoded environment labels, or DB mutation.

## Production tracking boundary

Trust only production traffic. Filter its verified host/schema and exclude localhost, preview, internal, and test activity. Tracking QA checks sensitive URL sanitization and no raw private values in attribution, environment, or `team_id`. Repository definition does not prove production emission.

## Read, shadow, and enable gates

Authenticated production reads begin `read_only`. A deterministic private measurement asset such as a dashboard, insight, cohort definition, or event definition may become `enabled` after its operation-specific gates, project identity, ownership, semantic version, `definition_hash`, asset-cap, advertised containment path, and exact official readback pass; it does not inherit user-exposure gates. A flag, experiment, survey, rollout, or other user-visible resource may become only `shadow` before its exposure gates pass.

Every effect must select its exact graph route. Asset definitions, flags/rollouts, experiments, and surveys use separate operations. Any exposure additionally requires the product-lifecycle eligibility, assignment, WIP, guardrail, readback, and containment gates; a flag-backed experiment requires both flag and experiment operations.

Before enabling **exposure**, require healthy production tracking, exact cohort and assignment unit, preregistered definition hash, live-code flag-consumption proof where applicable, WIP and interference capacity, guardrails, official readback, and an advertised rollback or safe containment path.

Team-level experiments assign consistently by `team_id`. A team may enter multiple non-interfering experiments; the global cap is owned by `pulse.scheduler`.

## Outage and containment

A plugin or mandatory-read failure blocks only dependent PostHog metrics and mutations. Continue independent trustworthy nodes and record the exact missing tool or capability for retry at the next scheduled run.

An over-broad authorized projection may block only that metadata read, never independent PostHog operations.

- Never launch, expand, evaluate, or mutate a PostHog-dependent resource while its control or measurement plane is unavailable.
- Low/medium-risk active exposure may continue for one heartbeat only when preregistered non-PostHog guardrails remain healthy; total unobservable exposure may not exceed 24 hours. Then pause.
- High-risk exposure moves to its preregistered safe state immediately.
- A failed mandatory read or broken measurement is `measurement_failure` for its exact dependent metric, decision, or exposure, never `insufficient` or `inconclusive`. Missing optional diagnostics remain `diagnostic_unavailable` and do not broaden the outage perimeter.
- Allow one automatic instrumentation repair and clean relaunch per distinct verified `root_cause_hash + definition_hash`, subject to a rolling circuit breaker. Retire an architecture only after the same cause/hash repeats after its clean relaunch; a different evidenced cause may receive its own bounded repair. Repository repairs still require independent PR approval.

Containment removes exposure before closing measurement. Ambiguous identity, ownership, creation response, or live effect is quarantined. No time-based auto-release is allowed.

## Required state and digest

Keep only non-PII logical keys, versions, hashes, opaque IDs, lifecycle, control/readback timestamps, measurement health, affected route and node IDs, guardrail state, and result grade. The digest identifies the plugin, verified project, canonical assets, unavailable/broken fields, exposure age during outage, repairs, and next containment deadline without exposing queries or private row data.
