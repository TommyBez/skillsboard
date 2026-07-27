# Pulse scheduler, work graph, state, and digest

**Node:** `pulse.scheduler`

This run-orchestrator node owns cadence, deterministic policy routing, the mutable work graph, fixed-point execution, WIP and interference, schema-v4 persistence, exact stop outcomes, and the run digest. Route executors do not load it or write shared state.

## Cadence and reviews

Run one Codex automation in `Europe/Rome` at 01:00, 05:00, 09:00, 13:00, 17:00, and 21:00 daily.

- Monday 09:00 is the complete strategic pulse: Tracking QA, five-stage scorecard, learning and opportunity review, portfolio review, pSEO research and learning, due feature review, and weekly queue-anchor refresh.
- Mark Monday 09:00 `completed` only after every mandatory strategic stage was attempted and state persisted; otherwise `failed`. If absent or incomplete, each later invocation resolves the `strategic` run type for exactly one catch-up attempt per run until every mandatory stage is complete. Persist an idempotent phase ledger so completed stages are not repeated; a failed or interrupted attempt remains eligible at the next invocation. Catch-up is not an operational run and does not create a second weekly constraint.
- Every other run is operational: reconcile providers and live state; monitor active experiments, rollouts, surveys, channels, budgets, sends, deployments, incidents, and PRs; apply eligible repair, pause, rollback, evaluation, review fix, merge after approval, deployment follow-up, and queued work. It may continuously replan independent lanes as defined below, but never performs a second full portfolio review.
- First Monday each month: review ICP, JTBD, and positioning.
- First Monday of January, April, July, and October: review business model and autonomy policy. Paid ads remain ineligible until a merged strategy change creates a revenue line.
- Every 28 days: review the complete user-perceivable feature inventory, separately from ICP review.
- Retention diagnosis is monthly until cohort volume supports trustworthy weekly comparison. Referral and sustainability remain monthly until inputs justify faster cadence.
- Problem-led pSEO research and learning review are due at least every seven days; deployed-page checkpoints stay T+3, T+7, T+14, and T+28.

Catch a never-run review once without inventing history. Missing sources disable only dependent fields or actions and produce `no_change_evidence_insufficient` where appropriate.

## Policy-node resolution

Resolve the run closure and each fresh route-executor closure separately, exactly as `SKILL.md` and `graph.json` specify. Each mutable work node carries `policy_nodes`, one `origin_policy_node`, and an exact `route_id`. Active resources, due reviews, and incidents preserve those IDs so monitoring does not depend on free-text inference. An item missing those IDs is not supported: reconcile it read-only, rebuild it deterministically from official readback under the current schema, and quarantine mutation until the rebuild succeeds. Never combine run and route selectors or keep accumulating route policy in the parent context.

## Fixed-point priority

At each iteration refresh dependencies and select the highest-priority compatible `actionable_now` item:

1. SEV0/SEV1 containment, spend or send cap breach, privacy/security exposure, and rollback;
2. mandatory monitoring of live exposure, surveys, messages, posts, spend, deployments, and PR lifecycle;
3. tracking, attribution, provider-control, consent, suppression, and state repairs;
4. due evaluations, maturity decisions, stabilization, pruning, and retirements;
5. ready queue items in current order;
6. due protected pSEO research, learning, and checkpoints in its independent lane;
7. automatable provider setup and shadow-readiness work;
8. evidence gathering and eligible bounded continuous-replan transitions in independent lanes.

Never let new growth work delay protection. After every external transition, persist state, reconcile the effect, and recalculate the graph before selecting again.

## Work graph and statuses

Each work node has `work_id`, `resource_key`, `definition_hash`, `contract_root`, `lane`, `priority`, exactly one `origin_policy_node`, `policy_nodes`, `route_id`, `depends_on`, `interference_keys`, `risk`, `state`, `next_eligible_at`, `attempts`, and exact reason. Contract reconciliation refreshes the route plan mechanically; a root mismatch quarantines mutation until refreshed. Immediately re-evaluate historical `switch_disabled` work under the switchless route.

