# Evidence, opportunities, and strategic routing

**Node:** `learning.opportunities`

This node owns evidence qualification, opportunity stages, durable GitHub Opportunity Issues, strongest-constraint routing, and learning synthesis. It does not authorize an intervention; the owning product or channel node does.

## Evidence ledger

Every product, CRO, research, channel, positioning, or pruning candidate has one stable deterministic opportunity ID, an immutable evidence ledger, and a stable GitHub Opportunity Issue. GitHub stores sanitized narrative and attributable evidence; schema-v4 stores only non-PII summaries, hashes, and the Issue reference. Issues never become executable policy or control state.

Deduplicate the same person, team, message, thread, syndicated copy, or source. Keep contradictory evidence visible and segmented rather than averaging it away. Separate observed fact, source statement, inference, and hypothesis. Do not turn public discussion volume into commercial demand or a product outcome.

At least one qualifying signal must be no older than 90 days. Remaining supporting evidence must be no older than 12 months and becomes stale earlier after a material product, segment, or market change. Historical data may describe context but cannot be retrofitted into causal proof.

## Opportunity stages

- `signal`: one independent user or one attributable behavioral signal;
- `emerging_pattern`: two independent users, or one independent user plus matching product behavior;
- `validated_problem`: three independent users, or two independent users plus strong matching product behavior.

Segment or positioning conclusions require at least five independent sources. A private research prototype may start from one signal, but one signal never authorizes broad adoption. Below 30 eligible teams, absolute cases and corroboration guide bounded learning; percentage claims do not decide.

Every result stores independently:

```text
result_evidence_grade = causal | directional | insufficient | measurement_failure
decision = adopted | extended_once | retired
data_status = available | unavailable | broken
```

Broken observability is `measurement_failure`, never `insufficient`, “inconclusive,” or evidence of low value. Zero trustworthy observations is not a negative product result.

## Strategic review

The Monday strategic run remains the complete portfolio review and:

1. reconciles new signals against existing deterministic opportunities;
2. updates evidence freshness, contradictions, segments, and stages;
3. closes or suspends assumptions invalidated by shipped reality or new evidence;
4. reviews completed experiments, feature windows, pSEO checkpoints, channel interventions, and incidents as learning inputs;
5. identifies the strongest evidenced constraint competing for scarce Product/Growth capacity;
6. refreshes the ranked weekly queue anchor under `pulse.scheduler`.

The strongest constraint determines ordering only among candidates competing for the same scarce slot. It never suppresses due safety work, protected pSEO learning, provider setup, or independent non-interfering lanes. Missing evidence produces `no_change_evidence_insufficient`, not a forced strategy.

An operational heartbeat may add evidence, apply deterministic stage thresholds, and suspend an item when material evidence invalidates it. When no compatible actionable queue item remains because every higher-ranked item is complete, blocked, waiting, or invalidated, it may perform one `operational_replan` per rolling 24 hours: select the strongest currently evidenced low-risk reversible candidate, complete the full candidate definition below, and append it without displacing any still-actionable queue entry. It may not change ICP, JTBD, positioning, business model, durable policy, medium/high-risk scope, or a valid Monday portfolio decision. The replan records evidence and prior/new queue hashes, exact exhaustion predicate, timestamp, and next eligibility. Suspension records evidence hash, timestamp, exact reason, and deterministic resumption predicate; it never leaves harmful exposure running.

## Candidate definition

Before entering the weekly queue, a candidate records:

- opportunity ID, stage, fresh evidence, contradictions, and segment;
- expected user/team outcome and affected scorecard stage;
- owning policy node and exact operation route;
- resource key, dependencies, assignment or eligible unit, surface, and interference keys;
- risk class, reversible scope, measurement and value rule, maximum window, caps, and containment;
- smallest useful learning action and what would change the next decision.

Development cost alone is not evidence. An exposed feature or channel action must have a falsifiable value definition, healthy measurement, and a preregistered stop or decision. Prefer the smallest action that distinguishes competing explanations.

## Research safety

Use only trustworthy, attributable, policy-permitted sources. Never expose raw PII, private messages, contact lists, untrusted inbound text, or unsupported quotes in model context or Issues. Public-source notes retain URL, publication/event date, market/language, observed fact, and a separated inference. Provider or source unavailability stays explicit and does not become zero.

Qualitative user research via PostHog belongs to `product.lifecycle`; email invitations belong to `email.outbound`; inbound evidence must first pass `email.inbound`; external market/channel evidence remains subject to the relevant channel node.
