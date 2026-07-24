# Product experiments, surveys, referral, and feature lifecycle

**Node:** `product.lifecycle`

Load for any active, candidate, or due product/CRO experiment, rollout, structured survey, referral intervention, feature baseline, stabilization, or pruning decision. It depends on `analytics.control_plane`, `communications.attention`, and `learning.opportunities`; add `analytics.scorecard` when the decision uses a funnel metric.

## Preregistration and assignment

Before exposure, freeze a canonical definition and `definition_hash` containing hypothesis, opportunity evidence/stage, cohort, assignment unit, primary metric, threshold, MDE where applicable, minimum mature independent units, enrollment and maturity windows, guardrails, rollback, result rule, risk class, dependencies, resource key, and interference keys. A substantive change after exposure closes the old version and creates a new one.

Team Activation and Retention interventions assign and analyze consistently by `team_id`. Multiple experiments may overlap only when prospectively classified non-interfering under `pulse.scheduler`. Before a flag-backed launch, `analytics.control_plane` must prove the deployed production SHA consumes the exact flag; otherwise route the repository PR and keep exposure at zero.

## Rollout and maturity

The default rollout has two meaningful stages: a bounded evidence-sized cohort or canary, then 100% only after the adoption gate. Add an intermediate 50% stage only when baseline, assignment unit, MDE, power, and maximum window prove that a 50/50 comparison yields meaningful samples. Ceremonial five-step ladders are prohibited. Underpowered work uses bounded absolute outcomes and corroborating evidence, not false precision.

Preregister separate `enrollment_window` and `maturity_window`. One unchanged extension is eligible only when measurement is healthy, the result is non-decisive, and either the independent-unit floor is unmet or the estimate still crosses the success threshold. It adds exactly one enrollment window and cannot change treatment, cohort, unit, metric, threshold, risk, or rule. Absolute deadline: `2 * enrollment_window + maturity_window`; then adopt or retire and release the slot.

Roll back immediately on a kill threshold, guardrail regression, privacy/safety issue, cap breach, invalid exposure, or broken measurement requiring pause. Remove exposure before ending measurement. An adopted flag-backed change enters stabilization, cleanup, and pruning concurrently at `adopted_at`. Stabilization may reuse observations only when that shared window was prospectively frozen and stayed healthy; regression triggers rollback/containment. Remove the flag only after full stabilization and production verification.

## Risk classes

- **Low risk:** reversible copy, layout, discovery, onboarding, or communication change without destructive data, rights, default-path, or contract effect. Mature healthy directional evidence may support adoption when every threshold, unit floor, and guardrail passes.
- **Medium risk:** default-path/behavior change, non-destructive data handling, or user communication. It needs at least an emerging pattern to start; adoption requires a behaviorally corroborated validated problem or causal evidence.
- **High risk:** authentication, authorization, deletion, migration, privacy, security, legal/economic commitments, or the core product contract.

A high-risk protective repair may only restore an exact merged invariant or contain a verified incident. Use the smallest correction, risk-specific automated verification, rollback/containment, and independent PR approval. It cannot introduce a new commitment.

Net-new high-risk work requires a validated problem, behavioral value criteria, safe bounded reversible exposure where ethical, and:

- auth/authz: positive and negative access matrix plus cross-team isolation;
- deletion/migration: idempotent rehearsal, integrity checks, and verified recovery;
- privacy/security: threat model and targeted tests;
- core product/legal/economic contract: independently approved strategy-change PR; never infer law autonomously.

Adoption requires causal evidence or mature behaviorally corroborated value plus every risk gate. If safe exposure or verification is impossible, research, prototype, and prepare only.

## Structured surveys

Use PostHog Surveys for single-choice, multiple-choice, rating, or binary questions. Open text stays disabled until the official plugin advertises a safe provider-side summary/read satisfying the data policy. Never distribute questions across an email thread; use one complete instrument. Email may only invite an eligible user to that survey.

A PostHog survey and a longer questionnaire differ only in depth. Map every survey to one deterministic opportunity or decision and choose the shortest instrument that resolves its preregistered question. Target an authenticated deterministic relevant cohort after a relevant action; keep it non-blocking and dismissible; suppress it on authentication, error, and critical-action surfaces; and provide one global in-product research opt-out.