Valid states:

- `actionable_now`: every current gate and dependency passes;
- `waiting_dependency`: a named graph or external dependency is incomplete;
- `waiting_maturity`: a preregistered window or independent-unit floor is incomplete;
- `waiting_cooldown`: recorded cooldown has not elapsed;
- `waiting_pr_approval`: only the independent PR checkpoint remains;
- `suspended`: material evidence invalidated a frozen assumption; store evidence hash, time, exact reason, and deterministic resumption predicate;
- `setup_required`: irreducibly human account, OAuth, credential, DNS, identity, or provider prerequisite;
- `manual_action`: execution is otherwise eligible but the exact operation is unavailable or human-only;
- `unavailable`: a mandatory trustworthy read or capability is absent;
- `quarantined`: ownership, identity, state, or effect is ambiguous;
- `policy_ineligible`: the contract forbids it;
- `complete`, `retired`, or `cancelled`.

`manual_action` never bypasses policy, consent, evidence, caps, safety, or quality. Before claim it is a soft hold containing only immutable intent, dedupe key, expected capacity, and expiry; it consumes no slot, budget, send allowance, or cooldown. Human claim atomically performs just-in-time official readback and reserves the exact hard capacity. Before an autonomous alternative may proceed, official readback must prove no human effect and the soft hold must be invalidated. Completion still requires official readback or an explicit result URL/ID.

## Rolling queue, risk-weighted WIP, and interference

The strategic pulse establishes the ranked weekly queue anchor with a canonical `definition_hash`. Each entry preserves evidence, expected outcome, dependencies, risk, lane, caps, route, policy nodes, and interference keys. Operational runs execute compatible ready entries in order. Material new evidence moves an entry to `suspended`; live exposure must still be paused or contained and retains its capacity.

When a lane reaches local exhaustion with no compatible actionable queue item and free WIP, an operational run may perform another `operational_replan` for that lane. It resolves `learning.opportunities`, records the exact lane exhaustion predicate and prior queue hash, and appends at most one pending candidate for the same lane/resource. A later candidate in that lane is eligible only after the prior one transitions or becomes blocked; blocked lanes never stall independent lanes. Low-risk reversible work may execute normally. Medium/high-risk candidates may be researched, prototyped, prepared as a PR, or kept in private shadow, but cannot gain exposure, adoption, or durable strategy effect without their normal gates. Replanning cannot change ICP, JTBD, positioning, business model, durable policy, or the Monday portfolio anchor. Critical repair and containment bypass the queue.

Independent lanes proceed in parallel when locks and measurement do not overlap. The parent reserves every selected work item and its worst-case capacity in one atomic state transition before dispatch. Fresh executors may run in parallel only for a compatible reserved batch; they never write the shared state file. The parent validates results, persists them serially, and recomputes the graph before another batch:

- general repository WIP has a hard budget of six units and an absolute maximum of six open general Product/Growth PRs: low risk consumes one unit, medium risk two, and high risk three; at most one high-risk general PR may be open;
- at most three open pSEO PRs for materially distinct problem clusters in a rolling seven-day window, never consuming a general slot and with at most two pages per PR;
- concurrently exposed product/CRO work has a hard budget of six units: low risk consumes one, medium risk two, and high risk six;
- at most two live surveys with non-overlapping cohorts; an experiment-treatment survey consumes both slots;
- at most four indexable experimental pSEO pages without a completed T+14 checkpoint by default, or eight only while every earlier live cluster has passed T+3 technical health.

A survey also consumes the exposure units of its risk class; an experiment-treatment survey consumes its experiment exposure once, not twice. WIP units are hard caps, not targets. Reconciliation derives units deterministically from each existing item's frozen risk class before selecting new work. A verified critical repair may exceed the general repository budget only by the smallest units needed to remove active harm or restore an exact merged invariant; it never consumes the pSEO slot. Private research and non-exposed prototypes do not consume WIP units but remain bounded by runtime, spend, evidence, and data safety.

