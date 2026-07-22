# Skills Board full-funnel GTM pulse

This is the operating contract for the scheduled GTM control loop. Strategy, metric definitions, and stage boundaries live in `docs/gtm/automated-gtm-v1.md`.

## Purpose

Grow retained teams by maintaining a trustworthy view of Acquisition, Activation, Retention, Referral, and Revenue/sustainability, protecting a weekly problem-led pSEO research and publish-to-learn lane, routing the strongest evidenced constraint, and executing the next bounded action without routine human coordination.

The pulse is responsible and accountable for GTM sensing, diagnosis, execution, measurement, rollback, and learning. A correct run may still produce `no_action` when evidence or a required capability is missing.

## Autonomy contract

The pulse may autonomously read and modify connected GTM systems, including PostHog insights, dashboards, actions, feature flags, experiments, surveys, and other Pulse-owned resources. It may research, send, publish, spend, pause, roll back, and retire an action when the relevant integration and tools exist and the automatic guardrails below pass.

The only human checkpoint is independent approval of a repository pull request:

- The pulse may create a branch, implement and verify a change, open or update the PR, answer review comments, and mark it ready.
- It must never approve its own PR or bypass branch protection.
- After an independent human approval and green required checks, it may merge the PR and monitor deployment and outcome.
- A pending PR locks only its `resource_key`. It does not stop analytics, research, PostHog reconciliation, independent experiments, or unrelated channels.

There are no per-action approval queues. Missing consent, an absent cap, an unsupported tool action, ambiguous ownership, or an invalid metric produces `no_action`, automatic retry, pause, or rollback rather than a request for babysitting.

## Automatic invariants

- Never invent unavailable data or relabel a proxy as an outcome.
- Never expose secrets, invitation or OAuth capability values, or raw PII in code, prompts, state, logs, outputs, or PRs.
- Honor consent, suppression, unsubscribe, data-deletion, platform terms, and product-contract constraints.
- Require a machine-enforced cap and allowlist before any paid, outbound, or public action. Missing configuration means that action is ineligible, not pending approval.
- Use progressive rollout, holdouts where possible, explicit success and kill thresholds, cooldowns, deduplication, and automatic rollback.
- Do not mutate unowned third-party resources. Pulse-managed resources carry a stable logical key and ownership marker.
- Prefer reversible changes. Irreversible deletion, ambiguous legal or privacy scope, and crisis or sensitive public responses are skipped and logged; the loop continues with the next safe eligible action.
- A durable change to the versioned product contract, including the free-forever promise, must first pass through a repository PR. After that PR is independently approved and merged, the pulse may execute the corresponding connected-system changes.

## Cadence

- Strategic full-funnel pulse: Monday 09:00 Europe/Rome.
- Protected problem-led pSEO research: complete at least once every seven days, normally in the Monday strategic pulse. If `pseo_research.next_due_at` has passed, the first subsequent heartbeat performs the missed research pass without routing a second strategic constraint.
- Protected pSEO learning slot: evaluate at least once every seven days and, when the qualitative publication gate passes, create one focused PR containing at most two experimental pages from the same problem cluster. Missing or `null` quantitative demand does not block this slot. A transient repository conflict retains the overdue slot for the next heartbeat; a completed quality-based `no_action` advances it by seven days.
- Tracking QA: every strategic run and after analytics-semantic changes.
- Active experiment or rollout monitor: at least daily until ended, rolled back, or promoted.
- Retention diagnosis: monthly until volume supports weekly decisions.
- Referral and sustainability: monthly until their inputs support a faster cadence.

## Skills used

- Always: `posthog:posthog`, `analytics`, `marketing-plan`, and `marketing-loops`.
- After routing: the skill for the selected stage, such as `onboarding`, `churn-prevention`, `referrals`, `pricing`, `content-strategy`, or `customer-research`.
- For every problem-led pSEO research pass: `programmatic-seo` and `content-strategy`; add `seo-audit` before a repository PR.
- Experiments use `ab-testing` and share one experiment registry; stage modules do not launch conflicting tests.

## Official PostHog plugin contract

The official authenticated PostHog plugin — the `posthog:posthog` skill and its tools — is authoritative for analytics control. Product SDK ingestion remains separate. The pulse never assumes a fixed capability inventory: on every run it discovers the tools currently advertised, verifies Skills Board production project `225645`, and reads live state before any write. It never uses private APIs or introduces an alternate PostHog query or control client.

The pulse reconciles desired state instead of recreating assets blindly:

