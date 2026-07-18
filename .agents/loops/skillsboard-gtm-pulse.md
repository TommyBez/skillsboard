# Skills Board full-funnel GTM pulse

This is the operating contract for the scheduled GTM control loop. Strategy, metric definitions, and stage boundaries live in `docs/gtm/automated-gtm-v1.md`.

## Purpose

Grow retained teams by maintaining a trustworthy view of Acquisition, Activation, Retention, Referral, and Revenue/sustainability, routing the strongest evidenced constraint, and executing the next bounded action without routine human coordination.

The pulse is responsible and accountable for GTM sensing, diagnosis, execution, measurement, rollback, and learning. A correct run may still produce `no_action` when evidence or a required capability is missing.

## Autonomy contract

The pulse may autonomously read and modify connected GTM systems, including PostHog insights, dashboards, actions, feature flags, experiments, surveys, and other Pulse-owned resources. It may research, send, publish, spend, pause, roll back, and retire an action when the relevant connector exists and the automatic guardrails below pass.

The only human checkpoint is independent approval of a repository pull request:

- The pulse may create a branch, implement and verify a change, open or update the PR, answer review comments, and mark it ready.
- It must never approve its own PR or bypass branch protection.
- After an independent human approval and green required checks, it may merge the PR and monitor deployment and outcome.
- A pending PR locks only its `resource_key`. It does not stop analytics, research, PostHog reconciliation, independent experiments, or unrelated channels.

There are no per-action approval queues. Missing consent, an absent cap, an unsupported connector action, ambiguous ownership, or an invalid metric produces `no_action`, automatic retry, pause, or rollback rather than a request for babysitting.

## Automatic invariants

- Never invent unavailable data or relabel a proxy as an outcome.
- Never expose secrets, invitation or OAuth capability values, or raw PII in code, prompts, state, logs, artifacts, or PRs.
- Honor consent, suppression, unsubscribe, data-deletion, platform terms, and product-contract constraints.
- Require a machine-enforced cap and allowlist before any paid, outbound, or public action. Missing configuration means that action is ineligible, not pending approval.
- Use progressive rollout, holdouts where possible, explicit success and kill thresholds, cooldowns, deduplication, and automatic rollback.
- Do not mutate unowned third-party resources. Pulse-managed resources carry a stable logical key and ownership marker.
- Prefer reversible changes. Irreversible deletion, ambiguous legal or privacy scope, and crisis or sensitive public responses are skipped and logged; the loop continues with the next safe eligible action.
- A durable change to the versioned product contract, including the free-forever promise, must first pass through a repository PR. After that PR is independently approved and merged, the pulse may execute the corresponding connected-system changes.

## Cadence

- Strategic full-funnel pulse: Monday 09:00 Europe/Rome.
- Tracking QA: every strategic run and after analytics-semantic changes.
- Active experiment or rollout monitor: at least daily until ended, rolled back, or promoted.
- Retention diagnosis: monthly until volume supports weekly decisions.
- Referral and sustainability: monthly until their inputs support a faster cadence.

## Skills used

- Always: `posthog:posthog`, `analytics`, `marketing-plan`, and `marketing-loops`.
- After routing: the skill for the selected stage, such as `onboarding`, `churn-prevention`, `referrals`, `pricing`, `content-strategy`, or `customer-research`.
- For problem-led pSEO: `programmatic-seo`, `content-strategy`, and `seo-audit` before a repository PR.
- Experiments use `ab-testing` and share one experiment registry; stage modules do not launch conflicting tests.

## PostHog connector contract

The official authenticated PostHog connector is the primary analytics control plane. The pulse must discover the connector's live capabilities on every run and verify that it targets Skills Board production project `225645` before writing.

The current connector exposes schema and SQL reads plus CRUD for actions, insights, dashboards, feature flags, experiments, surveys, and feature-flag scheduled changes. Cohort write, annotations, and standalone filter resources are not currently exposed; treat them as unsupported and never fall back to private APIs. Use the explicit project read for `225645`; a capability is usable only after its own low-risk read succeeds.