`resource_key = provider + resource_type + scope + logical_key`. Only that exact key is a hard ownership lock. Every intervention also declares `interference_keys` and enters the unified `intervention_registry` as `treatment`, `orthogonal`, or `contaminant` for each affected metric and cohort. Users or teams may join multiple non-conflicting experiments; there is no blanket one-experiment rule. Team experiments assign and analyze consistently by `team_id`.

If an intervention can change a primary metric, acquisition composition, eligibility, exposure, communication, attribution, or interpretation during another window, classify and handle it prospectively. Never relabel contamination as orthogonal after the result.

## Operational loop

After the contract pin passes:

1. use the Codex-native run identity; never create a custom global lease, TTL heartbeat, watchdog, or fencing system;
2. resolve and read only the deterministic run closure and its required skills, obtaining the exact state-view pointers;
3. load the schema-v4 index and only those graph-resolved views; reconcile incomplete atomic transitions and quarantine only corrupt or ambiguous resources;
4. reconcile GitHub/default branch, Vercel production, configured providers, operation readiness, suppressions, caps, reservations, and live external effects;
5. discover PostHog capabilities, verify project `225645` through the selected bounded operation context, reconcile canonical assets, and run due Tracking QA;
6. monitor every active item by its recorded route and policy IDs through a fresh isolated executor, prioritizing mandatory containment;
7. in a scheduled or catch-up `strategic` run, advance at most one catch-up attempt across the idempotent strategic phase ledger, completing every remaining mandatory stage before marking the occurrence complete; otherwise load `learning.opportunities` for evidence reconciliation and eligible per-lane operational replans;
8. refresh the work graph, atomically reserve a compatible item or batch, and dispatch one-transition route executors with immutable minimal-data envelopes; deliver necessary PII/private recipients directly to the exact executor and untrusted private content only to its nested no-tools processor;
9. validate official readback, persist each result serially after every external transition or meaningful attempted outcome, then return to reconciliation or selection;
10. stop only at fixed point and append exactly one minimal run line.

Protective monitoring continues when a strategic source is unavailable. Missing configuration affects only its operation and never triggers routine approval.

## Schema-v4 persistence

The parent alone persists non-PII state at `.agents/loops/skillsboard-gtm-pulse.json`; route executors return results and never edit it. It intentionally has no global lease, lease TTL, heartbeat, watchdog, or fencing owner. Write through a same-directory temporary file and atomic rename. Advance a cursor only after its transition completes. Persist a reservation before dispatch so a lost child or provider response remains recoverable. If persistence would dirty tracked checkout content, keep external actions read-only and record the exact safe-persistence failure.

State contains only the projections needed to reconcile. It also maintains a compact non-PII `/digest` projection assembled by the parent from the index, aggregate ledgers, official readback, and validated route results; this lets the run emit every required unchanged and changed field without loading full domain histories:

- schema and pinned contract version/root, run identity, last completion, termination, strategic catch-up phase ledger, and review ledger;
- work graph, policy/route IDs, dependencies, queue anchor/current hashes, per-lane operational-replan ledger, suspensions, counts, risk-unit reservations, and next eligibility;
- intervention registry, resource locks, interference, assignment units, exposure, and cooldowns;
- operation readiness, setup requirements, manual soft holds and claimed packages, identity/readback, ownership, quarantine, and tuple-scoped retries with global circuit-breaker state;
- PostHog logical keys/versions, canonical pointers, definition hashes, opaque live IDs, lifecycle, measurement health, and result grades;
- scorecard snapshots, data health, opportunity stages, deterministic Issue references, and evidence hashes;
- feature inventory, class citations, baseline/version lineage, windows, decisions, stabilization, and pruning;
- pSEO cadence/backlog, cluster/intent IDs, rolling PR budget, page hypotheses, deploy refs, measurement, and all checkpoint timestamps;
- PR resource/branch/URL, approval, checks, threads, mergeability, merge, production SHA, verification, and rollback;
- aggregate social/community/email/survey attention, reservations, opaque consent/suppression, inbound polling cursor and dedupe IDs, delivery ambiguity, and cooldowns;
- metered and shared-quota aggregates, incidents, handled hashes, and non-PII recovery reasons.