- At most two live surveys with non-overlapping cohorts; a survey treatment also consumes an experiment slot.
- At most three questions or about 60 seconds.
- There is no minimum survey launch quota.
- At most one new survey per user per 14 days.
- Answer or dismissal permanently suppresses that survey and starts a 30-day global research cooldown.
- One ignored survey may reappear once after at least 14 days, then is permanently suppressed.
- Exact exposure and denominator measurement are mandatory; broken tracking pauses it as `measurement_failure`.

In-app surveys do not require `product_communications`, but they remain subject to `communications.attention`. Do not create a separate follow-up-contact authorization, adaptive email thread, or `qualitative_followup` flow. Email invitation separately requires `email.outbound` eligibility and consent.

## Referral intervention

Same-team invitations remain user-triggered transactionals. New-team referral is a separate flag-backed intervention only after a genuine healthy value moment and is independent of sentiment.

- One in-app prompt per eligible user per 30 days; no initial email.
- At most one later consented email per 90 days under `email.outbound`.
- Sharing is user-initiated opaque-link copy or native share only. Tokens reveal no internal identity. No payment, credit, reward, giveaway, gated capability, leaderboard, auto-send, address-book access, DM, or social publication.
- First valid attribution lasts 30 days and cannot be overwritten. Exclude self, same-team, internal/test, and anomalous attribution.
- Run 28 days plus at most one unchanged 28-day extension.

The primary outcome is a distinct referred team reaching activation, followed by `AAT-28`. One activation proves feasibility; three independent activations are promising, not automatic scale. At least 30 exposures with zero shares is `no_trigger_fit`; at least ten visits with zero activated teams is `no_activation_value`; below both floors after the extension is `insufficient_sample` and closes the intervention. Dismissal, complaint, abuse, anomalous attribution, and harm to core activation are guardrails that pause or roll back.

## User-perceivable capability inventory

Inventory capabilities, not components, buttons, or routes. Each stable `feature_key` records JTBD, surfaces, eligible units, dependencies, attention, maintenance and operational cost, class, frequency, and evidence lineage.

- Class: `core|rights_safety|supporting|experimental`.
- Frequency: `frequent|episodic|contingency`.
- Without a prospective baseline, lifecycle is `unbaselined`, never implicit keep.

Historical verified analytics are descriptive. Before the clock starts, freeze events, unit, meaningful-use definition, continued-value criterion, observation windows, floor, guardrails, risk, and class citation. The clock starts only when measurement is healthy; missing instrumentation is `measurement_failure` and creates repair work.

Review frequent capabilities at day 7 and 14, with first decision no later than day 28. A justified episodic capability may run to day 56. A contingency capability uses its frozen rare trigger, eligible unit, success outcome, and drill instead of routine usage.

Core, rights/safety, and contingency capabilities are not removed merely for low use. They may be clarified, simplified, consolidated, moved to secondary access, or replaced only while preserving their cited invariant.

- `core` cites an exact merged product-contract invariant and stable JTBD; moving into core requires a strategy-change PR.
- `rights_safety` cites an existing auth, privacy, security, accessibility, data-integrity, or user-right invariant; never invent a legal obligation.
- `contingency` freezes the rare trigger, unit, outcome, and drill.
- Freeze class and citation in the definition before measurement. Reclassification closes the version and opens a new window; negative use never justifies protected classification.

Supporting and experimental pruning may use a frozen continued-value floor miss, user harm/confusion, duplication, or disproportionate attention/maintenance/operational cost. Outcomes are `keep`, `adopt_correction`, `consolidate`, `hide`, `deprecate`, `remove`, `insufficient_opportunity`, or `measurement_failure`.

## Repairs, second window, and retirement

Before the first trustworthy unit, a correction may regenerate the definition. An instrumentation-only repair changes no UX, cohort, JTBD, value threshold, risk, or timing; discard its invalid window and allow one repair. A discovery-led change after baseline creates a new version, hash, and window. Changing JTBD, cohort, value, threshold, risk, or window is always a new hypothesis.

Exactly one second opportunity window is allowed: either one unchanged extension or one discovery-corrected version, never both. After two mature windows, decide. Retirement uses a reversible flag where possible, preserves user data, removes exposure before measurement closes, and monitors effects for 14 days after removal.
