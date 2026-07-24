# Skills Board Pulse capability activation guide

**Contract version:** 2

**Status:** executable only after the independently approved contract PR is merged

**Scope:** Skills Board production operations; secret-free

This guide activates operations, not whole providers. Before the contract merge the Pulse makes no provider mutation. The first run on the merged contract is `reconciliation_only`; the next strategic bootstrap is read-only. A capability can then cross states in the same run when every gate passes:

```text
operation_state = disabled | read_only | shadow | enabled | quarantined
```

`setup_required` and `unavailable` are blockers/outcomes. `manual_action` is an execution mode that reserves the same locks, quotas, cooldowns, and caps as autonomous execution. Missing or malformed enable switches fail closed for that lane. The global stop is the native Codex automation pause.

## Non-negotiable boundary

The Pulse operates only within already connected, Skills Board-authorized provider relationships. It must not create an account or organization; accept or change terms, DPAs, or contracts; start trials, subscriptions, credit purchases, recurring costs, or overages; add OAuth scopes or connect apps; upload verification documents; or change owners, administrators, or access. These are `setup_required` human steps with provider, purpose, requested permissions, shared data, cost/terms, and disconnection procedure recorded.

Use included quota only. The reserve applies only to a finite quota shared by product operations and Pulse; unlimited or unshared quota is `not_applicable`. From fresh official aggregate readback, calculate `product_forecast_30d = max(product_actual_30d, product_actual_7d * 30 / 7)` and `shared_quota_reserve = max(20% * included_quota, 2 * product_forecast_30d)`. After confirmed period use, active reservations, ambiguous use, and the candidate worst case, remaining capacity must still cover that reserve. If the limit, both windows, total use, ownership split, or freshness cannot be read, the dependent Pulse write is `unavailable`; never estimate or buy capacity. Persist/digest those inputs and product transactionals take priority.

Never place secrets, raw PII, private recipient addresses, message content, survey free text, credentials, or private provider responses in this file, schema-v4 state, logs, Issues, PRs, or digests. Provider effects use deterministic `resource_key`, definition hash, logical key, and opaque live IDs. A lost create response is adopted only when exactly one deterministic name and complete definition match; otherwise quarantine it.

## Private Pulse environment

The file is `~/.config/skillsboard-gtm-pulse/env`, its directory is `0700`, and the file is `0600`. A loader must allowlist keys, validate owner/mode, never print values, and reject unknown keys. It must not source application database/auth secrets, a PostHog personal key, the application's Resend send key, or Typefully credentials.

