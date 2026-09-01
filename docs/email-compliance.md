# Product email consent and delivery

Skills Board keeps product communications separate from sign-in codes and team invitations. The application database is the source of truth for consent and suppression. Resend is a delivery projection that may be stricter, but never more permissive.

## User contract

- Signup offers one optional, unchecked `product_communications` choice.
- Consent is recorded only after the email OTP succeeds and the account email is verified.
- For a newly created account, leaving the signup choice unchecked records a non-consent default after verification. It never grants consent or changes an existing account's preference.
- Existing accounts with no recorded choice see one inline, non-blocking choice in the authenticated product until they answer.
- Authenticated users can grant or withdraw consent at `/settings/email`.
- Every product email includes a visible unsubscribe link, a preferences link, and the sender identity. A marketing broadcast also carries the public postal address, because the CAN SPAM postal requirement applies to commercial messages. Account setup service email and transactional email are relationship messages and carry no address.
- One-click unsubscribe is public, encrypted, idempotent, and does not expose the raw email address or a stable user identifier.
- Product campaigns use the verified consent and suppression contract without adding an account-age, weekly, or other arbitrary attention gate.

Public postal identity:

There is none yet. `postalAddress` and `address` in `lib/site.ts` are `null`, and every surface that would print an address omits it while they are. Set both, with the operator's real address, before the first marketing broadcast. Never fill them with a placeholder: a made up address is worse than no address, in an email and on a legal page alike.

Proactive sender identity:

`Tommaso from Skills Board <tommaso@skillsboard.sh>`

## Activation service email

Activation service email is a third category, separate from `product_communications` marketing and from sign-in codes and team invitations. It covers exactly two messages, `activation_welcome` and `activation_first_skill`, sent only to the person who created a team. Nothing else ever enters the category.

- Perimeter: those two message types and no others. Inviting a teammate and connecting an agent are later activation messages that stay under the `product_communications` opt-in topic, without exception.
- Window: a person is eligible only within 14 days of team creation. On day 14 the sequence ends for that person, whatever has been sent.
- Legal basis: in the EU the basis is legitimate interest toward a registered user, limited to completing the setup of the account that user just created, and it is never marketing consent. In the United States the messages carry the CAN SPAM footer with a working opt out. Both bases are limited to the perimeter above.
- Frequency: at most one activation email per user per day, at least 24 hours between two emails of the sequence, and no more than 3 activation emails to any person, ever. The count is per person and never resets. The sequence defines two messages; 3 is the ceiling that no later change may exceed without its own review.
- Permanent exit: withdrawn consent, a suppression of any kind, the completed action the message asks for, the end of the 14-day window, or 3 activation emails already sent. Any one of these ends the sequence for that person for good.
- Suppression wins. An `emailSuppression` row of either scope blocks an activation send before it reaches Resend, exactly as it blocks a marketing send, and no activation rule may relax it.
- Unsubscribe: the sequence reuses the existing public, encrypted, idempotent one-click unsubscribe and its RFC 8058 headers. It adds no second mechanism and no separate token.
- The `emailSubscriber` list is out of scope. Those rows are visitor captures with no account and no team, so they never receive an activation email.
- One time backfill, decided on 2026-09-01. This is the recorded decision the rule above asked for: teams created before the sequence was switched on enter it once, with their 14 day window anchored to the enabling date held in `ACTIVATION_BACKFILL_STARTED_AT` rather than to team creation. Everything else in this section applies unchanged, including the caps, the skip conditions evaluated at send time, and the precedence of suppression. The welcome carries its backfill wording, because a first day tone would be false for a team created weeks earlier. When that anchored window closes the pass is over and only newly created teams qualify.

A public postal address is not a precondition for this category. The CAN SPAM postal requirement covers commercial messages, and account setup service email is relationship email, so its footer carries the sender identity and a working unsubscribe and no address. A real postal address stays required before any future marketing broadcast to the opt-in list, such as a newsletter or a product update. Approved by the maintainer on 2026-09-01.

Two preconditions gate the first send of the sequence. The public privacy notice has to describe this category and the basis it relies on before the category is switched on: the notice published today says product communications go out only after opt-in, so enabling the sequence without that update would use the provider for a purpose users have not been told about. And the founder has to authorize that first send explicitly, as with every other proactive category.

## Data model

