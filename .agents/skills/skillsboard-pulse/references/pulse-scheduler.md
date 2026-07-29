# Pulse scheduler, action loop, state, and digest

**Node:** `pulse.scheduler`

This node owns cadence, deterministic routing, schema-v4 persistence, continuous action selection, and the run digest.

## Cadence

Run at 01:00, 05:00, 09:00, 13:00, 17:00, and 21:00 Europe/Rome. Monday 09:00 is the complete strategic review. Every other run is operational and may still research, create, publish, send, configure, and open or update PRs.

The strategic run refreshes Tracking QA, the five scorecard rows, the +20% weekly `AAT-28` objective, audience-led search, community/social evidence, product opportunities, and candidate contribution hypotheses. Operational runs use the same governing objective. Missing sources or immature outcomes are observations only and never make the candidate set empty.

## Action selection

After legal/spend reconciliation:

1. contain an active legal, privacy, authorization, binding-platform, or uncontrolled-spend incident;
2. finish a previously issued effect whose duplicate or charge status is ambiguous;
3. compute the gap to the governing `AAT-28` objective and freeze a finite snapshot that enumerates every distinct current candidate across SEO, community, social, product, analytics, email, repository, and campaign families, including families with an empty persisted queue;
4. classify as positive every candidate that is lawful, authorized, within hard spend limits, physically available, non-duplicative, and has a truthful plausibly positive marginal contribution path to the objective;
5. validate canonical candidate identities and directed prerequisites, then normalize conflicts among prerequisite-ready candidates and select the deterministic maximal compatible set defined below;
6. execute the first selected candidate, then re-resolve and build a fresh full-family snapshot after every completed or blocked effect;
7. repeat until runtime ends or a fresh full-family snapshot proves the fixed point below.

Near-zero marginal cost makes the positive candidate set exhaustive: completing the first action or observing the first signal never discharges the objective. A blocker belongs only to its exact effect; persist it, retain every other positive candidate, and continue independent families.

The repository-pinned `launch.campaign` is one candidate family. Resolve `strategy.launch` and keep its dated deliverables available for evaluation. Deadline and dependency information affect time to effect and urgency, while expected contribution to `AAT-28` determines value; launch work has no automatic precedence over SEO, social, or another positive candidate. Earlier publications do not become the coordinated launch retroactively, and campaign identity remains distinct from its supporting distribution.

SEO, community, and social remain independent candidate families, not per-run output quotas. An empty prior queue triggers synthesis. Missing metrics, keyword volume, attribution, provider diagnostics, or prior queue items change confidence or create instrumentation candidates; they never prove a family inactionable.

### Finite snapshot and deterministic conflict resolution

At each synthesis point, freeze one finite `snapshot_id` after reconciliation. Every applicable family must emit a finite explicit candidate list plus a `family_enumerated` marker, including an explicit empty list. The bounded universe is the set of concrete atomic actions describable from the current verified product, evidence, provider capabilities, repository, and due campaign inventory at that synthesis point; hypothetical future discoveries are not candidates until a later snapshot.

Every candidate records `candidate_id`, `snapshot_id`, origin policy node, route and operations, exact effect key, objective contribution path, interference keys, a rank tuple, sorted unique `prerequisite_candidate_ids`, and sorted explicit conflicting candidate IDs with reasons.

Derive `candidate_id` before ranking, prerequisite resolution, conflict normalization, or snapshot assignment. Its canonical identity tuple is exactly `origin_policy_node`, `route_id`, and `exact_effect_key`, each a non-empty canonical non-PII ASCII string. Encode each component independently as lowercase hexadecimal UTF-8 bytes and join them as `candidate.v1.<origin_hex>.<route_hex>.<effect_hex>`. This injective ASCII encoding uses no allocation order, counter, timestamp, hash, or `snapshot_id`. Rank, evidence, route-resolved operations, prerequisite and conflict edges, interference keys, provider status, and disposition do not change identity. A material change to the target, transition, or payload must change the exact effect key.

Recompute the ID in every fresh snapshot. Reuse a persisted ID only when its identity tuple and freshly derived ID match byte for byte. Coalesce multiple emissions of the same tuple before ranking only when their canonical non-identity fields are also byte-identical after object keys and set-like fields are sorted; exclude only `snapshot_id` and persisted bookkeeping from that comparison. Any difference in rank, evidence, route-resolved operations, prerequisites, conflicts, interference keys, or proposed disposition makes the duplicate set inconsistent and invalidates the snapshot. Different tuples may never share one ID. A mismatched persisted ID or one ID associated with different tuples also invalidates the snapshot: preserve factual history, rebuild from family outputs, and do not select from or prove a fixed point with that snapshot. Never keep the first emission, merge divergent fields, or repair identity with encounter-order suffixes or counters.