```dotenv
# Missing, empty, or any value other than 1 disables that lane.
PULSE_ENABLE_GITHUB_WRITES=0
PULSE_ENABLE_POSTHOG_WRITES=0
PULSE_ENABLE_POSTHOG_ASSET_WRITES=0
PULSE_ENABLE_POSTHOG_FLAG_WRITES=0
PULSE_ENABLE_POSTHOG_EXPERIMENT_WRITES=0
PULSE_ENABLE_POSTHOG_SURVEY_WRITES=0
PULSE_ENABLE_PRODUCT_EXPOSURE=0
PULSE_ENABLE_TYPEFULLY_DRAFTS=0
PULSE_ENABLE_SOCIAL_PUBLISH=0
PULSE_ENABLE_PROACTIVE_EMAIL=0
PULSE_ENABLE_INBOUND_PROCESSING=0
PULSE_ENABLE_INBOUND_REPLIES=0
PULSE_ENABLE_INCIDENT_EMAIL=0
PULSE_ENABLE_METERED_RESEARCH=0
PULSE_ENABLE_COMMUNITY_WRITES=0
PULSE_ENABLE_DIRECTORY_WRITES=0
PULSE_ENABLE_REVIEW_OUTREACH=0
PULSE_ENABLE_REVIEW_RESPONSES=0
PULSE_ENABLE_EARNED_MEDIA_OUTREACH=0
PULSE_ENABLE_PARTNERSHIP_WRITES=0
PULSE_ENABLE_DEMAND_RESPONSE_WRITES=0

# Granular Resend management switches.
PULSE_ENABLE_RESEND_TOPIC_WRITES=0
PULSE_ENABLE_RESEND_AUDIENCE_WRITES=0
PULSE_ENABLE_RESEND_SUPPRESSION_LIFT=0
PULSE_ENABLE_RESEND_BROADCAST_DRAFTS=0
PULSE_ENABLE_RESEND_WEBHOOK_WRITES=0
PULSE_ENABLE_RESEND_DOMAIN_WRITES=0

# Values are private and never echoed or copied into state.
PULSE_INCIDENT_EMAIL=
DATA_FOR_SEO_LOGIN_PASSWORD=

# Required, non-secret DataForSEO scope and hard ceilings.
PULSE_DATAFORSEO_LOCATION_CODE=2840
PULSE_DATAFORSEO_LANGUAGE_CODE=en
PULSE_DATAFORSEO_RUN_REQUEST_CAP=200
PULSE_DATAFORSEO_RUN_HARD_USD=2.00
PULSE_DATAFORSEO_MONTH_HARD_USD=10.00
PULSE_DATAFORSEO_RUN_RESERVATION_USD=1.80
PULSE_DATAFORSEO_MONTH_RESERVATION_USD=9.00

# Exact property identifier returned by the official Search Console connection.
PULSE_GSC_PROPERTY=
```

The monetary and request values may narrow, never increase, the repository contract. The DataForSEO credential remains the existing base64-encoded `login:password` value. The incident recipient is the approved monitored address and never appears outside this private file or its sealed notification perimeter.

## Parallel activation ownership

Tommaso completes only irreducibly human steps:

1. independently reviews/approves repository PRs;
2. completes Typefully's interactive credential setup and selects the personal Skills Board social set;
3. completes Resend secure-profile login and any provider account enrollment;
4. places or rotates private secrets directly in an approved sealed sink when no safe official operation can do so;
5. connects OAuth/DNS/provider accounts or supplies verification only after the Pulse reports the exact setup contract;
6. supplies the public postal identity in the private email configuration;
7. performs Product Hunt, Hacker News, and other explicitly human-only platform actions.

The Pulse concurrently owns contract/app PRs, consent and suppression implementation, provider readback and deterministic resource reconciliation, PostHog assets, GitHub PR/deploy lifecycle, Typefully and Resend operations after setup, SEO research, pSEO, surveys, experiments, product/CRO changes, feature pruning, incidents, and all eligible `manual_action` packages. It never serializes independent setup merely because one lane is blocked.

## Operation matrix

### PostHog production control plane

- **Bootstrap state:** reads `read_only`; writes `disabled` until reconciliation proves official authenticated plugin access to production project `225645`.
- **Setup:** connect the official PostHog plugin with only the scopes shown by its OAuth flow. No PAT, custom REST/HogQL client, private API, screenshot, database proxy, or local scorecard runner.
- **Identity/read check:** discover currently advertised plugin skills/tools; resolve organization/project; require project `225645`; read the existing dashboard, insight, flag, experiment, survey, error, and schema surfaces needed by the operation before writing.
- **Shadow:** create/update only a Pulse-owned, deterministic, non-exposed draft when the advertised lifecycle guarantees zero exposure and exact readback. Otherwise remain `read_only`.
- **Enable gate:** every mutation requires `PULSE_ENABLE_POSTHOG_WRITES=1` plus its exact switch: assets use `PULSE_ENABLE_POSTHOG_ASSET_WRITES`, flags and rollouts use `PULSE_ENABLE_POSTHOG_FLAG_WRITES`, experiments use `PULSE_ENABLE_POSTHOG_EXPERIMENT_WRITES`, and surveys use `PULSE_ENABLE_POSTHOG_SURVEY_WRITES`. Any flag, experiment, survey, or rollout additionally requires `PULSE_ENABLE_PRODUCT_EXPOSURE=1`; a flag-backed experiment requires both flag and experiment switches. Healthy production-only tracking, exact cohort/unit, preregistered definition hash, live-code flag-consumption proof, WIP/interference capacity, guardrails, and rollback remain mandatory.
- **Containment:** remove exposure before ending measurement; pause on broken measurement. Low/medium exposure may survive one heartbeat, never over 24 hours, during control-plane loss; high-risk exposure goes safe immediately. One measurement repair/relaunch is allowed; a second failure of the same architecture retires it.
- **Fallback:** only dependent PostHog actions become `unavailable`; independent channels continue. Ambiguous identity or effect is quarantined.