- `emailPreference` holds the current topic choice, notice version and text, email hash, stable encrypted unsubscribe token, and timestamps.
- `emailConsentEvent` is the application-append-only consent and suppression audit trail.
- `emailSuppression` blocks marketing or all delivery after unsubscribe, complaint, hard bounce, or provider suppression. Its `lastSeenAt` always represents the latest suppression occurrence; provider re-subscription is tracked separately and never overwrites that chronology.
- `emailProviderContactState` keeps the newest signed global Resend contact state so out-of-order webhooks cannot reverse it.
- `emailWebhookEvent` provides signed-event idempotency and retry state keyed by `svix-id`.
- `emailProactiveDelivery` records exact founder-sender broadcast deliveries without raw addresses for provider-effect readback and deduplication.

Email hashes use HMAC-SHA256 and unsubscribe tokens use randomized AES-256-GCM encryption with purpose-separated derived keys. The randomized token is generated when the preference is created or its email changes, then persisted so provider reconciliation reaches a fixed point. Set a dedicated base64- or hex-encoded `EMAIL_PRIVACY_SECRET` containing at least 32 random bytes in every hosted environment; Vercel Production refuses to use the authentication secret as a fallback. Local and self-hosted environments may derive domain-separated keys from a sufficiently long `BETTER_AUTH_SECRET`. During a planned root rotation, retain every prior root as a JSON string array in `EMAIL_PRIVACY_SECRET_PREVIOUS`; dual-hash lookup and token decryption remain active. Never remove a prior root while a retained preference, suppression, contact-state, delivery, or consent record still depends on its hash. Orphaned suppression records cannot be re-keyed without the original address, so their root must remain for their full retention period.

## Deployment order

1. Apply the Drizzle schema to the target database before deploying code that reads the new tables.
2. Set `EMAIL_PRIVACY_SECRET` and `RESEND_WEBHOOK_SECRET` in that same environment. Preserve any active prior privacy roots in `EMAIL_PRIVACY_SECRET_PREVIOUS`.
3. Deploy the application and confirm `/api/webhooks/resend` is reachable over HTTPS.
4. Through the official authenticated Resend capability, configure a webhook for `email.sent`, `email.bounced`, `email.complained`, `email.suppressed`, and `contact.updated`.
5. Send provider test events and verify one processed ledger row per `svix-id`, with no duplicate consent event on replay.

Do not log webhook payloads or recipient addresses. The endpoint records only the provider event ID, event type, payload digest, provider email ID, timestamps, status, attempt count, and bounded error name.

## Resend broadcast configuration

Provider resources must be created and read back through the official authenticated Resend capability:

1. Verify exactly one Skills Board sending domain and the exact founder sender identity.
2. Create or verify a public `Product communications` topic whose immutable default subscription is `opt_out`.
3. Bind the launch draft to a dedicated, non-reused segment and the topic.
4. Build a sealed local candidate set from currently verified grants, then intersect it with the current Resend subscription state. Local consent must never flip a stricter provider opt-out. Store the persisted encrypted token in the `PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN` contact property. Never log or expose the contact projection outside sealed provider handling.
5. Render the local Skills Board unsubscribe link from that contact property and retain Resend's native `{{{RESEND_UNSUBSCRIBE_URL}}}`. The local link updates the canonical database; the native link keeps Resend more restrictive even if topic-level state is not present in `contact.updated` webhooks.
6. Keep the draft unsent until sender, segment, topic, suppression, unsubscribe, postal identity, quota, duplicate effect, and audience readbacks all match.

The React Email source for the approved launch body is `emails/product-launch.tsx`. Its footer prints the public postal identity from `lib/site.ts` when one is set, so that address has to exist before the broadcast goes out.

## Transactional delivery

Marketing unsubscribe does not disable sign-in codes or team invitations. A verified complaint, permanent bounce, or provider suppression creates an `all` suppression and blocks both transactional send paths before they call Resend. Transient and undetermined bounce classifications do not create a permanent local block. Founder-sender `email.sent` broadcast events update the exact delivery ledger. A signed global `contact.updated` re-subscription lifts a provider unsubscribe only when it is newer than an explicit local re-consent. Topic-specific changes are not present in that webhook, so the provider audience must still be read back immediately before every broadcast and intersected without overwriting provider opt-outs.