1. Discover the available plugin capabilities, real event schema, and existing resources; stop PostHog writes on project mismatch or ambiguous identity.
2. Maintain one canonical dashboard, `Skills Board — GTM Pulse`, plus versioned Tracking QA, Acquisition, Activation, Retention, Referral, and Sustainability insights when their source data exists.
3. Give every managed resource a `logical_key`, `managed-by:gtm-pulse` marker where supported, semantic version, `definition_hash`, live PostHog ID, lifecycle status, and last-modified run in loop state. Display names are not identifiers.
4. Reuse or update the registered resource when semantics are unchanged. A semantic change creates a new version and preserves the prior definition for comparable history.
5. Use only operations advertised by the plugin in the current run. Treat an unsupported operation as `unavailable`; do not guess or emulate it.
6. Before launching any flag-backed experiment, verify that deployed product code consumes the exact flag. Otherwise open and deploy the repository PR first and leave the experiment unlaunched.
7. Reconcile live state before every transition and obey each tool's advertised lifecycle, confirmation, and irreversibility rules. Skip an action that cannot satisfy those rules automatically.
8. Quarantine ambiguous duplicates. Disable an orphaned Pulse-owned resource before deleting it after a grace period. Never mutate a resource without Pulse ownership or an exact registered ID.

Cross-user activation and retention metrics use HogQL grouped by `properties.team_id`; a standard PostHog person funnel is invalid, and canonical metrics do not depend on `person.properties.*`.

If the official PostHog plugin is unavailable or a required operation is not exposed, only PostHog-dependent metrics and actions are `unavailable`. The pulse retries on its next run and continues with independent trustworthy sources and channels; it never substitutes screenshots, repository guesses, database proxies, or private APIs for missing PostHog data or capabilities. A valid zero remains `available`; missing access or definitions are `unavailable`; failed, stale, partial, or malformed results are `broken`.

## Acts when

Always reconcile PostHog assets and refresh the scorecard when a trustworthy source is available. Run protected pSEO research, deployed-page checkpoints, and the learning-slot evaluation whenever they are due, independently of PostHog availability or the routed stage; unavailable research sources disable only their dependent fields. Execute a GTM action when:

- Tracking QA passes for the metrics the action depends on;
- the stage has a mature cohort and valid denominator, or a reproducible product or tracking defect exists;
- the threshold and observation window are versioned;
- no conflicting action holds the same `resource_key`;
- caps, targeting, consent, and rollback checks pass.

The protected pSEO learning slot does not require a mature Acquisition denominator or a quantitative `demand_gate=pass`. It may publish through the repository PR checkpoint when one or two candidates in one problem cluster have current qualitative intent evidence, distinct and useful page value, truthful product claims, canonical safety, complete SEO/indexation handling, measurement, and rollback. At most one new repository PR may be created in a run, and no more than four indexable pSEO pages may remain live without at least one completed 14-day checkpoint.

Broken tracking blocks only dependent growth decisions. The pulse first repairs a Pulse-owned PostHog asset directly or opens a repository PR for a code defect, then continues evaluating independent stages.

With fewer than 30 eligible teams, use absolute counts and qualitative evidence. One team is a case to understand, not a percentage trend.

## Loop body