Team Activation and Retention are HogQL queries grouped by `properties.team_id`, never person properties. A user/team may enter several non-interfering experiments. The global limit is three concurrently exposed product/CRO experiments. Every experiment has immutable hypothesis, cohort, unit, primary metric, threshold/MDE, minimum units, separate `enrollment_window` and `maturity_window`, guardrails, rollback, result rule, risk, and interference keys. One unchanged extension is eligible only with healthy non-decisive measurement and an unmet unit floor or an estimate still crossing success; it adds one enrollment window and changes no treatment, cohort, unit, metric, threshold, risk, or rule. The absolute deadline is `2 * enrollment_window + maturity_window`, then adoption or retirement releases the slot. A 50/50 split is eligible only when baseline, MDE, unit, power, and window prove meaningful samples per arm; otherwise use a bounded evidence-sized cohort.

Surveys are structured single choice, multiple choice, rating, or binary only. No open text is enabled until the plugin advertises a safe provider-side summary/read. At most two surveys are live with non-overlapping cohorts; a survey treatment also consumes an experiment slot. One opportunity/decision, at most three questions/about 60 seconds, relevant-action trigger, non-blocking and dismissible, never on auth/error/critical flows. One new survey per user per 14 days; answer/dismiss permanently suppresses it and starts a 30-day global cooldown; one ignored survey may reappear once after 14 days and is then permanently suppressed. Broken exposure/denominator measurement pauses it as `measurement_failure`. In-product research does not require email consent but honors the global in-product research opt-out; email invitations require `product_communications` and the email/research attention caps.

### GitHub and Vercel

- **Bootstrap state:** authenticated reads `read_only`; repository PR writes become `enabled` after contract reconciliation. Vercel remains read-only in v2.
- **Identity/read check:** `gh auth status`, authenticated user, repository owner/name, default branch, clean/fast-forward checkout, open PRs, reviews, threads, checks, and branch protection; then resolve the linked Vercel project/scope, production deployment, and production Git SHA through official reads.
- **Shadow:** local branch, tests, typecheck where relevant, local smoke test, secret/diff inspection. Vercel previews are protected and are not the smoke-test dependency.
- **Enable gate:** `PULSE_ENABLE_GITHUB_WRITES=1`, no overlapping exact `resource_key`; at most three general Product/Growth PRs and one separate pSEO PR. A verified critical protective repair may minimally exceed the relevant PR cap only to restore a merged invariant or contain an incident. New branches start from the synchronized default tip. Updating an existing Pulse-owned PR may switch only to its fetched exact head after a clean-checkout, default-base, head/ownership/resource-key, and no-unrelated-divergence verification; never restore an arbitrary former branch.
- **Effect:** create `codex/gtm-<slug>`, commit, push, open/update a coherent reversible PR, address review findings, and mark ready when green. Never self-approve or bypass protection. Merge only after independent approval and required green checks.
- **Containment:** no direct Vercel mutations in v2. Rollback is feature-flag containment first when available, then a GitHub rollback/fix PR through the same approval/check/deploy lifecycle. Monitor production deployment and SHA after merge.
- **Fallback:** a pending PR blocks only its exact resource key; unrelated work continues.

