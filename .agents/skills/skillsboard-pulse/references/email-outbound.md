# Consent, outbound email, attention, and Resend

**Node:** `email.outbound`

Load for consent/suppression work, Resend identity or management, transactional/proactive/Broadcast send, review or survey invitation, or email attention reconciliation. Add `product.truth` whenever composing or editing content. All email is in English.

## Identities and consent

Proactive founder-voice email uses the verified identity `Tommaso from Skills Board <tommaso@skillsboard.sh>`. Transactional email uses its separate operational identity.

- A transactional message required to deliver a user-requested operation needs no marketing opt-in and consumes or delays no proactive cap. It must remain strictly transactional.
- Activation guidance, product updates, newsletters, product-research invitations, review invitations, and survey invitations share one optional `product_communications` topic.
- The signup control is unchecked by default. Settings exposes the same control and immediate opt-out. Do not add separate guidance or research consent.
- Recheck relevance just before a proactive effect and cancel when the target milestone is complete.
- Application consent/eligibility is canonical. Provider unsubscribe, complaint, hard bounce, suppression, or deleted-account state may only tighten it.

If the application lacks required signup/Settings consent, suppression, privacy disclosure, or deletion behavior, route an independently approved product PR. Enable only after unchecked signup and Settings controls, policy-versioned affirmative evidence, transaction-safe immediate opt-out, deletion behavior, sealed provider synchronization/readback, footer/privacy disclosure, and production tests all pass. Keep proactive send disabled until deployment and exact readback; this is product work, not a permanent provider blocker.

## Attention caps

All cross-channel proactive attention, including activation guidance and survey invitations, is governed by `communications.attention`. Transactional messages neither consume nor delay its capacity.

## Proactive readiness

Proactive email remains `setup_required` until a public postal identity is privately configured, rendered in the footer, and verified by readback, together with current Resend AUP gates: eligible opted-in audience, valid sender/company identity, stated reason for contact, and frictionless opt-out. Never store or request the postal address in chat, repository files, state, logs, Issues, or digest. Do not bypass readiness with nominally individual bulk sends.

Transactional, inbound, and internal incident operations remain independently eligible when their own routes pass.

## Suppression retention

Account deletion removes profile, audience membership, message linkage, and usable consent. Retain only a server-side keyed HMAC of normalized email plus channel, topic, reason, time, policy version, and opaque provider reference.

- Keep unsubscribe, complaint, hard-bounce, and deletion suppression while the channel exists.
- A fresh verified opt-in may supersede unsubscribe, manual, or deletion suppression; it never automatically lifts complaint or hard bounce.
- Keep minimal affirmative-consent evidence for three years after withdrawal/expiry, then delete absent a separately documented obligation.
- Privacy disclosure and deletion response explain the minimal suppression record. Provider retention may be stricter.

The Pulse sees only aggregate or opaque state. A broken consent/unsubscribe path is SEV1: pause proactive sends, cancel future effects, and repair by PR. Never bypass it with one-to-one sends.

## Secure Resend management plane

Use the official Resend CLI skill with named profile `skillsboard-gtm-pulse`, macOS secure storage, and `--profile` on every call. Strip inherited `RESEND_API_KEY`; never use file credential storage, command-line keys, or the application's sending key. Prefer official interactive/OAuth-style setup, with a securely stored scoped key only as the documented fallback.

Resend management remains `setup_required` until the named secure profile passes identity and domain readback. Each management operation then begins `read_only` and needs its exact graph route/switch before any shadow or enabled transition.

The human setup command is:

```sh
env -u RESEND_API_KEY RESEND_CREDENTIAL_STORE=secure_storage \
  resend --profile skillsboard-gtm-pulse auth login
```

Use only local `whoami`, `doctor`, profile metadata, and non-PII domain/webhook/topic metadata for safe identity readback.

Never bring raw contacts, addresses, names, subjects, bodies, headers, attachments, suppression rows, receiving-email data, or content-bearing logs into model/tool context. Contact/suppression listing or retrieval, sent/received email reads, and content logs remain `unavailable` until a sealed server-side plane returns only aggregate counts, keyed hashes, booleans, and opaque IDs. Full log bodies are incident-only inside that sealed perimeter and are never persisted.

Provider suppressions may be beta/account-gated; discover capability live. Never lift complaint or hard bounce. Manual, unsubscribe, or deletion suppression may be superseded only after a fresh verified opt-in and per-record sealed application/provider readback. Blind or batch removal is prohibited.

## Topic, audience, Broadcast, and individual operations

The durable topic is exactly `product_communications` with immutable default `opt_out`. A wrong definition creates a versioned replacement rather than changing its default. Each management effect uses the exact route/switch combination in `graph.json`:

- topic metadata: exact versioned topic;
- audience/segment: one frozen campaign-only segment;
- eligible suppression lift: fresh opt-in and sealed per-record readback;
- Broadcast draft: exact non-reused segment plus exact topic, API-created only;
- webhook or domain metadata: only within the separately owned route and topology constraints.

For a Broadcast, freeze the audience and subtract later opt-outs/suppressions; later opt-ins wait for a future campaign. Dry-run, create the API draft, and run just-in-time preview, target, reply-to, suppression, footer, consent, and cap checks before sending. Wrong segment, topic, reply-to, or preview requires delete/recreate while unsent. Dashboard-created Broadcasts are not API-sendable. Native Broadcast scheduling is ineligible; send just in time. Reconcile uncertain status by known opaque ID, never name.

Every individual send freezes immutable intent, deterministic logical key, payload hash, opaque recipient reference, dry-run result, and idempotency key. Within Resend's 24-hour window, retry the identical payload at most three times and only for network failure, 429, 500, or concurrent-idempotent-request. Do not retry other 4xx responses or payload conflicts. After 24 hours without a provider ID, mark `delivery_ambiguous`, consume cap/cooldown, and never auto-resend.

Existing application transactional sending does not grant Pulse management authority. Every Pulse mutation must select its exact graph operation and satisfy every `switches_all` value. Missing, malformed, or non-`1` values fail closed.

## Private configuration

Pulse-only configuration lives at `/Users/tommaso/.config/skillsboard-gtm-pulse/env`; directory mode is `0700`, file mode `0600`. Its loader allowlists keys, validates owner/mode, never prints values, and rejects unknown keys. It may hold the private incident recipient, operation switches, public-postal-identity reference, and official DataForSEO/Search Console settings. It must not hold application DB/auth secrets, a PostHog Personal API Key, application Resend send key, or Typefully credential.

`tommaso@skillsboard.sh` is a Resend inbound address, not a monitored traditional mailbox. Do not alter MX topology opportunistically. A conventional mailbox requires a future explicit topology decision.

## State and containment

Persist only route and logical keys, hashes, opaque recipient/provider IDs, aggregate consent/suppression state, frozen audience counts, reservations, attention/cooldown, idempotency status, and ambiguity. Never persist private identities or content.

A wrong audience, broken opt-out, duplicate bulk send, cap breach, or content materially outside verified product truth is SEV1. Stop future effects, contain unsent drafts, preserve aggregate evidence, and use official readback before any correction. Ambiguous delivery consumes capacity and is never blindly duplicated.