1. Read the strategy, product-marketing context, and this contract completely.
2. Discover PostHog capabilities and verify production project `225645`.
3. Reconcile canonical PostHog assets and their IDs through the official PostHog plugin.
4. Run Tracking QA: event semantics, environment, sensitive-URL sanitization, duplicates, `team_id`, internal/test exclusion, source freshness, and DB/PostHog reconciliation.
5. Build all five scorecard rows. Preserve `available|unavailable|broken` and stage-level measurement status; never substitute missing values.
6. Calculate `AAT-28 = new activated + retained + reactivated` and `delta_AAT = new activated + reactivated - lost` only from valid team-level Retention inputs.
7. When `pseo_research.next_due_at <= now` or no completed pSEO research pass is recorded, run the protected research pass and refresh only the deduplicated evidence backlog and source statuses. Treat every attempted outcome, including `available`, `unavailable`, `broken`, and `no_action`, as cadence-complete. Atomically persist the full `pseo_research` record with its outcome, `last_completed_at`, `next_due_at = last_completed_at + 7 days`, last run ID, source statuses, checked and shortlisted counts, and definition hash. Retain missing sources as unavailable for retry on the next due pass. This sensing pass does not itself open a PR or publish.
8. Reconcile every deployed pSEO experiment whose T+3, T+7, T+14, or T+28 checkpoint is due. Apply the versioned keep, retarget, expand, consolidate, `noindex`, retire, or immediate rollback transition from available page-specific evidence. Monitoring does not consume the primary router or the weekly learning slot.
9. Route one primary constraint: verified defect first; sustainability next only for a proven cap breach or due review; otherwise require downstream health before scaling Acquisition and select the eligible issue with the strongest evidence and largest absolute number of teams affected. A larger pSEO expansion may be selected here, never alongside another primary action.
10. Run the selected diagnostic and execute one bounded primary action. PostHog and channel actions may run immediately; repository work follows the PR checkpoint.
11. If `pseo_learning` is absent or `pseo_learning.next_slot_at <= now`, no new repository PR was created in this run, no overlapping pSEO cluster PR exists, fewer than four live pages lack a completed 14-day checkpoint, and one or two candidates from one cluster pass the qualitative publication gate, create one focused experimental-page PR. The first run after this contract initializes an absent slot as due immediately. Missing, zero, or `null` quantitative demand is prioritization evidence, not a veto. A transient PR/resource conflict leaves the slot overdue for the next heartbeat; an opened PR or no quality-qualified candidate records the outcome and advances `next_slot_at` by seven days.
12. Monitor active experiments and rollouts independently of the weekly router. Pause exposure immediately when a guardrail crosses its kill threshold, then end measurement when appropriate. After the observation window, make a winner permanent through the repository PR checkpoint or another reversible plugin-supported path; otherwise leave the permanent transition unapplied.
13. Persist state after each successful external transition and every attempted pSEO research, checkpoint, or learning-slot outcome, then append a minimal non-PII run log. A crash must be recoverable by reconciling live resources on the next run.

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
| Acquisition | Complete protected weekly pSEO research, monitor deployed page checkpoints, and use one publish-to-learn slot for at most two pages from one problem cluster when the qualitative publication gate passes. Use the routed primary action for larger pSEO expansion or another bounded channel test. | Missing demand data marks only its fields unavailable and does not block the learning slot. Weak product fit, canonical overlap, thin or inaccurate content, four live pages without a 14-day checkpoint, another PR created in the run, an overlapping cluster lock, or failed SEO/verification blocks implementation. |
| Activation | Configure a targeted survey or flag experiment, or open one product PR for the largest verified stall. | Immature cohort, missing `team_id`, overlapping exposure, or guardrail regression. |
| Retention | Diagnose lost/reactivated teams and run a consented, capped in-product or lifecycle intervention. | Immature cohort, outage or semantic change, missing consent/suppression, or maximum two attempts. |
| Referral | Run a capped in-product or consented referral ask after a healthy moment and measure explicit attribution. | Unhealthy team, missing attribution or consent, or 60d cooldown. |
| Revenue / sustainability | Reconcile costs and autonomously optimize configured GTM/tool spend inside machine caps. A product-contract change starts as a PR. | Incomplete costs, zero denominator, anomaly, cap breach, or irreversible change. |

## Problem-led pSEO

The pSEO module has a protected research lane, a protected publish-to-learn slot, and a routed scaling lane; none is an unbounded page factory. Research and the learning-slot evaluation complete at least once every seven days even when another stage is the primary constraint. Research investigates adjacent team problems with a natural path to `create a team library`, maintains at most 30 deduplicated seeds, and shortlists at most five opportunities. The learning slot may create one focused PR containing at most two pages from the same problem cluster without waiting for Acquisition routing or quantitative demand. Larger template or sibling expansion requires the run's single primary routed action.

- `canonical_intent_id` is normalized locale plus audience/problem plus intent, independent of page format.
- `problem_cluster_id` is normalized locale plus the shared audience/problem family, independent of the exact query and page format. A learning PR may contain only candidates with the same cluster ID, and its repository lock uses `resource_key=github + content_cluster + production + problem_cluster_id`.
- Quantitative fields keep their source, market/language, `as_of`, and `available|unavailable|broken` status. Missing is never zero; Google Ads competition is not organic keyword difficulty.
- Pulse owns and versions the `demand_gate` formula, window, completeness rule, and threshold from available demand evidence. Credentials alone never constitute demand. The gate prioritizes candidates and multi-page scaling; it does not veto a bounded qualitative learning slot.
- DataForSEO is used automatically when credentials, target market/language, request cap, and spend cap are configured. The base64-encoded `login:password` credential is available in `.env.local` as `DATA_FOR_SEO_LOGIN_PASSWORD`. Without credentials or caps it is `unavailable`; the pulse continues with other evidence and does not request per-run approval.
- Public SERPs, official vendor documentation, primary research, and attributable public problem signals remain eligible qualitative inputs when paid or connected sources are unavailable. Record the exact unavailable source without skipping the rest of the weekly pass.
- Qualitative evidence may justify one focused PR with at most two experimental pages from one problem cluster when product fit, unique page value, current sources, honest claims, canonical/indexation handling, measurement, and rollback checks pass. Quantitative demand or positive deployed-page evidence can justify up to three additional pages in one intent cluster through the routed scaling lane.
- The PR itself is the human checkpoint. No separate pilot approval or approval key exists.
- After deployment, evaluate without pausing new non-overlapping learning slots: T+3 deployment/canonical/sitemap/crawl/indexation/runtime; T+7 query discovery, impressions, pageviews, and trustworthy page-attributable intent; T+14 first keep, retarget, or routed-expand decision; T+28 retain, expand, consolidate, `noindex`, or retire. Zero impressions on a technically healthy page before T+28 is inconclusive. A page that remains indexed with zero useful impressions after one material iteration is consolidated, `noindex`ed, or retired at T+28 unless it has documented non-SEO utility. Pause a pattern after two comparable 28-day misses. Roll back immediately for factual or product-contract errors, privacy risk, broken routes, accidental indexation, or confirmed canonical conflict.

