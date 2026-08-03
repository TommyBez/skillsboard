# Product email consent and delivery

Skills Board keeps product communications separate from sign-in codes and team invitations. The application database is the source of truth for consent and suppression. Resend is a delivery projection that may be stricter, but never more permissive.

## User contract

- Signup offers one optional, unchecked `product_communications` choice.
- Consent is recorded only after the email OTP succeeds and the account email is verified.
- For a newly created account, leaving the signup choice unchecked records a non-consent default after verification. It never grants consent or changes an existing account's preference.
- Existing accounts with no recorded choice see one inline, non-blocking choice in the authenticated product until they answer.
- Authenticated users can grant or withdraw consent at `/settings/email`.
- Every product email includes a visible unsubscribe link, a preferences link, the sender identity, and the exact postal address below.
- One-click unsubscribe is public, encrypted, idempotent, and does not expose the raw email address or a stable user identifier.
- Product campaigns use the verified consent and suppression contract without adding an account-age, weekly, or other arbitrary attention gate.

Public postal identity:

`15 Giuseppe Verdi Avenue, Suite 150, Capraia Innovation Park, CA 50050`

Proactive sender identity:

`Tommaso from Skills Board <tommaso@skillsboard.sh>`

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

Provider resources must be created and read back through the official authenticated Resend capability selected by Pulse:

1. Verify exactly one Skills Board sending domain and the exact founder sender identity.
2. Create or verify a public `Product communications` topic whose immutable default subscription is `opt_out`.
3. Bind the launch draft to a dedicated, non-reused segment and the topic.
4. Build a sealed local candidate set from currently verified grants, then intersect it with the current Resend subscription state. Local consent must never flip a stricter provider opt-out. Store the persisted encrypted token in the `PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_TOKEN` contact property. Never log or expose the contact projection outside sealed provider handling.
5. Render the local Skills Board unsubscribe link from that contact property and retain Resend's native `{{{RESEND_UNSUBSCRIBE_URL}}}`. The local link updates the canonical database; the native link keeps Resend more restrictive even if topic-level state is not present in `contact.updated` webhooks.
6. Keep the draft unsent until sender, segment, topic, suppression, unsubscribe, postal identity, quota, duplicate effect, and audience readbacks all match.

The React Email source for the approved launch body is `emails/product-launch.tsx`. Its footer uses the exact public postal identity from `lib/site.ts`.

## Transactional delivery

Marketing unsubscribe does not disable sign-in codes or team invitations. A verified complaint, permanent bounce, or provider suppression creates an `all` suppression and blocks both transactional send paths before they call Resend. Transient and undetermined bounce classifications do not create a permanent local block. Founder-sender `email.sent` broadcast events update the exact delivery ledger. A signed global `contact.updated` re-subscription lifts a provider unsubscribe only when it is newer than an explicit local re-consent. Topic-specific changes are not present in that webhook, so the provider audience must still be read back immediately before every broadcast and intersected without overwriting provider opt-outs.
