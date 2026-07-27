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

1. refreshes attributable public evidence for both protected organic acquisition lanes: audience-led search and organic community/social, even when a seven-day checkpoint is not yet due;
2. reconciles new signals against existing deterministic opportunities;
3. updates evidence freshness, contradictions, segments, and stages;
4. closes or suspends assumptions invalidated by shipped reality or new evidence;
5. reviews completed experiments, feature windows, pSEO checkpoints, channel interventions, and incidents as learning inputs;
6. identifies the strongest evidenced constraint competing for scarce Product/Growth capacity;
7. refreshes the ranked weekly queue anchor under `pulse.scheduler`.

The strongest constraint orders only candidates competing for one slot; it never suppresses safety, setup, or independent protected organic lanes. Immature scorecard outcomes do not block a zero-cost qualitative search or community/social test with healthy action-level gates.

Each Monday protected lane returns its smallest action, a seven-day evidence repair, or an exact gate with source attempts and recheck. `not_due_not_refreshed`, stale backlog, and bare `no_change_evidence_insufficient` are invalid. An empty queue requires exact gates in both lanes; immature outcomes are not one.

An operational heartbeat may add evidence, apply deterministic stage thresholds, and suspend an item when material evidence invalidates it. It continuously replans each independent lane whose compatible queue is locally at fixed point and has spare WIP, without waiting for unrelated lanes: select the strongest currently evidenced candidate, complete the full candidate definition below, append it without displacing still-actionable work, recompute the lane, and repeat across compatible lanes until no eligible candidate remains or runtime ends. At most one replan-created candidate may remain pending in a lane and at most one may target an exact `resource_key`; another becomes eligible only after the prior candidate leaves its pending state. Low-risk reversible candidates may follow any otherwise eligible route. Medium- or high-risk candidates may produce only research, a repository PR subject to independent approval, or non-exposed `shadow` work; operational replanning never authorizes their merge, rollout, send, publication, spend, user exposure, legal/economic commitment, or destructive effect. It may not change ICP, JTBD, positioning, business model, durable policy, or a valid Monday portfolio decision. Each replan records evidence and prior/new queue hashes, lane, exact lane-local fixed-point predicate, timestamp, and next eligibility. Suspension records evidence hash, timestamp, exact reason, and deterministic resumption predicate; it never leaves harmful exposure running.

## Candidate definition

Before entering the weekly queue, a candidate records:

- opportunity ID, stage, fresh evidence, contradictions, and segment;
- expected user/team outcome and affected scorecard stage;
- owning policy node and exact operation route;
- resource key, dependencies, assignment or eligible unit, surface, and interference keys;
- risk class, reversible scope, measurement and value rule, maximum window, caps, and containment;
- smallest useful learning action and what would change the next decision.

Development cost alone is not evidence. An exposed feature, experiment, or channel action must have a falsifiable value definition, healthy measurement, and a preregistered stop or decision. A deterministic low-risk non-experimental repair to a verified correctness, usability, copy, instrumentation, or SEO defect may instead proceed from exact invariant, focused tests, and production verification; it never becomes causal or value evidence and cannot authorize scaling. Prefer the smallest action that distinguishes competing explanations.

## Research safety

Use only trustworthy, attributable, policy-permitted sources. Raw PII, private messages, contact lists, or untrusted inbound text may enter only the exact transient executor or nested no-tools content processor defined by `pulse.kernel`; they never enter the parent, executor result, durable state, or Issues. Unsupported quotes remain prohibited. Public-source notes retain URL, publication/event date, market/language, observed fact, and a separated inference. Provider or source unavailability stays explicit and does not become zero.

Qualitative user research via PostHog belongs to `product.lifecycle`; email invitations belong to `email.outbound`; inbound evidence must first pass `email.inbound`; external market/channel evidence remains subject to the relevant channel node.