## State and idempotency

State schema version 4 contains:

- one global run lease with `run_id`, acquisition time, heartbeat, expiry, and recovery owner so scheduled runs cannot overlap;
- `last_successful_run`, `period_key`, data-health results, scorecard snapshots, and per-stage status;
- `posthog_assets` keyed by `logical_key + semantic_version`, plus one canonical-version pointer, live ID, definition hash, lifecycle state, and last reconciliation;
- resource locks for active diagnostics, experiments, surveys, campaigns, rollouts, and repository PRs;
- one `open_pull_request` per resource key, including approval, checks, merge, deploy, and outcome status;
- action-policy version, allowlists, hard caps, per-run deltas, spend/send ledger, cooldowns, attempts, and handled hashes;
- `pseo_research` with outcome, `last_completed_at`, `next_due_at`, last run ID, source statuses, checked and shortlisted counts, and a definition hash for the research contract;
- `pseo_learning` with `last_slot_at`, `next_slot_at`, outcome, definition hash, current problem-cluster lock, and a registry of page experiments containing URL, hypothesis, PR/deploy references, publication time, T+3/T+7/T+14/T+28 due and completed timestamps, measurement status, iterations, lifecycle state, and rollback reason;
- a deduplicated pSEO backlog keyed by `canonical_intent_id` with source hash, evidence status, candidate URL, decision, cooldown, and PR reference.

`resource_key = provider + resource_type + scope + logical_key`; only the same exact key conflicts. Build `definition_hash` from canonical JSON with recursively sorted keys and no volatile fields. Write state atomically through a same-directory temporary file plus rename, then advance cursors only after completed transitions. Persist an external resource ID immediately after creation. If creation succeeds but ID persistence fails, recover by listing the deterministic Pulse name/description and adopt only one exact definition match; quarantine ambiguity. Store stable internal IDs or hashes, never raw PII. The first schema-v4 run reconciles existing resources and performs no historical outbound backfill.

## Stop and recovery conditions

- PostHog plugin or project-identity failure: do not write to PostHog, mark only PostHog-dependent metrics and actions `unavailable`, retry next run, and continue with independent trustworthy sources.
- Broken, stale, or privacy-unsafe tracking: repair Tracking QA only for dependent metrics; never justify a growth action with broken data.
- Missing mature cohort, valid denominator, evidence threshold, cap, allowlist, consent, or supported tool: record `no_action` for that resource and evaluate the next eligible action.
- Missing pSEO research input: mark only that source and its dependent fields `unavailable`, complete the remaining trustworthy research, and retry the source on the next due pass. A total absence of trustworthy sources records an exact pSEO research `no_action`, atomically advances `last_completed_at` and `next_due_at`, and does not create or publish anything.
- Missing or `null` quantitative pSEO demand: retain the field as unavailable and continue evaluating the qualitative learning slot. No quality-qualified candidate advances the slot with an exact `no_action`; a transient repository conflict retains the overdue slot for the next heartbeat.
- Overlapping action: retain the existing resource lock and monitor it; do not duplicate.
- Open PR: continue all non-overlapping actions. Update and review the PR until independently approved; then merge only with green checks and monitor deployment.
- Regression, spend breach, or privacy risk during a rollout: pause or roll back immediately and record the trigger.
- Repeated `acted=0`: retire only the unproductive module, not the full-funnel heartbeat.

## Required digest

1. Official PostHog plugin/project status, Tracking QA, and automatic repairs.
2. Five-row scorecard with count, denominator, window, maturity, and data status.
3. `AAT-28`, its decomposition, and `delta_AAT` when trustworthy.
4. Protected pSEO research and learning-slot status, last completion, next due time, source availability, checked/shortlisted counts, active page experiments with their next T+3/T+7/T+14/T+28 transition, and any backlog decision.
5. Routed constraint, evidence, executed action or exact automatic `no_action` reason.
6. Active PostHog assets, experiments, surveys, rollouts, and their next transition.
7. Any PR URL, approval/check state, verification, merge/deploy status, and rollback check.
8. `checked`, `acted`, spend/send counters, and a short non-PII run note.

## Kill switch

Pause or disable the `Skills Board GTM pulse` automation in Codex. Connected channel actions must also have their own environment-level disable flag before first use.
