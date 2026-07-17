# Skills Board full-funnel GTM pulse

This is the operating contract for the scheduled weekly GTM router. Strategy, metric definitions, and stage boundaries live in `docs/gtm/automated-gtm-v1.md`.

## Purpose

Maintain one trustworthy view of Acquisition, Activation, Retention, Referral, and Revenue/sustainability, then route at most one evidenced constraint to a diagnostic. The pulse is a sensing and decision system, not a mandate to produce activity every week.

## Check cadence

Monday 09:00 Europe/Rome. Run an additional Tracking QA check after changes to analytics semantics. Retention diagnosis is monthly until volume supports a weekly read; Referral is monthly and dormant until eligible happy moments exist; sustainability is reviewed monthly with a quarterly strategy decision.

## Acts when

Always refresh the scorecard when sources are available. Recommend or implement a growth action only when:

- Tracking QA passes;
- the stage has a mature cohort and a valid denominator;
- a verified defect exists, at least three teams share the issue, or the pattern repeats in two comparable windows;
- an owner is assigned;
- no diagnostic, experiment, or unanswered human decision is already open.

A repository-fixable Tracking QA defect is the only exception to the first gate: the pulse may open a draft repair PR when source inspection plus a reproducible check proves the defect. It must not use broken tracking to justify a growth experiment.

With fewer than 30 eligible teams, use absolute counts and qualitative evidence. A single team is a case to understand, not a percentage trend.

## Skills used

- Always: `analytics`, `marketing-plan`, `marketing-loops`.
- Only after routing: the skill for the selected stage, such as `onboarding`, `churn-prevention`, `referrals`, `pricing`, `content-strategy`, or `customer-research`.
- Experiments converge on one backlog and use `ab-testing`; stage modules do not launch competing tests.

## Executable data contract

The pulse must use this sequence on every run:

1. Execute `pnpm gtm:pulse:data` before reading or calculating any metric.
2. Read only the generated `.agents/loops/skillsboard-gtm-pulse-data.json`. Do not query PostHog ad hoc, reuse dashboard screenshots, or reconstruct missing values from repository or database clues.
3. Continue only when the artifact exists, matches the expected schema, is fresh for the current run, and has top-level `status=ready`. If any check fails, the only allowed output is Tracking QA with the dependency marked `unavailable` or `broken`.
4. Preserve each query's data status exactly: `available` means the query succeeded and returned a valid result, including a valid zero; `unavailable` means a required credential, definition, query, or source does not exist; `broken` means an expected query failed, returned an invalid shape, or is stale. Never infer, estimate, or substitute a proxy for an unavailable or broken value.

