# Organic distribution, launch, reputation, and partnerships

**Node:** `channels.distribution`

Load for communities, directories, review sites, Product Hunt, Hacker News, earned media, demand-signal response, partnerships, or paid-channel eligibility. Add `product.truth` for copy and `email.outbound` for review invitations. All autonomous effects require the exact allowlist, official current rules/capability read, graph route, and switches.

If autonomous execution is unavailable but every other policy, evidence, identity, quality, cap, cooldown, and containment gate passes, emit a bounded `manual_action` package instead of dropping the opportunity. It reserves the same cap/lock and includes final target, evidence-backed brief, identity, rule URL/check time, expiry, containment, and required result URL/ID.

## Community portfolio

In any rolling seven days:

- at most five first public contacts across allowlisted communities;
- each new top-level post and each first contextual reply consumes one first-contact slot;
- at most two first contacts may be new top-level posts/threads, each also consuming a first-contact slot;
- Reddit permits at most one of those new posts and a 30-day cooldown per subreddit;
- Show HN consumes one first-contact and one top-level slot and is human-only;
- later replies are eligible only after another participant responds in the involved thread.

LinkedIn, X, Product Hunt, directories, and review sites use their own ledgers and do not consume community slots unless the effect itself occurs in a community. Manual packages reserve the same limits and expire after seven days for a post or 48 hours for a reply.

Every community has a positive allowlist entry with current rules URL/check time, identity, permitted action/link/disclosure/language, promotion and reply limits, official operation, measurement, and edit/removal path. Prohibit duplicate cross-posts, warm-up, generic engagement, DMs, vote requests, incentives, and invented anecdotes.

After four measured weeks with complete observability and no policy/moderator violation, one strategic run may raise the top-level ceiling once from two to three. Three is the hard automatic ceiling; further increase requires a contract PR.

### Reddit

Autonomy additionally requires a dedicated labeled Skills Board app account, an official approved operation, and current subreddit rules permitting disclosed self-promotion and AI/bot participation. Use English standalone value and disclosure. Never use Tommaso's personal account, browser automation, DMs, voting, karma farming, or warm-up. A Pulse-owned thread may receive at most five bounded factual replies.

## Passive directories

Allow at most five new free listings per weekly strategic queue and one per destination, followed by quarterly official readback. Require a live product, canonical destination, privacy/terms pages, relevant real category, and real assets. Paid placement, backlink packages, forced reciprocity, spam, and artificial categories are ineligible. Ambiguous submission is not retried. Track qualified referral and activation outcomes; listing count, backlinks, domain metrics, and category/rule rejection are channel diagnostics, not product-value evidence.

## Product Hunt and Hacker News

Product Hunt and Hacker News publication are human-only.

For Product Hunt, recheck the official six-month and significant-update relaunch rules before each launch. Never solicit or incentivize votes/comments, mass-message strangers, simulate personal activity, or delete and repost a weak launch. The Pulse may prepare a factual brief, assets checklist, tracking, and coordinated eligible channel work; it must not generate copy-ready comments. Publication, scheduling, and commenting remain human actions.

A Show HN requires a live non-trivial directly usable product, not a landing page or minor update, and a Tommaso-designated discussion window. It consumes the community slots above. The Pulse may prepare factual inputs, but final title/submission text, publication, and every comment remain human and receive no AI-written or AI-edited wording. Never solicit votes/comments/submissions or delete and repost a weak submission.

## Review solicitation and responses

Run at most one solicitation campaign at a time. Select genuine recent meaningful-use users independently of NPS, sentiment, support, success, failure, churn, or expected rating. Exclude internal, test, affiliated, and conflicted identities.

- At most ten new invitations per rolling seven days.
- One per user per 180 days and two per team per 90 days.
- One reminder after at least eight days requires official no-review readback and consumes the normal proactive-email cap.
- Copy is neutral English, welcomes an honest positive or negative experience, requires `product_communications` for email, and offers no incentive, rating request, coaching, prefilled wording, or AI-authored/edited review.

