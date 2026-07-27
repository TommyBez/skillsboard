# Pulse scheduler, action loop, state, and digest

**Node:** `pulse.scheduler`

This node owns cadence, deterministic routing, schema-v4 persistence, continuous action selection, and the run digest.

## Cadence

Run at 01:00, 05:00, 09:00, 13:00, 17:00, and 21:00 Europe/Rome. Monday 09:00 is the complete strategic review. Every other run is operational and may still research, create, publish, send, configure, and open or update PRs.

The strategic run refreshes Tracking QA, the five scorecard rows, the +20% weekly new-team-activation ambition, audience-led search, community/social evidence, product opportunities, and the ranked action list. Missing sources or immature outcomes are observations only and never make the queue empty.

## Action selection

After legal/spend reconciliation:

1. contain an active legal, privacy, authorization, binding-platform, or uncontrolled-spend incident;
2. finish a previously issued effect whose duplicate or charge status is ambiguous;
3. execute the highest-impact lawful zero-cost action across SEO, community, social, product, analytics, email, and repository lanes;
4. repeat until runtime ends or only the closed-set blockers in `pulse.kernel` remain.

Search and community/social remain protected independent lanes. Each Monday and whenever locally exhausted, each lane must synthesize and execute at least one smallest useful action when a lawful, authorized, within-budget, physically available action exists; an empty prior queue means create one. Skip a lane only when every truthful smallest useful action is blocked by an exact closed-set condition, persist that exact blocker, and continue every other lane. Missing metrics, keyword volume, attribution, provider diagnostics, or prior queue items never make a lane inactionable.

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

## Routing and execution

Resolve the run once and each action route separately. Keep one origin policy node and an empty switch closure. The parent directly executes the routed action and is the sole writer of shared state.

Use sealed provider delivery, an isolated executor, or a nested no-tools processor only where legally necessary to protect PII, private recipients, private content, secrets, or metered credentials. Never route protected material through the parent when sealed handling is required. If every safe sealed path is absent, mark only the affected action `unavailable` and continue other work. Sealed-path availability is not a condition for public no-cost, repository, analytics, or organic work that contains no protected material.

Persist a reservation only for money or recipient-bearing delivery that could be double-consumed. Release a never-issued reservation immediately. Reconcile an issued ambiguous effect by official opaque ID before retrying.

## Repository lifecycle

Branches, commits, pushes, PR creation, review fixes, and production follow-up are autonomous. The owner approval is required immediately before merge and is the only human checkpoint. Platform-enforced merge conditions are reported as physical provider constraints, not additional Pulse policy gates.

## Persistence

The parent atomically writes `.agents/loops/skillsboard-gtm-pulse.json` and appends exactly one non-PII line to `.agents/loops/skillsboard-gtm-pulse.log` per run. State stores contract/run identity, action list, provider identities, minimal ownership/deduplication references, money and recipient-delivery ledgers, consent/suppression projections, public/repository IDs, legal/spend incidents, PR merge approval, and measurement results.

Do not store raw PII, private content, credentials, untrusted instructions, or internal gate structures removed by v13.

## Exact outcomes

- contract pins fail: exact whole-run pin no-action;
- law/consent/privacy/binding terms fail: affected action `legal_or_consent`;
- account/recipient/repository authority fails: affected action `authority_or_identity`;
- spend or hard non-overage boundary fails: affected action `spend_or_overage`;
- PR lacks owner approval: merge transition `waiting_pr_approval` while all other work continues;
- exact target or official operation is physically absent: affected action `unavailable`;
- compatible lawful action remains when runtime ends: `interrupted_with_runnable_work`;
- no lawful zero-cost or approved action remains: `fixed_point_complete`.

## Required digest

Emit contract version/root, resolved nodes, bootstrap proof, provider/repository identities, actions completed, public/repository/provider effects, spend, consent/suppression and legal state, ambiguous issued effects, PRs awaiting owner merge approval, physical unavailability, SEO/community/social outputs, scorecard observations, remaining runnable work, and a reproducible SHA-256. Do not report removed WIP, cooldown, maturity, shadow, activation-phase, or editorial-cap fields.