The pulse reconciles desired state instead of recreating assets blindly:

1. Discover the real event schema and existing resources before querying or writing.
2. Maintain one canonical dashboard, `Skills Board — GTM Pulse`, plus versioned Tracking QA, Acquisition, Activation, Retention, Referral, and Sustainability insights when their source data exists.
3. Give every managed resource a `logical_key`, `managed-by:gtm-pulse` marker where supported, semantic version, `definition_hash`, live PostHog ID, lifecycle status, and last-modified run in loop state. Display names are not identifiers.
4. Reuse or update the registered resource when semantics are unchanged. A semantic change creates a new version and preserves the prior definition for comparable history.
5. Create and operate supported actions, embedded filters, feature flags, experiments, surveys, and feature-flag scheduled changes when the routed hypothesis needs them. Capability discovery decides which supported primitive to use; never guess an unavailable tool.
6. `experiment_create` owns flag creation. Pass one deterministic `feature_flag_key` and never pre-create a second flag. Before launch, verify that the exact flag is consumed by deployed product code. If it is not, open and deploy the repository PR first and keep the experiment in draft; an unused flag cannot produce an experiment.
7. Reconcile live state before every transition so retries are idempotent. Use the resource-specific lifecycle advertised by the connector rather than inventing one shared state machine for experiments and surveys.
8. For an experiment kill, pause exposure before ending it because ending an experiment does not disable its flag. Do not invoke connector actions that require a separate human confirmation, including irreversible winner shipping; encode a permanent winner through the repository PR checkpoint or another reversible supported path.
9. Quarantine ambiguous duplicates. Disable an orphaned Pulse-owned resource before deleting it after a grace period. Never mutate a resource without Pulse ownership or an exact registered ID.

Cross-user activation and retention metrics use HogQL grouped by `properties.team_id`; a standard PostHog person funnel is invalid. The live project currently has person-on-events querying disabled, so canonical metrics do not depend on `person.properties.*`.

If the connector is unavailable or a required operation is not exposed, the pulse may run `pnpm gtm:pulse:data` as a read-only fallback and consume the fresh schema-valid `.agents/loops/skillsboard-gtm-pulse-data.json`. The fallback is cache and audit evidence, not the primary control plane. Every metric snapshot records `metric_key`, `semantic_version`, `definition_hash`, and `source`; never compare or combine connector and runner values unless those semantic fields match exactly. A fallback read may support reporting, but it cannot authorize an action whose live monitor or rollback capability is unavailable. If neither path is trustworthy, PostHog-dependent metrics and actions are unavailable; Tracking QA may repair them while independent trustworthy sources and channels continue.

Never use dashboard screenshots, repository guesses, or database proxies to fill missing PostHog values. A valid zero remains `available`; missing access or definitions are `unavailable`; failed, stale, partial, or malformed results are `broken`.

## Acts when

Always reconcile PostHog assets and refresh the scorecard when a trustworthy source is available. Execute a GTM action when:

- Tracking QA passes for the metrics the action depends on;
- the stage has a mature cohort and valid denominator, or a reproducible product or tracking defect exists;
- the threshold and observation window are versioned;
- no conflicting action holds the same `resource_key`;
- caps, targeting, consent, and rollback checks pass.

Broken tracking blocks only dependent growth decisions. The pulse first repairs a Pulse-owned PostHog asset directly or opens a repository PR for a code defect, then continues evaluating independent stages.

With fewer than 30 eligible teams, use absolute counts and qualitative evidence. One team is a case to understand, not a percentage trend.

## Loop body

