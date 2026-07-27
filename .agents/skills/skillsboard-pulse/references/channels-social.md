# Typefully, LinkedIn, and X

**Node:** `channels.social`

Load for Typefully identity, drafts, scheduling, publication, reconciliation, and comment handoff. Load `product.truth` for copy.

## Authority and direct publication

The pinned contract plus an active Pulse automation authorize publication without per-post confirmation. The parent invokes the official Typefully capability directly. A fresh isolated executor, child write-authorizer, shadow stage, editorial reservation, internal review, or second confirmation is not required.

Use only the official Typefully configuration locations accepted by the pinned skill, require mode `0600`, strip inherited `TYPEFULLY_API_KEY`, and verify the exact account, social set, and platform before acting. A wrong or unverified identity is `authority_or_identity`; an absent official operation is `unavailable`.

Read the exact draft immediately before publication and bind its current provider ID and content. User edits in Typefully are authoritative and must not be overwritten. After a request may have issued, use the draft/post ID to avoid duplicate publication.

## Editorial rules

- LinkedIn posts are natural Italian; avoid English terms when an ordinary Italian equivalent is clearer.
- X posts are English.
- Publish shipped Skills Board reality only. Do not invent customers, metrics, personal experience, having read a source, roadmap, or ETA.
- Every post must be useful on its own and may link naturally to Skills Board.
- There is no rolling editorial cap, minimum gap, queue reservation, cooldown, weekly quota, or publishing-frequency gate beyond Typefully's binding platform/provider limits.

## Continuous action

Owned social is a protected organic lane. Every strategic run senses current audience problems and publishes the strongest truthful useful unit. Operational runs may create and publish more units whenever the lane can produce useful content. Missing analytics, team activation maturity, prior queue content, or quantitative evidence never blocks publication.

## Replies

Reply only through an official supported operation on the verified account and exact thread. Do not send cold DMs, impersonate a person, solicit artificial engagement, expose account/customer data, or answer legal/privacy/security/account-specific matters substantively. These limits exist for authorization, privacy, and binding platform rules, not for an internal reply cap.

LinkedIn replies remain a human execution path only while no official supported operation exists; this is physical unavailability, not a request for strategic approval.

## State

Store only verified account/social-set/platform, current draft/post IDs, content hash, published URL/time, duplicate-delivery ambiguity, and sanitized reply handoff. Do not store credentials, raw comments, editorial reservations, cooldowns, or internal caps.