PostHog capture and PostHog query access are separate capabilities. `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` send events only and cannot make the pulse readable. The runner requires `POSTHOG_PERSONAL_API_KEY` with the minimum `Query Read` permission, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_HOST`; `POSTHOG_DEPLOYMENT_ENVIRONMENT` optionally selects `production` (default), `preview`, or `development`. These values are server/local-only and must never use a `NEXT_PUBLIC_` prefix, enter client bundles, logs, state, or generated artifacts.

The pulse is not live until those query credentials are present, the runner has completed successfully against the intended production project, the artifact schema and freshness have been validated, and a dry run has consumed that artifact without inference.

## Loop body

1. Read the strategy and this contract completely.
2. Execute `pnpm gtm:pulse:data`, then load only `.agents/loops/skillsboard-gtm-pulse-data.json` under the executable data contract above.
3. Run Tracking QA over the artifact: verify event semantics, schema version, environment, sensitive-URL sanitization, duplicates, `team_id` coverage, internal/test exclusion, source freshness, and DB/PostHog reconciliation results.
4. Build the full-funnel scorecard. Every data-bearing row has `data_status=available|unavailable|broken`; maturity and monetization are separate fields, not data-status values. Acquisition remains `unavailable` for qualification and source-to-activation decisions until a written qualification rule, internal/test exclusion, source taxonomy, and team-level attribution query all exist; raw traffic and intent counts remain descriptive only.
5. Calculate `AAT-28 = new activated + retained + reactivated` and `ΔAAT = new activated + reactivated - lost`, grouped by `team_id` rather than `distinct_id`, only from `available` artifact values.
6. Exclude stages without instrumentation, mature cohorts, a valid denominator, or `available` required inputs.
7. If a verified product defect exists, route it before marketing work. Before routing an Acquisition scaling action, require Activation and Retention health gates to pass; if they fail, the failing downstream stage owns the constraint. Among the remaining eligible stages, select the issue with the strongest evidence and largest absolute number of teams affected. Sustainability enters routing only on a cost-cap breach or during its quarterly review.
8. Run only the selected diagnostic module. Public demand-signal scanning is Acquisition work and runs only when Acquisition is selected or during a monthly research refresh.
9. If the single routed constraint is a verified repository-fixable defect, or a bounded experiment passes every data, maturity, threshold, ownership, and concurrency gate, implement one coherent change on a `codex/gtm-<slug>` branch. Add focused tests, run proportionate verification, inspect the final diff, then commit, push, and open a draft PR. Never push when verification fails.
10. Otherwise recommend one action with owner, expected metric, observation window, and success/kill check. If none qualifies, report `no action`.
11. Update state only after a successful run, record any open PR so later runs update rather than duplicate it, and append a minimal non-PII run log.

## Full-funnel scorecard output

| Stage | Required weekly row |
|---|---|
| Acquisition | Raw public visits and anonymous signup intent now; qualified visitors, visitor-led team creation, and eventual activation by first-touch and last non-direct source only after their contracts exist. Until then mark the decision row `unavailable`. Report champion-led and explicitly referred creation separately. |
| Activation | Mature 14d cohort through account, team, first skill ≤24h, invite ≤72h, accepted ≤7d, and non-creator use ≤14d. |
| Retention | Rolling `AAT-28`; mutually exclusive new, retained, reactivated, and lost states across closed non-overlapping periods; period-1 retention after 56d maturity. |
| Referral | Eligible happy teams and explicitly attributed referral asks/copies/visits plus `referred_team_activated`. Report `organic_champion_replication` separately as correlation. |
| Revenue / sustainability | Latest monthly snapshot with `as_of`: current revenue state, cash coverage, fully loaded cost per current `AAT-28`, acquisition cost per new `AAT-28`, and explicit economic-demand signals. Revenue is `not monetized` until real money exists. |

Each row includes absolute count, denominator, window, comparison period, cohort maturity, `data_status`, confidence, owner, and open dependency. Never substitute a proxy for `unavailable` or `broken` data.

## Diagnostic module contracts

The modules are one-shot branches of this router, not separately scheduled loops. Each inherits the main cadence, QA, human checkpoint, one-open-diagnostic rule, state file, and stop conditions.

| Module | Skills and diagnostic body | Self-check | State keys | Output |
|---|---|---|---|---|
| Acquisition | `analytics`, `content-strategy`, `customer-research`, `prospecting`: inspect attribution and the selected source; scan public signals only when routed; compare starts and mature activations. | Qualification rule, internal/test exclusion, normalized source taxonomy, and attribution query exist; then require at least 100 qualified sessions across eight weeks for a source kill, or five mature team starts for the activation-quality check; downstream health gates pass before scaling. | Source/cohort diagnostic key, signal hashes, first/last seen, test status, 60d company/source cooldown. | One bounded channel/content test or `no action`; three activations justify another test, not scaling. |
| Activation | `analytics`, `onboarding`: classify signup, no-team, no-skill, no-invite, pending-invite, and no-non-creator-access stalls; verify product errors before proposing a nudge. | 14d cohort maturity, valid `team_id`, owner/admin eligibility, no open defect or active exposure cooldown. | Team ID, stalled step, last exposure, attempt count, 14d cooldown, activation timestamp; maximum two nudges. | One product fix or bounded in-product experiment. |
| Retention | `analytics`, `churn-prevention`, `customer-research`: compare closed periods and cohort-relative days 29–56; separate outage/event changes from normal low-frequency use; stage interviews before lifecycle sends. | 56d maturity, stable value-action proxy, no outage or semantic change, at least three lost teams or a repeated pattern. | Cohort/window key, lost/reactivated IDs, evidence status, last research action, 28d cooldown. | One cause hypothesis and research/intervention plan; no automatic win-back. |
| Referral | `analytics`, `referrals`, `customer-research`: distinguish organic champion replication from explicit referral attribution; inspect eligible happy moments and the referred team's mature activation. | Explicit referral source for attribution, healthy referring team, consent, 56d from the attributed visit, and 14 complete observation days after every attributed team creation before a negative activation conclusion; 60d ask cooldown. | Referring team ID, source/referral ID hash, eligibility timestamp, last ask, attempt count, 60d cooldown; maximum one ask per window. | One in-product ask or case-study draft for human approval. |
| Revenue / sustainability | `analytics`, `revops`, `pricing`: reconcile aggregate cash cost, agreed founder-time rate, GTM cash/time, and real cash support or revenue; never infer revenue from usage. | Complete month, explicit `as_of`, agreed cost cap/rate, valid non-zero denominator; otherwise `undefined`. | Monthly cost snapshot, quarterly decision, cost-cap status, open economic-demand evidence. | A decision memo only; route on cap breach or quarterly review, never by teams affected. |

## Autonomous-safe work

- Read repository, read-only analytics, aggregate infrastructure cost data, and permitted public sources.
- Verify, reconcile, calculate, diff, score, deduplicate, draft, and stage work.
- Implement one small, reversible, repository-scoped change after its gates pass; create a branch, run tests, commit, push, and open a draft PR.
- Create at most five qualified public signals when Acquisition is routed.
- Persist non-PII state in `.agents/loops/skillsboard-gtm-pulse.json` and append one run line to `.agents/loops/skillsboard-gtm-pulse.log`.

## Human-gated work

- Sending outreach, lifecycle email, or referral asks.
- Posting publicly, replying in a community, opening third-party issues, or publishing content.
- Marking a pulse-created PR ready, approving it, merging it, deploying it, or changing production configuration directly.
- Implementing changes to auth, authorization, billing, secrets, destructive database migrations, pricing, the free-forever promise, outbound communication, or spend without an explicit human decision.
- Spending money, moving budget, changing pricing, or changing the free-forever promise.
- Using testimonials, case studies, or personal data.

## Self-check

- Sensitive invitation and OAuth values are absent from events and loop state.
- Cross-user activation and retention queries group by `team_id`; a standard PostHog person funnel is invalid.
- Internal/test teams are excluded from every denominator.
- Activation cohorts have 14d maturity and first Retention cohorts have 56d maturity.
- `AAT-28` is rolling for the heartbeat. Closed-period states are mutually exclusive: `new` first activates now; `retained` is active now and previously; `reactivated` is active now, absent previously, and active earlier; `lost` was active previously and is absent now.
- Period-1 retention uses a value-action proxy during days 29–56 after `activation_at`, divided by activated teams with 56 complete observation days.
- Attribution applies first touch, last non-direct, referral override, and a 30d acquisition lookback only after the written contract and query exist; otherwise Acquisition is `unavailable`, not estimated.
- Invitation-driven signup is team expansion, not new-team Acquisition.
- Referral attribution requires an explicit referral source; organic champion replication remains a separate correlation.
- Explicit referral attribution overrides visitor/champion classification, so the three new-activation growth paths are mutually exclusive.
- Revenue is real money only; team or referral growth is never relabeled as Revenue. Cost metrics with a zero denominator are `undefined`.
- No concurrent experiment, active cooldown, unanswered decision, outage, or event-semantics change invalidates the recommendation.

## State and idempotency

State schema version 2 contains:

- `last_successful_run` and `period_key`;
- data-health results and metric snapshots;
- per-stage status for all five stages;
- at most one `open_diagnostic` and one `in_flight_experiment`;
- at most one `open_pull_request` with number, URL, branch, diagnostic key, and status;
- pending human decisions;
- handled public-signal hashes plus per-module attempts and cooldowns for Activation, Retention research, Referral, and Acquisition sources.

The diagnostic key is `stage + metric + cohort/window`; update it rather than creating a duplicate. Advance cursors only after a completed run. Store stable internal IDs or hashes, never raw PII, email addresses, team names, invite tokens, or OAuth values. A first run or state-schema change is a dry run without operational backfill.

## Stop and bail-out conditions

- Broken, stale, or privacy-unsafe tracking makes Tracking QA the only recommendation.
- Missing analytics access reports the dependency; it does not invent metrics or automatically default to Acquisition work.
- A missing artifact or any top-level state other than `status=ready` permits only a Tracking QA output; no stage is routed.
- Missing internal/test exclusion keeps quantitative conclusions report-only.
- No mature cohort, no qualified signal, no operational Acquisition contract, or no threshold breach means `no action`.
- No owner means no experiment.
- A dirty worktree, a checkout that is not the synchronized default branch, an overlapping PR, unrelated diff, secret exposure, or failed verification blocks edits, commit, push, and PR creation.
- Four runs without a human decision pause action modules; keep only a monthly heartbeat.
- Retire a module after six to eight unused outputs or repeated `acted=0` runs.
- Any uncertainty about consent, privacy, platform terms, spend, public voice, or business-model changes stops action and escalates to a human.

## Required digest

1. Data quality and blockers.
2. Five-row scorecard with `n`, denominator, window, maturity, and `data_status=available|unavailable|broken`.
3. `AAT-28` decomposition and `ΔAAT` when trustworthy.
4. The single routed constraint, or `no action`, with evidence and threshold.
5. One recommended action with owner, observation window, success check, and kill check.
6. When implementation qualified: branch, commit, draft PR URL, verification run, and revert check; otherwise the exact gate that prevented implementation.
7. Acquisition signals only when that module ran, at most five with source, score, reason, and dedupe status.
8. `checked`, `acted`, and a short non-PII run note.

## Kill switch

Pause or disable the `Skills Board GTM pulse` automation in Codex. Any future in-product lifecycle automation also requires its own environment-level disable flag before launch.