### Typefully, LinkedIn, and X

- **Bootstrap state:** `setup_required` until the official global configuration and intended social set pass readback; then reads `read_only`, drafts `shadow`, publication `enabled` only after gates.
- **Human setup:** from the installed skill, run interactive `node .agents/skills/typefully/scripts/typefully.js setup`, choose global storage and the personal social set that contains the intended LinkedIn and X accounts, then set `~/.config/typefully/config.json` to `0600`.
- **Process isolation:** every invocation strips inherited `TYPEFULLY_API_KEY`. Fail if `config:show` reports an environment or project-local source, if the global file is not active, or if identity/social-set/platform/quota readback differs.
- **Read/shadow check:** `config:show`, `me:get`, `social-sets:list/get`, draft/queue readback, and quota. Private drafts require `PULSE_ENABLE_TYPEFULLY_DRAFTS=1`. `queue:schedule:put` is always ineligible.
- **Enable gate:** `PULSE_ENABLE_SOCIAL_PUBLISH=1`, exact shipped-product evidence, final copy/language/link/media preview, provider quota, rolling caps/cooldowns, deterministic draft/live IDs, and containment. The first scheduling lifecycle test is a real eligible Skills Board post; it requires both draft and publish switches and consumes normal caps. Never publish a dummy.
- **Policy:** only Skills Board and shipped features. LinkedIn is Italian; X is English. Rolling 7d: seven shared editorial units, three LinkedIn, seven X; cross-post consumes shared and each platform slot; gaps 24h LinkedIn and 12h X. Scheduled/ambiguous effects reserve capacity. No minimum.
- **Replies:** scheduled Pulse runs have no autonomous public-reply budget in v2. An X reply is eligible only as a separate bounded user-directed action when Tommaso explicitly supplies the exact supported URL. LinkedIn public replies remain unsupported. If a permitted read finds an unsupported comment, a bounded no-tools sanitizer must produce a non-instructional paraphrase before agent context or the item is `unavailable`. Store `reply_needed` with platform, URL/stable ID, parent post, sanitized paraphrase, reason, and language-correct suggestion; never raw comment text or autonomous publication. Deduplicate by platform+ID/hash, show ordinary items once, treat factual/privacy/security issues as urgent, and limit sensitive-topic copy to a prudent acknowledgement plus handoff.
- **Containment:** cancel/delete a scheduled draft before publication. Because public deletion may be unavailable, irreversible publication requires just-in-time preflight; a factual/safety mistake triggers correction/incident handling, never a blind duplicate.

### Resend secure management plane

- **Bootstrap state:** `setup_required` until the named secure profile passes identity/domain reads. Each management operation then starts `read_only` and needs its own switch.
- **Human setup:** use macOS secure storage interactively:

  ```sh
  env -u RESEND_API_KEY RESEND_CREDENTIAL_STORE=secure_storage \
    resend --profile skillsboard-gtm-pulse auth login
  ```

- **Every command:** prefix `env -u RESEND_API_KEY RESEND_CREDENTIAL_STORE=secure_storage` and pass `--profile skillsboard-gtm-pulse`. Never use file credential storage or put a key on the command line/transcript.
- **Safe identity:** local `whoami`, `doctor`, profile list, and non-PII domain/webhook/topic metadata only. No read may expose contacts, addresses, subjects, bodies, headers, attachments, suppression rows, sent/received content, or content-bearing logs to agent context.
- **Sealed-read prerequisite:** `contacts`, `suppressions`, sent/received email, and content logs remain `unavailable` until a server-side sealed bridge returns only aggregate counts, keyed hashes, booleans, and opaque IDs. The app database is canonical for consent/eligibility; provider bounce, complaint, unsubscribe, and suppression can only tighten it.

Management switches are exact:

| Operation | Required switch | Additional rule |
|---|---|---|
| Create/read versioned topic metadata | `PULSE_ENABLE_RESEND_TOPIC_WRITES` | Exact `product_communications`, immutable default `opt_out`; wrong definition creates a new version. |
| Create frozen audience/segment | `PULSE_ENABLE_RESEND_AUDIENCE_WRITES` | Exact campaign-only segment; audience is frozen minus later suppressions. |
| Lift eligible suppression | `PULSE_ENABLE_RESEND_SUPPRESSION_LIFT` | Fresh verified opt-in plus sealed canonical/provider readback; never complaint/hard bounce; no blind batch. |
| Create/delete broadcast draft | `PULSE_ENABLE_RESEND_BROADCAST_DRAFTS` | Exact segment and topic; API-created only. |
| Create/update/disable webhook | `PULSE_ENABLE_RESEND_WEBHOOK_WRITES` | Signed endpoint and sealed signing-secret sink. |
| Domain/receiving metadata mutation | `PULSE_ENABLE_RESEND_DOMAIN_WRITES` | No opportunistic MX change; DNS/account step remains human when required. |

Resend suppressions are provider/account capability-gated; the Pulse first discovers availability. A complaint or hard bounce is never lifted. Manual unsubscribe, manual suppression, or deletion suppression may be lifted only after a fresh verified opt-in and per-record sealed readback. Never bulk-remove without proof for every opaque record.

### Transactional, proactive, and broadcast email

Transactional messages use the separate application identity, remain necessary to a requested service action, need no marketing opt-in, consume no proactive cap, and do not delay proactive communication. Existing application sending is not a Pulse management credential.

Proactive email is English from `Tommaso from Skills Board <tommaso@skillsboard.sh>` and uses the one `product_communications` topic for activation guidance, updates/newsletters, research, review requests, and survey invitations. The signup choice is optional and unchecked; Settings provides the same choice and immediate opt-out. Proactive email stays `setup_required` until the public postal identity is privately configured and rendered-footer readback, reason-for-contact, opt-out, app consent, and suppression checks all pass. `PULSE_ENABLE_PROACTIVE_EMAIL=1` never bypasses those gates.

Attention caps are: days 0–14, at most three activation interventions across email/survey/modal/banner/nudge, 48h apart, at most two for one incomplete milestone, and no updates/survey invitations; day 15+, one proactive email/rolling 7d, two interventions overall/rolling 7d, 48h apart; a survey invitation gets one additional email slot/30d but still fits the overall attention cap. Recheck relevance immediately before effect.

Every individual send freezes intent, logical key, payload hash, opaque recipient, dry-run result, and deterministic idempotency key. The retry window is 24h: at most three identical-payload retries, only for network failure, 429, 500, or concurrent-idempotency response. Other 4xx/conflicts never retry. After 24h without a provider ID, mark `delivery_ambiguous`, consume cap/cooldown, and do not resend.

A Broadcast requires an exact non-reused segment plus exact topic. Dry-run, create an API draft, perform just-in-time preview/target/reply-to/suppression/footer/cap checks, then send. Wrong target, topic, reply-to, or preview requires delete/recreate before send. Dashboard-created Broadcasts cannot be API-sent. Native scheduling is ineligible; the Pulse sends just in time. Uncertain state is reconciled by known opaque ID, never recreated by name.

### Inbound Resend webhook