Build every `definition_hash` as lower-case SHA-256 over recursively sorted-key canonical JSON with no volatile fields. Persist an opaque live ID immediately after creation. Recover a lost create only from exactly one deterministic-name and complete-definition match; otherwise quarantine. Use stable internal IDs, keyed hashes, aggregates, and opaque references, never raw PII.

Append exactly one minimal non-PII line per run to `.agents/loops/skillsboard-gtm-pulse.log`; detailed transitions live in state and the digest. State/log changes belonging to an active repository item follow that PR's resource lock. Runtime persistence must remain atomic and must never overwrite tracked repository content or unrelated local work.

## Exact outcomes

- repository identity or default-branch readback failure: dependent repository lifecycle `unavailable`; continue independent lanes;
- contract version/root mismatch: `no_action: contract_pin_mismatch`;
- PostHog project/control failure: contain dependent exposure and continue independent lanes;
- missing mandatory read: affected action `unavailable`, with no proxy;
- missing fresh isolated executor: affected mutation `unavailable: isolated_executor_unavailable`; continue safe parent reconciliation and independent lanes;
- broken, stale, or privacy-unsafe product instrumentation: `measurement_failure`, one eligible repair per distinct verified root-cause/definition tuple under the circuit breaker, never a value decision; extra authorized provider metadata is not measurement failure;
- missing mature cohort, denominator, evidence threshold, consent, destination eligibility, cap, or containment: exact affected-resource `no_action`;
- same resource or contaminating intervention: retain the existing lock and monitor;
- open PR: continue its lifecycle and every independent lane;
- guardrail, privacy, send/spend, or deployment regression: pause, roll back, or contain immediately;
- no compatible ready item: `fixed_point_no_action`;
- runtime ending with compatible ready work: `interrupted_with_runnable_work`.

## Required digest

Every run emits one self-contained digest with:

1. contract version/root, resolved policy nodes, bootstrap mode, and repository identity/commit when a repository lifecycle is selected;
2. official PostHog plugin/project/canonical IDs, Tracking QA, unavailable or broken fields, and repairs;
3. on strategic runs, all five scorecard rows with counts, denominators, windows, maturity, comparison, status, confidence, trustworthy `AAT-28`, decomposition, and `delta_AAT`;
4. due/completed monthly, quarterly, 28-day feature, evidence, portfolio, and pSEO reviews;
5. routed constraint and queue anchor/current hashes when strategic, otherwise the queue, evidence-based suspensions, and every bounded per-lane operational replan with its exhaustion predicate;
6. each transition, evidence grade and mature decision, or exact `no_action`;
7. work totals by status, repository/exposure risk units, survey/pSEO caps, interference, remaining runnable work, and fixed-point outcome;
8. active flags, experiments, surveys, rollouts, feature stabilization/pruning, and next transition;
9. pSEO sources, checked/shortlisted counts, backlog, active pages, missing checkpoints, rolling PR budget, and next T+3/7/14/28/56 checkpoint;
10. aggregate social/community/send/attention counters, reservations, cooldowns, suppressions, inbound outcomes, and deduplicated sanitized `reply_needed` items;
11. metered and finite shared-quota ledgers with source/as-of, limit, actuals, forecast, reserve, confirmed/reserved/ambiguous use, candidate worst case, and remaining capacity;
12. operation readiness, completed setup, new or unchanged setup requirements, unavailable/quarantined work, and manual packages;
13. every PR's resource key, URL, lane, approval, checks, threads, mergeability, merge, production SHA/status, local verification, and monitoring;
14. incidents, containment, notification state, `checked`, `acted`, and minimal non-PII result.

Do not repeat unchanged setup notifications, omit a material unavailable dependency, or expose secrets, PII, raw comments, or untrusted content.