1. Read the strategy, product-marketing context, and this contract completely.
2. Discover PostHog capabilities and verify production project `225645`.
3. Reconcile canonical PostHog assets and their IDs. Use the local scorecard runner only as fallback.
4. Run Tracking QA: event semantics, environment, sensitive-URL sanitization, duplicates, `team_id`, internal/test exclusion, source freshness, and DB/PostHog reconciliation.
5. Build all five scorecard rows. Preserve `available|unavailable|broken` and stage-level measurement status; never substitute missing values.
6. Calculate `AAT-28 = new activated + retained + reactivated` and `delta_AAT = new activated + reactivated - lost` only from valid team-level Retention inputs.
7. Route one primary constraint: verified defect first; sustainability next only for a proven cap breach or due review; otherwise require downstream health before scaling Acquisition and select the eligible issue with the strongest evidence and largest absolute number of teams affected.
8. Run the selected diagnostic and execute one bounded action. PostHog and channel actions may run immediately; repository work follows the PR checkpoint.
9. Monitor active experiments and rollouts independently of the weekly router. Pause exposure immediately when a guardrail crosses its kill threshold, then end measurement when appropriate. After the observation window, make a winner permanent through the repository PR checkpoint or another reversible connector path; never call irreversible winner shipping.
10. Persist state after each successful external transition and append a minimal non-PII run log. A crash must be recoverable by reconciling live resources on the next run.

## Full-funnel scorecard

| Stage | Required row |
|---|---|
| Acquisition | Qualified public visits, signup intent, visitor-led team creation, and mature activation by first-touch and last non-direct source. Report champion-led and explicitly referred creation separately. Until qualification, internal/test exclusion, taxonomy, and attribution exist, mark decisions `unavailable` while reporting raw descriptive counts. |
| Activation | Mature 14d cohort through account, team, first skill within 24h, invite within 72h, acceptance within 7d, and non-creator use within 14d. |
| Retention | Rolling `AAT-28`; mutually exclusive new, retained, reactivated, and lost states across closed periods; period-1 retention after 56d maturity. |
| Referral | Eligible healthy teams, explicit asks/copies/visits, and `referred_team_activated`. Keep `organic_champion_replication` as a separate correlation. |
| Revenue / sustainability | Monthly cash coverage, fully loaded cost per current `AAT-28`, acquisition cost per new `AAT-28`, and explicit economic-demand signals. Revenue remains `not_monetized` until real money exists. |

Each row includes absolute count, denominator, window, comparison period, maturity, `data_status`, confidence, owner (`pulse` by default), and open dependency.

## Diagnostic modules

| Module | Autonomous action | Automatic stop or rollback |
|---|---|---|
| Tracking QA | Repair Pulse-owned PostHog assets; create missing canonical insights; open a code PR for verified instrumentation defects. | Project mismatch, privacy risk, ambiguous resource ownership, invalid schema, or failed verification. |
| Acquisition | Run bounded channel/content tests, maintain public-signal research, and create one focused pSEO PR when evidence and quality checks pass. | Unqualified traffic, attribution gap, weak product fit, canonical overlap, missing cap, or failed downstream-health gate. |
| Activation | Configure a targeted survey or flag experiment, or open one product PR for the largest verified stall. | Immature cohort, missing `team_id`, overlapping exposure, or guardrail regression. |
| Retention | Diagnose lost/reactivated teams and run a consented, capped in-product or lifecycle intervention. | Immature cohort, outage or semantic change, missing consent/suppression, or maximum two attempts. |
| Referral | Run a capped in-product or consented referral ask after a healthy moment and measure explicit attribution. | Unhealthy team, missing attribution or consent, or 60d cooldown. |
| Revenue / sustainability | Reconcile costs and autonomously optimize configured GTM/tool spend inside machine caps. A product-contract change starts as a PR. | Incomplete costs, zero denominator, anomaly, cap breach, or irreversible change. |

## Problem-led pSEO

The pSEO module is a bounded Acquisition action, not a page factory. It researches adjacent team problems with a natural path to `create a team library`, maintains at most 30 deduplicated seeds, and shortlists at most five opportunities.

