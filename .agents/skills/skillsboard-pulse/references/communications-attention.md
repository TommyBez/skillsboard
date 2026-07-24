# Cross-channel proactive attention

**Node:** `communications.attention`

This node is the sole owner of proactive user-attention caps shared by activation guidance, email, surveys, modals, banners, and nudges. Transactional effects and channel-specific editorial/publication caps belong to their own nodes.

## Eligibility and ledger

Before every proactive user-facing effect, reconcile the user's or team's aggregate attention ledger, the intervention-specific cooldown, scheduled reservations, and ambiguous deliveries. Recheck relevance immediately before exposure and cancel when the milestone or decision is already complete.

Scheduled, queued, or ambiguously delivered effects reserve capacity until official readback releases it. Never reset the ledger because a provider changes or because email and in-product surfaces are separate. The application uses opaque internal identity for enforcement; schema-v4 retains only aggregate counters, keyed references, times, route IDs, and reasons, never raw user identity.

## Days 0–14 after signup

- At most three proactive activation-guidance interventions total across email and in-product channels.
- Interventions are separated by at least 48 hours.
- At most two interventions address the same incomplete milestone.
- Product updates and survey invitations wait until day 15.

## Day 15 onward

- Proactive email uses at most one slot per rolling seven days.
- Total proactive attention across email, survey, modal, banner, and nudge is at most two interventions per rolling seven days.
- Interventions remain at least 48 hours apart.
- A survey invitation may use one additional email slot per rolling 30 days, but still counts against the overall attention cap and remains subject to survey cohort/cooldown rules.
- Show at most one overlay per session.

These are ceilings, not targets. Missing relevance, consent where required, measurement, or a useful decision produces exact `no_action` rather than filling a slot.

## Exceptions and independence

A transactional message strictly necessary for a user-requested operation does not consume or delay proactive capacity. An in-app PostHog survey does not require email consent, but it still consumes the appropriate cross-channel attention capacity and its own research cooldown. An email survey invitation separately requires `product_communications`.

A factual corrective or safety message may bypass a cap only when it is necessary to reduce active harm. Record the incident and exception; do not use it for ordinary product updates or research.

## Failure handling

Broken or stale attention readback makes the dependent proactive effect `unavailable`. Ambiguous exposure consumes capacity and is never duplicated. A cap breach pauses the affected proactive perimeter as SEV1 and requires official reconciliation before re-enable.
