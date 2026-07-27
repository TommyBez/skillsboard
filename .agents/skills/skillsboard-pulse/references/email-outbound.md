# Consent, outbound email, and Resend

**Node:** `email.outbound`

Use the connected official Resend connector and the pinned `resend-connector` skill. The parent invokes routed operations directly. Sealed provider delivery is used only to keep recipient PII and private content outside the parent.

## Consent and legal eligibility

- Transactional email must be strictly necessary for a user-requested operation.
- Activation guidance, product updates, newsletters, research, review, and survey invitations require affirmative `product_communications` consent.
- Recheck deletion, opt-out, unsubscribe, complaint, hard bounce, and suppression immediately before send.
- Proactive email must use the verified Skills Board identity, explain why the recipient is receiving it, provide frictionless opt-out, and include the legally/provider-required postal identity without exposing it in chat or repository state.
- Do not use purchased, scraped, guessed, enriched, or unrelated contact data.

These are legal, privacy, authorization, and binding provider rules. Missing consent or suppression proof blocks only the affected recipient-bearing send.

## Direct provider operation

No per-send human confirmation, isolated executor availability, shadow draft, empty-segment ceremony, internal attention cap, campaign WIP, audience-size threshold, scheduling prohibition, or readiness lifecycle is required. If an official operation exists and the send is legally eligible and free of incremental spend/overage, execute it.

The pinned Resend connector skill remains byte-identical upstream. Normalize its lifecycle vocabulary at the Pulse boundary rather than persisting extra work states:

- connector `setup_required` or failed authentication maps to `authority_or_identity`;
- connector `manual_action` maps to the applicable `legal_or_consent`, `authority_or_identity`, or `spend_or_overage` state when that is the concrete cause; if the official connector physically cannot perform the otherwise-authorized operation without a human-only provider transition, map it to `unavailable`;
- connector `shadow` describes inert unsent provider draft metadata only, never a Pulse work state or mandatory stage;
- missing authoritative suppression proof maps to `legal_or_consent`, while a missing exact official operation maps to `unavailable`.

Do not change or fork the upstream connector skill to implement this mapping. Provider-native drafts and metadata may be reconciled, but they do not create an approval, readiness, or shadow gate.

Use provider idempotency and exact-resource readback where available. After a request may have issued, do not resend until official readback proves absence; this prevents duplicate or wrong-recipient mail and double charges. Binding provider rate limits remain authoritative, but Pulse adds no arbitrary retry count, cooldown, daily/weekly cap, or forecast reserve.

## Provider and spend boundary

Do not create accounts, change scopes/owners/admins, accept terms, start trials/subscriptions, buy credits, or incur overage. Use included quota only while its hard non-overage limit permits. Existing application sending authority does not authorize a different sender/account.

## State

Persist only logical keys, payload hashes, opaque recipient/provider IDs, aggregate consent/suppression status, idempotency status, and ambiguous issued effects. Never persist raw recipient identity, private copy, secrets, internal attention ledgers, cooldowns, or shadow states.

A wrong recipient, broken opt-out, unauthorized audience, duplicate bulk send, deceptive copy, or uncontrolled charge is an incident and is contained immediately.