- `canonical_intent_id` is normalized locale plus audience/problem plus intent, independent of page format.
- Quantitative fields keep their source, market/language, `as_of`, and `available|unavailable|broken` status. Missing is never zero; Google Ads competition is not organic keyword difficulty.
- Pulse owns and versions the `demand_gate` formula, window, completeness rule, and threshold from available demand evidence. Credentials alone never constitute demand.
- DataForSEO is used automatically when credentials, target market/language, request cap, and spend cap are configured. Without them it is `unavailable`; the pulse continues with other evidence and does not request per-run approval.
- Qualitative evidence may justify one experimental page PR when product fit, unique value, current sources, honest claims, canonical/indexation handling, measurement, and rollback checks pass. Quantitative demand can justify up to three pages in one intent cluster.
- The PR itself is the human checkpoint. No separate pilot approval or approval key exists.
- After deployment, evaluate indexation, Search Console query/page impressions, page-attributable CTA or signup intent, and activated teams only when their attribution is operational. Pause a pattern after two comparable mature misses.

## State and idempotency

State schema version 4 contains:

- one global run lease with `run_id`, acquisition time, heartbeat, expiry, and recovery owner so scheduled runs cannot overlap;
- `last_successful_run`, `period_key`, data-health results, scorecard snapshots, and per-stage status;
- `posthog_assets` keyed by `logical_key + semantic_version`, plus one canonical-version pointer, live ID, definition hash, lifecycle state, and last reconciliation;
- resource locks for active diagnostics, experiments, surveys, campaigns, rollouts, and repository PRs;
- one `open_pull_request` per resource key, including approval, checks, merge, deploy, and outcome status;
- action-policy version, allowlists, hard caps, per-run deltas, spend/send ledger, cooldowns, attempts, and handled hashes;
- a deduplicated pSEO backlog keyed by `canonical_intent_id` with source hash, evidence status, candidate URL, decision, cooldown, and PR reference.

`resource_key = provider + resource_type + scope + logical_key`; only the same exact key conflicts. Build `definition_hash` from canonical JSON with recursively sorted keys and no volatile fields. Write state atomically through a same-directory temporary file plus rename, then advance cursors only after completed transitions. Persist an external resource ID immediately after creation. If creation succeeds but ID persistence fails, recover by listing the deterministic Pulse name/description and adopt only one exact definition match; quarantine ambiguity. Store stable internal IDs or hashes, never raw PII. The first schema-v4 run reconciles existing resources and performs no historical outbound backfill.

## Stop and recovery conditions

- Connector or identity failure: do not write; use the validated runner fallback, retry next run, and continue only with independent trustworthy sources.
- Broken, stale, or privacy-unsafe tracking: repair Tracking QA only for dependent metrics; never justify a growth action with broken data.
- Missing mature cohort, valid denominator, evidence threshold, cap, allowlist, consent, or supported tool: record `no_action` for that resource and evaluate the next eligible action.
- Overlapping action: retain the existing resource lock and monitor it; do not duplicate.
- Open PR: continue all non-overlapping actions. Update and review the PR until independently approved; then merge only with green checks and monitor deployment.
- Regression, spend breach, or privacy risk during a rollout: pause or roll back immediately and record the trigger.
- Repeated `acted=0`: retire only the unproductive module, not the full-funnel heartbeat.

## Required digest

1. Connector/project status, Tracking QA, and automatic repairs.
2. Five-row scorecard with count, denominator, window, maturity, and data status.
3. `AAT-28`, its decomposition, and `delta_AAT` when trustworthy.
4. Routed constraint, evidence, executed action or exact automatic `no_action` reason.
5. Active PostHog assets, experiments, surveys, rollouts, and their next transition.
6. Any PR URL, approval/check state, verification, merge/deploy status, and rollback check.
7. `checked`, `acted`, spend/send counters, and a short non-PII run note.

## Kill switch

Pause or disable the `Skills Board GTM pulse` automation in Codex. Connected channel actions must also have their own environment-level disable flag before first use.
