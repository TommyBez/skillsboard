# Consent and lawful proactive attention

**Node:** `communications.attention`

This node owns only the consent, privacy, unsubscribe, suppression, deletion, and binding platform/provider rules shared by proactive communication surfaces.

## Rules

- A proactive email requires the applicable affirmative consent and a working immediate opt-out.
- Provider unsubscribe, complaint, hard bounce, suppression, and deleted-account state tighten eligibility.
- Recheck that the intended recipient/account and destination are authorized immediately before the effect.
- Transactional messages remain strictly transactional and do not use marketing consent as a substitute.
- Ambiguous recipient-bearing delivery is not resent until official readback proves absence.

There is no Pulse-defined per-user, per-team, per-session, daily, weekly, monthly, signup-age, milestone, overlay, survey, modal, banner, nudge, or cross-channel attention cap or cooldown. Binding provider/platform anti-abuse and rate limits remain authoritative.

State keeps only opaque consent/suppression/delivery references and aggregate legal eligibility. It stores no attention-slot ledger, cooldown, WIP reservation, or raw identity.