Evaluate at 30 days: under 30 delivered is `insufficient_sample`; 30–59 delivered with zero reviews permits one correction but no expansion; at least 60 across the original plus one extension with zero reviews retires the channel. A provider warning, biased cohort, or policy violation pauses immediately.

Public review responses require their separate route and switch, official read/notification, truthful non-pressuring product facts, and no exposure of account/customer detail; target 72 hours when useful. Negative sentiment alone never changes exposure. Legal, privacy, security, grave allegations, identity ambiguity, dispute, or abuse receive a human handoff, not an autonomous substantive response.

## Earned media

Allow one active story. Eligibility requires a verified shipped capability, reproducible privacy-safe data, an approved position, or a consented customer story. Use at most five highly matched recipients per angle, two angles, and ten first contacts per rolling seven days. Use only current public declared professional contact paths; never guessed, private, purchased, scraped, or enriched addresses and never automated contact forms.

Allow one English value-add follow-up under 150 words after at least four business days, then a 90-day same-contact/same-story cooldown. Outreach requires a separate compliant reply-capable mailbox; personal Gmail and Resend are prohibited. Until connected, an otherwise eligible item becomes an expiring same-cap manual package. Interviews, embargoes, exclusives, new personal quotes, customer introductions, and legal/privacy/security topics are human handoffs unless exact prior approval covers them. Paid wires, sponsored placement, badge mills, and link offers are ineligible. Keep only pseudonymous contact key, outlet, beat, public source, opaque provider ID, and status. Two angles and ten matched first pitches with no substantive reply retire the story; coverage without qualified downstream response is `distribution_only`.

## Demand signals

Unsolicited cold email and DMs are `policy_ineligible`. Demand state contains organization/domain, dated public professional source, observed signal, separated inference score, and lifecycle, never names, personal email/profile, sensitive attributes, or private sources. Purchased/scraped lists, guessed or enriched addresses, CAPTCHA/login bypass, and distress contexts are prohibited.

A source-native public response shares the five-contact community cap, allows one intervention per author/thread per 30 days, and has no follow-up without a reply. Email becomes eligible only after an explicit request/consent, permissioned introduction, or existing-user relationship covered by `product_communications`, with one follow-up after seven days. Ten eligible public interventions over 30 days with no substantive response permit one source/message iteration; twenty retire the angle for 90 days.

## Partnerships and co-marketing

Organization-level research requires at least 75/100 across fit, complementarity, reputation, reciprocal value, and execution evidence. Eligible paths are official programs/forms, inbound, permissioned introductions, or existing relationships only; no cold email.

- At most three new proposals per strategic run.
- One follow-up after at least ten days.
- At most two simultaneous no-cost asynchronous units.

Each party retains its audience, consent, and data. Do not exchange/export/match leads; pay; offer revenue share, discounts, giveaways, exclusivity, or SLAs; promise roadmap, privileged support, or unsupported integrations; accept terms/DPAs; or grant broad trademark rights. Require the partner's exact contribution and final asset approval before launch. After 30 live days, activation and `AAT-28` are outcomes. One zero-activation unit permits one materially different unit; two live units over at least 60 days with zero activation retire that partner for 180 days. Partner non-execution is `partner_nonexecution`, not product evidence.

## Switches, readback, and containment

All operations begin `read_only`. Community writes use the community master route; directory, review outreach/response, earned media, partnership, and demand response each require the master plus their exact operation switch in `graph.json`. Missing, non-`1`, or malformed values fail closed.

Before effect, read current platform rules, identity, caps, cooldown, quota, destination/thread state, and edit/removal path. Persist deterministic resource key, route, rule-check time, opaque external ID/URL, cap reservation, and measurement. Ambiguous effects reserve capacity and are not blindly duplicated.

## Paid channels

Paid ads are `policy_ineligible` while Skills Board has no revenue line. Only an independently approved merged strategy change that establishes a revenue line and new budget/safety contract may make them eligible.