Prerequisites are directed all-of edges and are never copied into the symmetric conflict graph. Each prerequisite ID must resolve to a distinct candidate in the snapshot or to a persisted `complete` record with the same recomputed ID and exact effect key. A candidate is prerequisite-ready only when every prerequisite is complete. Otherwise assign the snapshot-only disposition `prerequisite_pending:<sorted_candidate_ids>` and exclude it before ranking. This is not the persisted work state `waiting_dependency`. A self-edge, cycle, unknown reference, or ambiguous reference invalidates the snapshot and cannot prove a fixed point. Rebuild after every prerequisite completion or blocker. A closed-set blocker on a prerequisite never satisfies or deletes the edge: record that blocker only on the prerequisite and keep the dependent excluded until completion. Resynthesis may remove an edge only when new facts prove the action never had a true execution dependency, not merely because its prerequisite blocked.

Only prerequisite-ready candidates enter conflict resolution. Normalize every explicit conflict edge symmetrically before selection. Shared operation interference keys serialize execution but do not exclude either candidate unless the candidate records also contain an explicit effect conflict.

Use one deterministic greedy maximal-set algorithm. Sort positive candidates by: expected marginal contribution ordinal descending; urgency or time-to-effect ordinal descending; confidence or information-gain ordinal descending; runtime-cost minutes ascending; then `candidate_id` by raw ASCII ascending. Each ordinal is an integer from 0 through 4 recorded with its evidence or hypothesis. Iterate once in that order and select a candidate when it has no normalized conflict edge with an already selected candidate.

A positive candidate skipped because of a selected conflict receives the snapshot-terminal disposition `conflict_loser:<winner_candidate_id>`. This is not global retirement. Execute only the first selected action, then rebuild the snapshot: if its winner blocks or otherwise remains incomplete, the losing candidate is eligible for selection again. A completed winner may turn the loser into an exact duplicate or superseded action; record that new factual disposition instead of carrying the old conflict result forward. Every prerequisite, conflict, duplicate, and `conflict_loser` reference must resolve to exactly one canonical candidate ID in that snapshot, except a prerequisite may resolve to one matching persisted completion. Snapshot dispositions are rebuilt rather than copied forward. Every candidate in a frozen snapshot therefore has a selected, `prerequisite_pending`, closed-set blocker, duplicate/superseded, completed/retired/cancelled, or `conflict_loser` disposition.

`fixed_point_complete` requires a fresh valid snapshot in which every applicable family has `family_enumerated=true`, there is no selected or otherwise actionable candidate, there is no `prerequisite_pending` candidate tied to a selected, actionable, ambiguous, or otherwise re-evaluable prerequisite in the current run, there is no `conflict_loser` tied to an incomplete winner, and there is no ambiguous issued effect awaiting reconciliation. A dependent may remain excluded behind a prerequisite with a closed-set blocker, but the digest must retain both the directed edge and that prerequisite's exact blocker. Runtime ending with any selected candidate, re-evaluable prerequisite, or re-evaluable conflict loser is `interrupted_with_runnable_work`.

There is no repository WIP budget, pSEO PR/page quota, exposure-unit budget, survey slot limit, editorial cap, internal cooldown, experiment-series limit, one-candidate rule, shadow-readiness stage, maturity wait, or queue-freeze state.

## Work states

Use only:

- `actionable_now`;
- `legal_or_consent`;
- `authority_or_identity`;
- `spend_or_overage`;
- `waiting_pr_approval` for the immediate merge transition only;
- `unavailable` for physical target/provider absence;
- `ambiguous` only after a request may have been issued and duplicate/charge status is unknown;
- `complete`, `retired`, or `cancelled`.

Do not persist `waiting_maturity`, `waiting_cooldown`, `waiting_dependency`, `manual_action`, `setup_required`, `shadow`, WIP reservations, editorial reservations, or evidence-insufficient queue states. An unavailable operation does not become a strategic approval request; select another action.

## v13 contract-root normalization

On the first run with the v13 root, after pin verification and before action selection, atomically normalize existing schema-v4 state. This is a root migration, not an activation, readiness, or approval phase.

- Preserve `complete`, `retired`, `cancelled`, issued-effect ambiguity, money reservations, and recipient-delivery reservations when they remain factually valid.
- Reclassify `setup_required` from a specialist as `authority_or_identity`; reclassify a provider-enforced human-only operation as the applicable legal/consent, authority, spend, or physical-unavailability state.
- Treat provider-native `shadow` as inert draft metadata only. Reclassify Pulse work in `waiting_maturity`, `waiting_cooldown`, `waiting_dependency`, `manual_action`, `shadow`, or an evidence-insufficient state as `actionable_now` unless its concrete cause maps to another closed-set state.
- Release never-issued WIP, editorial, attention, and cooldown reservations; retain only money or recipient-delivery reservations that prevent a duplicate or charge.
- Rebuild work indexes from the normalized items and record source root, target root, completion time, and released reservation counts. Never retain an old status merely because its cause is absent.

