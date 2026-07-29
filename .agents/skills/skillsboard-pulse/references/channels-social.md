# Typefully, LinkedIn, and X

**Node:** `channels.social`

Load for Typefully identity, drafts, scheduling, publication, reconciliation, and comment handoff. Load `product.truth` for copy.

## Authority and direct publication

The owner-approved, merged, externally pinned contract plus an active Pulse automation satisfy the pinned Typefully skill's standing automation authority and authorize publication without per-post confirmation. The parent invokes the official Typefully capability directly. A fresh isolated executor, child write-authorizer, shadow stage, editorial reservation, internal review, or second confirmation is not required.

Use only the official Typefully configuration locations accepted by the pinned skill, require mode `0600`, strip inherited `TYPEFULLY_API_KEY`, and verify the exact account, social set, and platform before acting. A wrong or unverified identity is `authority_or_identity`; an absent official operation is `unavailable`.

Read the exact draft immediately before publication and bind the current contract root, account, social set, resource key, platform, provider draft ID, copy hash, timing, and applicable parent/reply IDs; use explicit nulls for inapplicable IDs. User edits in Typefully are authoritative and must not be overwritten.

The draft or post ID identifies a resource; it does not prove that a timed-out `drafts:publish` request was not applied. After a request may have issued, retry only with provider-supported idempotency or after official exact-resource readback confirms that no public post exists.

## Editorial rules

- LinkedIn posts are natural Italian; avoid English terms when an ordinary Italian equivalent is clearer.
- X posts are English.
- Publish shipped Skills Board reality only. Do not invent customers, metrics, personal experience, having read a source, roadmap, or ETA.
- Every post must be useful on its own and may link naturally to Skills Board.
- There is no rolling editorial cap, minimum gap, queue reservation, cooldown, weekly quota, or publishing-frequency gate beyond Typefully's binding platform/provider limits.

## Continuous action

Owned social is a near-zero-cost candidate family. Synthesize every distinct truthful useful unit with an explicit plausibly positive contribution path through acquisition, activation, retention, or reactivation to the governing `AAT-28` objective. Execute all mutually compatible positive units through the official capability; when runtime or binding provider limits require ordering, rank them by expected marginal contribution, time to effect, confidence or information gain, and runtime cost. There is no per-run publication quota, and completing one unit does not make another positive compatible unit ineligible. Missing analytics, team activation maturity, prior queue content, or quantitative evidence changes confidence but never blocks synthesis or publication.

When a unit belongs to an active `launch.campaign`, preserve its campaign identity: name or visibly demonstrate Skills Board, use one distinct shipped product proof, and connect it to the campaign conversion or learning objective. Its deadline informs time to effect and urgency but creates no automatic precedence over a stronger non-launch unit. Thematic similarity informs contribution estimates but is not an editorial cap or cooldown; exact provider-effect deduplication remains mandatory.

## Replies

Automated replies are allowed only through an official supported operation on the verified account and exact thread. Do not send cold DMs, impersonate a person, solicit artificial engagement, expose account/customer data, or answer legal/privacy/security/account-specific matters substantively. These limits exist for authorization, privacy, and binding platform rules, not for an internal reply cap.

The sole exception to the automated-operation rule is human execution of a LinkedIn reply while no official supported reply operation exists. For Pulse automation the effect is physically unavailable, not a request for strategic approval.

## State

Store only verified account/social-set/platform, current draft/post IDs, content hash, published URL/time, duplicate-delivery ambiguity, and sanitized reply handoff. Do not store credentials, raw comments, editorial reservations, cooldowns, or internal caps.