- **Bootstrap state:** `setup_required` until the signed path and sealed secret placement pass; inbound is never polled/read through the CLI.
- **Setup:** a repository PR adds signature-before-body validation and a sandboxed handler. `email.received` enters only through the signed webhook. The one-shot signing secret may flow only directly from create response to a sealed Vercel secret sink without model/log/stdout exposure. Persist only the webhook ID. If sealed capture fails, immediately disable/delete that webhook and recreate it; never adopt a webhook by name.
- **Shadow:** local tests use a test-only secret and prove invalid/replayed/oversized signatures fail, HTML/history/attachments are stripped or quarantined, raw bodies are discarded after bounded extraction, and untrusted content has no tools, secrets, files, network, or send authority.
- **Enable gate:** verified production endpoint, replay defense, provider ID readback, loop suppression, bounded classifications, and `PULSE_ENABLE_INBOUND_PROCESSING=1`. An automatic reply additionally requires `PULSE_ENABLE_INBOUND_REPLIES=1` and an unaffected healthy send path. Do not change MX opportunistically.
- **Allowed replies:** one factual acknowledgement/feedback answer/public-product answer/non-sensitive bug clarification without ETA/unsubscribe confirmation per message, at most two per thread/7d. Unknown sender gets at most one when sender authentication is reliable. No reply-all or attachments.
- **Human handoff:** legal, security, privacy, account/data, roadmap/ETA, contracts, partnerships, press, disputes, abuse, attachments, or external-action requests.
- **Retention:** durable provider event ID/type/time/hash and pseudonymous metadata only; raw content discarded; pseudonymous metadata 90d; unknown encrypted reply address in a separate sealed store through closure+30d; aggregate non-PII evidence 12 months. Provider retention is not duplicated locally.

### Consent and suppression implementation

- **Bootstrap state:** repository implementation `shadow` until its independently approved PR is deployed; proactive exposure remains disabled.
- **Canonical model:** app DB stores account-linked consent and immediate opt-out for `product_communications`; schema-v4 stores no identity. Provider state only tightens eligibility.
- **Enable gate:** unchecked signup control, Settings control, policy-versioned evidence, transaction-safe opt-out, deletion behavior, sealed provider sync/readback, footer, privacy disclosure, and tests all pass in production.
- **Deletion:** remove profile, audience membership, message linkage, and usable consent. The control plane may retain only keyed HMAC(normalized email), channel/topic/reason/time/policy version, and opaque provider reference. Unsubscribe, complaint, hard bounce, and deletion suppression persist while the channel exists. Fresh opt-in may supersede unsubscribe/manual/deletion only; never complaint/hard bounce. Minimal affirmative-consent evidence expires three years after withdrawal/expiry absent another obligation.
- **Containment:** a broken consent/unsubscribe path is SEV1; pause proactive sends, cancel future effects, and repair via PR. Never bypass with one-to-one sends.

### Search Console and DataForSEO

- **Search Console:** `read_only`. Tommaso connects the official integration only if missing; `PULSE_GSC_PROPERTY` must exactly match official readback. No scraped UI, screenshots, or unofficial client. Missing access makes only Search Console fields unavailable.
- **DataForSEO:** `disabled` unless credential, location, language, caps, `PULSE_ENABLE_METERED_RESEARCH=1`, and included-quota reserve all pass. It is optional enrichment, never a prerequisite for qualitative research.
- **Shadow/read check:** validate credential presence without decoding/printing, market/language, provider availability, and account/quota metadata through a non-content official read when available. Before each metered call reserve worst-case cost atomically.
- **Caps:** USD 2/run, USD 10/Europe-Rome month, 200 requests/run; normal reservation ceilings USD 1.80/run and USD 9/month. Lost responses retain full reservation and are not blindly retried; unresolved reservations encumber the next month. Overrun pauses metered research; uncontrolled active spend is SEV0.
- **Fallback:** public SERPs, official docs, primary research, and attributable public signals continue. Missing values remain `unavailable`, never zero or inferred.

### Product/CRO, referral, and feature lifecycle