## v17 objective-root normalization

On the first run with the v17 root, after pin verification and before action selection, atomically normalize existing schema-v4 state. This is a root migration, not an activation, readiness, reconciliation-only, or approval phase.

- Preserve factual historical run outcomes, completed/retired/cancelled work, issued-effect ambiguity, valid money or recipient-delivery reservations, provider IDs, and measurement observations.
- Set the governing objective to at least +20% week-over-week `AAT-28`; retain `team_activated_14d` as a leading contribution and not as the governing objective.
- Treat a prior `fixed_point_complete`, empty `actionable_now` index, empty lane output, or first blocked item as historical observations only, never as current proof of exhaustion.
- Rebuild current candidate and work indexes by synthesizing every applicable family exposed by the verified operational closure, including SEO and social, and route each blocker only to its exact effect.
- Record source root, target root, completion time, previous objective, new objective, and rebuilt candidate counts. Do not rewrite historical digest claims; supersede their current planning effect with the normalized state.

## v18 conflict-root normalization

On the first run with the v18 root, after pin verification and before action selection, atomically normalize existing schema-v4 state. This is a root migration, not an activation, readiness, reconciliation-only, or approval phase.

- Preserve factual effects, blockers, provider IDs, reservations, and historical outcomes.
- Add a fresh `snapshot_id`, recompute canonical candidate IDs from their identity tuples, add directed prerequisite edges separately from normalized symmetric conflict edges, and add family enumeration markers, rank tuples, interference keys, and the dispositions defined above to current planning state.
- Do not promote legacy item keys or unverified persisted IDs into the current snapshot.
- Treat every earlier compatibility label, prerequisite result, conflict loser, or fixed-point result as historical only; rebuild the complete current snapshot before selecting work.
- Record source root, target root, completion time, candidate count, prerequisite count, normalized conflict count, and family enumeration count.

## Routing and execution

Resolve the run once and each action route separately. Keep one origin policy node and an empty switch closure. The parent directly executes the routed action and is the sole writer of shared state.

Use sealed provider delivery, an isolated executor, or a nested no-tools processor only where legally necessary to protect PII, private recipients, private content, secrets, or metered credentials. Never route protected material through the parent when sealed handling is required. If every safe sealed path is absent, mark only the affected action `unavailable` and continue other work. Sealed-path availability is not a condition for public no-cost, repository, analytics, or organic work that contains no protected material.

Persist a reservation only for money or recipient-bearing delivery that could be double-consumed. Release a never-issued reservation immediately. Reconcile an issued ambiguous effect by official opaque ID before retrying.

## Repository lifecycle

Branches, commits, pushes, PR creation, review fixes, and production follow-up are autonomous. The owner approval is required immediately before merge and is the only human checkpoint. Platform-enforced merge conditions are reported as physical provider constraints, not additional Pulse policy gates.

## Persistence

The parent atomically writes `.agents/loops/skillsboard-gtm-pulse.json` and appends exactly one non-PII line to `.agents/loops/skillsboard-gtm-pulse.log` per run. State stores contract/run identity, governing objective and measured gap, candidate contribution hypotheses and compatibility, action list, provider identities, minimal ownership/deduplication references, money and recipient-delivery ledgers, consent/suppression projections, public/repository IDs, legal/spend incidents, PR merge approval, and measurement results.

Do not store raw PII, private content, credentials, untrusted instructions, or internal gate structures removed by v13.

## Exact outcomes

- contract pins fail: exact whole-run pin no-action;
- law/consent/privacy/binding terms fail: affected action `legal_or_consent`;
- account/recipient/repository authority fails: affected action `authority_or_identity`;
- spend or hard non-overage boundary fails: affected action `spend_or_overage`;
- PR lacks owner approval: merge transition `waiting_pr_approval` while all other work continues;
- exact target or official operation is physically absent: affected action `unavailable`;
- any positive compatible candidate remains when runtime ends: `interrupted_with_runnable_work`;
- a fresh fully enumerated snapshot satisfies the deterministic empty fixed-point proof above: `fixed_point_complete`.

## Required digest

Emit contract version/root, resolved nodes, bootstrap proof, provider/repository identities, governing objective and measured gap, candidate contribution hypotheses, actions completed, public/repository/provider effects, spend, consent/suppression and legal state, ambiguous issued effects, PRs awaiting owner merge approval, physical unavailability, SEO/community/social outputs, scorecard observations, remaining positive candidates, and a reproducible SHA-256. Do not report removed WIP, cooldown, maturity, shadow, activation-phase, or editorial-cap fields.