- **Bootstrap state:** research/read `read_only`; code work through GitHub; exposure requires both PostHog/product switches and all risk gates.
- **Setup/read check:** production measurement, `team_id`, internal/test exclusion, opportunity/evidence stage, eligible unit, interference registry, and rollback are mandatory. Product code must consume the exact deployed flag before launch; otherwise create the PR and keep the experiment draft.
- **Rollout:** use the smallest evidence-sized exposure and normally progress directly after a bounded canary; an intermediate 50% rollout is used only when the eligible population makes it informative. Rollback removes exposure before measurement ends.
- **Feature lifecycle:** baseline user-perceivable capabilities prospectively; day 7/14 checks, decision by day 28 for frequent or justified day 56 for episodic; one instrumentation repair; exactly one second opportunity window; hard decision after two mature windows; 14-day post-removal monitor.
- **Referral:** same-team invitation remains user-triggered transactional. New-team referral is a flag-backed in-product prompt after genuine value, one/user/30d, no reward/autosend/DM; no initial email, later email at most one/90d with consent. Opaque link, first valid attribution 30d, no overwrite, exclude self/same-team/internal/anomalous. Run 28d plus one 28d extension. One activation is feasibility, three independent activations promising; >=30 exposures/zero shares is `no_trigger_fit`; >=10 visits/zero activated teams is `no_activation_value`; below both after extension is `insufficient_sample` and closes.
- **Containment:** dismissal, complaint, abuse, measurement failure, and core-activation harm pause/rollback. High-risk net-new work needs validated problem, risk-specific verification, safe reversible exposure, and causal or mature behaviorally corroborated value evidence; otherwise research/prototype only.

### pSEO

- **Bootstrap state:** qualitative research `enabled`; Search Console/DataForSEO fields independently read-only/unavailable; publishing through the separate pSEO PR slot.
- **Enable gate:** exact `canonical_intent_id`/`problem_cluster_id`, current attributable evidence, unique utility, truthful shipped claims, canonical/metadata/internal-link/sitemap/indexation/measurement/rollback checks, and no overlapping cluster PR. Start at most one new pSEO PR per seven-day learning slot; it contains at most two pages from one problem cluster. At most four indexable experimental pages may lack a completed 14-day checkpoint.
- **Verification:** local smoke before PR; after deployment T+3 technical, T+7 discovery/intent, T+14 first decision, T+28 retain/expand/consolidate/noindex/retire. Two comparable 28-day misses pause the pattern.
- **Containment:** factual/product-contract error, privacy risk, broken route, accidental indexation, or canonical conflict triggers immediate exposure containment and a GitHub lifecycle PR. Missing quantitative data never blocks a bounded qualitative learning page.

### Communities, directories, reviews, earned media, launch sites

All operations begin `read_only` and require an exact allowlist plus official current rules/capability read. Each autonomous effect requires `PULSE_ENABLE_COMMUNITY_WRITES=1` plus its exact operation switch: community posts/replies use that master alone, directories use `PULSE_ENABLE_DIRECTORY_WRITES`, review solicitation uses `PULSE_ENABLE_REVIEW_OUTREACH`, public review replies use `PULSE_ENABLE_REVIEW_RESPONSES`, earned-media pitching uses `PULSE_ENABLE_EARNED_MEDIA_OUTREACH`, partnerships use `PULSE_ENABLE_PARTNERSHIP_WRITES`, and source-native demand response uses `PULSE_ENABLE_DEMAND_RESPONSE_WRITES`. If autonomous effect is unavailable but every other gate passes, emit an expiring same-cap `manual_action` with final target, evidence-backed copy/brief, identity, rule URL/check time, reserved cap, expiry, containment, and required result URL/ID.

- **Communities:** five first public contacts/rolling 7d; every top-level or first contextual reply consumes one; at most two top-level; Reddit at most one new post and 30d subreddit cooldown. Later replies only in an involved thread after a response. A post package expires in 7d and a reply package in 48h. After four clean measured weeks, one strategic run may raise the top-level ceiling once from two to three; three is the hard automatic ceiling and any further increase needs a contract PR. Reddit automation additionally needs a dedicated labeled Skills Board app account, official operation, rules permitting promotion and disclosed automation; otherwise manual. A Pulse-owned Reddit thread permits at most five bounded factual replies. No DMs, voting, warm-up, duplicate cross-posts, or invented personal story.
- **Passive directories:** up to five free new listings per strategic weekly queue, one/destination, real product/assets and relevant category only. Paid/backlink/reciprocity schemes are ineligible. Quarterly reconciliation; ambiguous submission is not retried.
- **Review solicitation:** one campaign; unbiased meaningful-user sample; 10 invitations/7d, one/user/180d, two/team/90d; neutral English, no incentive/rating/coaching/generated review. One reminder after 8d only with official no-review read and normal email cap. Evaluate at 30d: <30 delivered insufficient; 30–59/zero one correction no expansion; >=60 across one extension/zero retire.
- **Earned media:** one story; only public declared contact paths, no guessed/private/purchased/scraped/enriched addresses or automated forms. Five recipients/angle, two angles, ten first contacts/7d; one <150-word English value-add follow-up after four business days; 90d cooldown. Requires a separate compliant reply-capable mailbox; Resend and personal Gmail are prohibited. Until connected, eligible work is manual. Two angles/ten pitches with zero substantive replies retire the story.
- **Product Hunt/Hacker News:** publication is human-only. Recheck Product Hunt's official six-month and significant-update relaunch rules before launch. Product Hunt comments are facts-only handoff, never ready-made AI replies. Show HN requires live non-trivial product and a designated discussion window; it consumes community first-contact/top-level slots; title/factual brief may be prepared but submission and every comment remain human with no AI-written wording.
- **Demand prospecting:** unsolicited cold email/DM is ineligible. Source-native public response uses the five-contact community cap, one intervention per author/thread/30d, and no follow-up without a reply. Ten eligible interventions/30d with no substantive response permit one source/message iteration; twenty retire the angle for 90d. No personal contact/profile data in state.
- **Partnerships:** official programs/forms, inbound, permissioned introductions, or existing relationships only; no cold email. Score >=75/100, max three new proposals/strategic run, one follow-up after 10d, two simultaneous no-cost async units. Contracts, money, lead matching, exclusivity, roadmap promises, and trademark licenses are prohibited. One zero-activation unit permits one materially different unit; two live units across at least 60d with zero activation retire the partner for 180d.
- **Paid ads:** `policy_ineligible` until a merged strategy change establishes a revenue line.

## Incident and fallback contract

- **SEV0:** privacy/security risk, exposed secret, sensitive data to wrong recipient, or uncontrolled spend. Native/global or lane stop, remove exposure, preserve evidence, never auto-re-enable. Emit one deduplicated Codex Inbox alert plus idempotent transactional email to the private `PULSE_INCIDENT_EMAIL` only when `PULSE_ENABLE_INCIDENT_EMAIL=1` and that path is healthy and outside the incident.
- **SEV1:** materially false public claim, wrong audience, broken consent/unsubscribe, duplicate bulk send, cap breach, or harmful product regression. Inbox first; email is only a safe fallback and requires `PULSE_ENABLE_INCIDENT_EMAIL=1`. Pause affected perimeter, cancel future work, apply reversible correction.
- **SEV2:** typo, delay, isolated delivery failure, transient provider error. Idempotent repair and digest only.

“Immediate” means the detecting run/event processor. Deduplicate by `incident_id`; renotify only a material severity/scope/containment/residual-risk/resolution change. Never blindly retry an ambiguous alert: persist containment, mark `alert_delivery_unavailable`, and retry only through a newly verified path. No improvised legal notice or liability admission.

Operation fallback order is: contain harm; reconcile official state; continue independent trustworthy lanes; use `setup_required` for irreducible connection/configuration; use `unavailable` for a missing trustworthy capability; use `manual_action` only when the intervention otherwise passes every gate; otherwise exact `no_action`. Completion needs official readback or an explicit result URL/ID, never elapsed time or an assumption.
