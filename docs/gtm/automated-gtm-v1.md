# Skills Board — automated full-funnel GTM v1

**Date:** 2026-07-17
**Status:** Production PostHog read path API-validated; the router remains in Tracking QA until schema-v2 instrumentation is deployed and production data quality passes
**Primary outcome:** Grow retained teams by finding and removing the largest evidenced constraint across the whole funnel, not by optimizing one stage in isolation.

## 1. Executive decision

The GTM system is a full-funnel control loop:

1. A qualified team encounters Skills Board through a problem-led page, public recommendation, maintainer, champion, or direct visit.
2. A visitor expresses intent, creates an account, and starts a team library.
3. The team saves a useful skill, adds a teammate, and reaches shared value.
4. The team returns when another task appears and repeats access to shared recommendations.
5. A healthy team can create another team through a champion or an explicit referral path.
6. The system measures the cost and sustainability of that growth while preserving the free-forever product promise.

One weekly router reads every stage, validates the data, and selects at most one diagnostic. Acquisition scanning is conditional work, not a mandatory output when another stage is the constraint.

The strategy deliberately avoids competing as an enterprise registry or universal package manager. GitHub and vendor-native workspaces are strong distribution systems. Skills Board's wedge is narrower: **the team's own recommendations, visible source, and a choice of usage path across different agents.**

## 2. ICP hypothesis

This is a hypothesis to validate, not an established customer fact.

**Primary ICP:** teams of roughly 5–25 people inside 10–150 person companies that already use at least two of Claude, Codex, Cursor, Copilot, or similar agents. They have useful reusable skills, but recommendations still live in GitHub, Slack, documents, or personal setups.

**Initiator:** a hands-on engineering, product, or design lead; a technical founder; an internal AI champion; or an AI enablement lead.

**Demand triggers:**

- a second agent enters the team;
- a repository grows from one personal skill to several shared skills;
- new colleagues need to be onboarded into the team's AI practices;
- teammates repeatedly ask where a recommendation lives;
- an AI guild or enablement role is created;
- a public issue or discussion mentions sharing, syncing, discovering, or managing team skills.

**Anti-ICP:** teams requiring formal approval, pinning, rollback, SSO/SCIM, compliance governance, or forced installation; single-vendor teams already satisfied by their workspace marketplace; teams that do not yet reuse skills.

## 3. Positioning frame

**Category:** Shared AI skill library for teams.

**Claim:** Put the skills your team recommends somewhere everyone can find, then let each teammate choose the source, command, ZIP, or agent access path that fits their setup.

**Competitive posture:**

- Public catalogs are discovery inputs, not replacements.
- GitHub remains the source of truth, not an enemy.
- Vendor marketplaces are good when one vendor owns the whole workflow.
- Skills Board is useful when team judgment and agent choice need to coexist.

This posture reflects the market: GitHub supports multi-agent skill distribution, while OpenAI, Anthropic, and Cursor now offer workspace or team-level skill management. Skills Board should therefore lead with curation and cross-agent choice, not generic sharing or enterprise governance.

## 4. Growth model and full-funnel scorecard

`AAT-28` remains the North Star, but it is the result of the whole system rather than an Activation dashboard:

```text
AAT_t = new activated_t + retained_t + reactivated_t
ΔAAT = new activated_t + reactivated_t - lost_t

new activated = visitor-led non-referral activated
  + champion-led non-referral activated
  + explicitly referred activated

visitor-led non-referral activated = qualified non-referral visitors
  × signup-intent rate
  × signup-completion rate
  × team-creation rate
  × team-activation-14d rate

champion-led non-referral activated = eligible existing users without an explicit referral source
  × additional-team creation rate
  × team-activation-14d rate
```

An explicit referral source overrides visitor/champion classification, so each activated team belongs to exactly one growth path.

### North Star: Activated Active Teams, rolling 28 days (`AAT-28`)

An organization counts when it has at least two members, at least one saved skill, and a member other than that skill's creator selected a usage path or downloaded it in the last 28 days. The window matches the expected low-frequency cadence of a reusable skill library.

### Full-funnel scorecard

| Stage | Boundary | Leading indicators | Lagging indicator | Window and decision rule |
|---|---|---|---|---|
| Acquisition | Qualified anonymous visit → signup intent. Signup completion belongs to Activation. | Qualified landing visitors, anonymous `landing_cta_clicked`, `signup_form_submitted` with `signup_context=new_team`, qualified public demand signals. | Activated teams by first-touch and last non-direct source; referral and champion creation are reported separately. | Rolling 28d. Suspend a source only after at least 100 qualified sessions across eight weeks with no team start, or five mature team starts with no activation. Three activated teams authorize the next bounded test, not scaling. |
| Activation | Signup intent → first shared value. | Account completion, team creation, first skill ≤24h, invite ≤72h, acceptance ≤7d, non-creator usage-path selection ≤14d. | `team_activated_14d` and median time to activation. | Only cohorts with 14 full days of observation. Investigate when five mature teams produce zero activations or one step contains at least half of stalled teams in two checks. |
| Retention | Activated team → repeated access to shared recommendations. | `team_library_viewed`, teams approaching 21d without a value-action proxy, number of active members and recommendations accessed. | `AAT-28` new, retained, reactivated, and lost; period-1 retention. | Compare non-overlapping 28d periods; 56d maturity for first retention cohort. Prioritize when `lost > new + reactivated` or at least three mature teams are lost. |
| Referral | Healthy retained team → another team reaches shared value through an explicit referral source. | Eligible happy moments, referral ask viewed, referral link copied. Report organic champion replication separately as correlation, not referral attribution. | `referred_team_activated` and activated viral coefficient from explicit referral attribution only. | 56d from the first attributed referral visit, plus the 14d activation SLA from team creation; 60d ask cooldown. Start with five eligible teams; three activated referrals authorize the next bounded test. |
| Revenue / sustainability | Product usage → durable economic support. | Monthly cash infrastructure/tool cost, founder hours, GTM cash/time, explicit sponsorship/service/add-on demand. | Cash coverage, fully loaded cost per current `AAT-28`, and acquisition cost per new `AAT-28`. Current product revenue is explicitly €0. | Monthly cost check, quarterly model review. Undefined denominators remain `undefined`. Never use team growth as revenue or change the free-forever promise automatically. |

**Current Acquisition availability:** raw public visits, CTA intent, signup intent, and signup context are instrumented. The qualified-visitor denominator and source-to-activation attribution are `unavailable` until the qualification rule, internal/test exclusions, source taxonomy, and team-level attribution query in §11 are implemented. Until then, the router may report raw counts but must not apply source kill/scale thresholds or route an Acquisition experiment from those metrics.

**Current Retention availability:** the versioned query executes and its output schema is validated, but schema-v2 events cannot reconstruct activation milestones for teams that existed before deployment. It therefore returns `measurement_status=unavailable` and null decision metrics until a trustworthy database reconciliation, state snapshot, or backfill exists. Query execution `data_status=available` never overrides that stage-level status: the router must not calculate `AAT-28`, route Retention, or use dependent sustainability ratios from those nulls, while independent stages may still report.

### Activation milestone: `team_activated_14d`

A new team activates when, within 14 days of `team_created`, it completes:

`first skill saved → invitation accepted → non-creator selects a usage path`

This is a falsifiable hypothesis and must be tested against later retention. Because the path crosses multiple users, PostHog queries must group by `properties.team_id`; a standard person funnel by `distinct_id` is invalid.

### Measurement rules

- Exclude internal and test teams from every denominator.
- Use only mature cohorts: 14d for Activation and 56d for the first Retention read.
- `AAT-28` is rolling for the heartbeat. Its decomposition uses closed, non-overlapping 28d periods: `new` first activates in the current period; `retained` is active in current and previous; `reactivated` is active now, absent in the previous period, and active earlier; `lost` was active in the previous period and is absent now.
- Period-1 retention is `teams with a value-action proxy during days 29–56 after activation_at / activated teams with 56 complete days of observation`.
- Below 30 eligible teams, show absolute counts, the raw ratio, and interviews; do not make decisions from percentage movement alone.
- Open a diagnostic when a verified defect exists, the same issue affects at least three teams, or it repeats in two comparable windows.
- Once the attribution contract is implemented, it uses first touch, last non-direct, and referral override with a 30d acquisition lookback. Invitation-driven signup is team expansion, not new-team acquisition.
- `AAT-28` and activation are calculated with HogQL or an equivalent team-level query. A PostHog person funnel must not be used.
- No 90-day percentage target becomes a commitment until four weeks of trustworthy production data exist.

Sustainability formulas use separate cash and time views:

```text
cash coverage = recurring cash support or revenue / recurring cash infrastructure and tool cost
fully loaded cost per current AAT = (cash cost + founder hours × agreed rate) / current AAT
acquisition cost per new AAT = (GTM cash + GTM hours × agreed rate) / new AAT
```

If a denominator is zero, the result is `undefined`, never zero or infinity.

### Development database snapshot

Aggregate read-only snapshot from the shared Neon development database on 2026-07-17:

| Metric | Value |
|---|---:|
| Users | 8 |
| Teams | 4 |
| Teams created in the last 7 days | 4 |
| Teams with at least one skill | 2 |
| Teams with at least two members | 2 |
| Proxy-activated teams: skill + at least two members | 2 |
| Teams without a skill | 2 |
| Valid pending invitations | 2 |
| Median time to first skill | 0.05 hours, about 3 minutes |
| Median time to second member | 10.08 hours |

This tiny development sample may contain internal or test activity. It validates that the structural funnel can be queried, but it is not a PMF or growth baseline. Production data and an internal-team exclusion rule are still required.

## 5. Current state — scored from repository materials

The repository score below predates the first production PostHog API run. On 2026-07-17, all four aggregate pulse queries executed successfully, but the artifact-only dry run found five required event types with `schema_mismatch` and six missing event types in the current production sample. There is therefore still no trustworthy production growth baseline, budget, customer-interview corpus, or mature retention read. The development database snapshot above remains aggregate and directional only.

| Area | Score / 5 | Evidence-based note |
|---|---:|---|
| Positioning | 4 | Clear category, contract, differentiation, and vocabulary. |
| Customer research | 1 | Founder language is captured; no continuous interview or VoC practice is visible. |
| Homepage | 4 | Clear, focused, and aligned with the product contract. |
| Product pages | 2 | Landing, FAQ, README, and pricing section exist; use-case depth is limited. |
| Conversion pages | 0 | No high-intent use-case landing-page library yet. |
| Competitor comparison | 0 | No comparison pages. |
| Resources / content | 1 | Technical launch assets exist; no recurring content engine. |
| Onboarding | 2 | Team creation and first-skill empty state exist; activation was not measurable. |
| Email lifecycle | 1 | Transactional team invitation only. |
| Sales material | 0 | No approved case studies, proof, or sales kit. |
| Messaging | 4 | Detailed message hierarchy and honest vocabulary rules exist. |
| Pricing | 3 | Free-forever model is exceptionally clear; no paid packaging is intended. |
| CRO | 1 | Product analytics exists; no experiment cadence or activation baseline. |
| GTM launches | 2 | Open-source and launch foundations exist; no repeatable launch motion. |
| Ads | 0 | Appropriate at this stage; no paid acquisition should be added yet. |
| SEO | 2 | Technical SEO foundations exist; no problem-led content moat. |
| Internationalization | 0 | English-only and no regional GTM plan. |

**Total: 27 / 85.** The shape is strong positioning, homepage, and messaging with weak distribution, customer evidence, lifecycle, and measurement. Activation is the current working hypothesis, not a permanent priority. The first quarter should establish comparable evidence across every stage, then route work to the largest mature constraint.

## 6. AARRR plan

### Acquisition

**Outcome:** generate qualified signup intent from identifiable sources.

**Current bets:** problem-led pages for cross-agent team workflows; founder/maintainer distribution; a conditional public-signal scan; consultants and AI enablement champions as a multiplier ICP.

#### Problem-led programmatic SEO

Programmatic SEO is a bounded Acquisition diagnostic, not an automatic page factory. It targets adjacent team problems with a direct path to creating a shared library: sharing skills across different agents, standardizing reusable AI workflows, moving beyond scattered prompt libraries, capturing repeatable AI use cases, function-specific playbooks, and lightweight skill inventory or source-review practices. It does not default to individual-skill profiles, generic "AI tools" pages, generic AI news, or enterprise-governance claims.

The module has two mutually exclusive modes. A monthly read-only research appendix may run only after the router returns `no action` and while no diagnostic, experiment, PR, or human decision is open; it is not a second diagnostic and cannot edit code or open a PR. The operational diagnostic runs only when Acquisition is the single routed constraint. It uses `programmatic-seo` and `content-strategy`, with `seo-audit` before any draft PR. Inputs are the product-marketing contract, current routes and canonical intents, public SERPs, official vendor documentation, primary research, attributable public problem signals, Search Console when connected, downstream PostHog outcomes, and optionally DataForSEO.

DataForSEO is a future optional enrichment source, not a prerequisite for qualitative research. Until a bounded runner, server-only Basic Auth API login and API password, target market/language, explicit request and spend caps, and human approval for paid use exist, the DataForSEO source remains `unavailable` and no paid call is made. Quantitative fields are `search_volume`, source `monthly_searches`, `keyword_difficulty`, `google_ads_competition`, and `cpc`, each with status, source, market/language, and `as_of`; missing values are never zero or inferred. A `trend` is not derived until its formula, window, and series-completeness rule are versioned. Categorical `search_intent` is stored separately with evidence and confidence and may be inferred qualitatively from a current SERP; provider probabilities are optional enrichment, not demand evidence. Google Ads competition and organic keyword difficulty remain separate metrics.

Field availability is not proof of demand. Store `demand_gate=pass|fail|unavailable|broken` separately: a valid zero is available but cannot pass, and CPC, keyword difficulty, Google Ads competition, or search-intent classification never satisfy the gate. Only a human-approved, versioned rule over demand measures such as search volume, its monthly source series, or target-query Search Console impressions can pass. Until market/language, formula, comparison window, minimum completeness, and threshold are approved and versioned, the gate is `unavailable`; credentials alone do not enable autonomous pSEO PRs.

Each research run keeps at most 30 deduplicated seed queries and shortlists at most five opportunities. A `canonical_intent_id` combines normalized locale, audience/problem, and intent independently of format; candidates, existing canonical URLs, and open PRs are deduplicated on that ID before shortlisting. Every candidate must have a distinct intent, a natural `create a team library` conversion path, current attributable sources, differentiated utility such as an original comparison, workflow, checklist, template, or decision framework, product-contract-safe claims, no canonical overlap, and complete metadata, internal-link, sitemap, indexation, and supported-schema handling.

Qualitative evidence alone produces a report and one specifically named pilot recommendation, not an autonomous PR. Bind a human approval to `approval_key = canonical_intent_id + candidate_url + source_snapshot_hash`; any change invalidates it, and opening the PR consumes it. The approval overrides only the quantitative-demand requirement; every other global and module gate still applies. Autonomous implementation requires the operational Acquisition contract, every global routing/PR gate, and `demand_gate=pass`. It defaults to one page and has a hard maximum of three new indexable pages in one intent cluster. Merge and publication remain human-gated. After publication, evaluate a page over a complete eight-week window using indexation and Search Console query/page impressions for the target intent when available. Use page-specific CTA/signup intent only after a stable landing identifier such as `landing_path` and its query are implemented and validated; the current `landing_cta_clicked.location` describes the CTA surface, not the landing page. Use activated teams only after attribution is operational, and apply success or kill checks only to available page-attributable measures. Pause a pattern after two mature comparable misses and diagnose it before producing more.

**Measurement target:** normalized UTMs, anonymous landing CTA intent, signup context, and eventual activated teams by source. Raw intent is available now; qualified visitors and source-to-activation attribution remain unavailable until §11 is resolved. Scan public demand when the router selects Acquisition; the monthly pSEO appendix is allowed only after `no action` and with no open work.

**Not now:** broad paid acquisition, mass cold email, unsolicited commercial GitHub issues, or generic “AI tools” content.

### Activation

**Outcome:** move a completed signup to shared team value within 14 days.

**Current bets:** stable `team_id`, returning-user identity, a post-first-skill invite prompt, and honest usage-path events rather than install claims.

**Measurement:** mature cohorts through team creation, first skill, invite, acceptance, and non-creator usage, aggregated by team rather than person.

**Next only if routed:** classify no-team, no-skill, no-invite, pending-invite, and no-second-member-use stalls; expose one recovery at a time.

### Retention

**Outcome:** make shared skill reuse recur when new work appears.

**Current bets:** team-level library views, repeated non-creator usage-path selection, and `AAT-28` state transitions. Interview lost teams before designing lifecycle messaging.

**Measurement:** retained, reactivated, and lost teams across non-overlapping 28d periods, plus breadth of members and recommendations accessed. `team_value_action` is a proxy for accessing or selecting a usage path, not proof of installation or agent execution.

**Not now:** noisy weekly email. Any digest or win-back requires consent, suppression, an unsubscribe path, and evidence that absence represents churn rather than normal low-frequency use.

### Referral

**Outcome:** turn retained value into another activated team.

**Current bet:** first measure `organic_champion_replication` — an invited teammate later creates and activates a different team. This is a useful correlation, not referral attribution. Add an explicit referral source only after the replication signal exists.

**Measurement:** report organic champion replication separately. For an explicit referral path, measure eligible happy teams, asks, copies, attributed teams created, and `referred_team_activated`; referral attribution overrides generic UTM attribution.

**Guardrail:** ask only after activation plus later multi-member use; never inspect contacts or send to third parties automatically.

### Revenue / sustainability

The hosted product remains free forever and currently has no revenue conversion. The framework must show that explicitly rather than relabeling team growth as Revenue.

The operating question is whether the free product is sustainably funded. Track aggregate Vercel, Neon, Resend, and founder-time cost per `AAT-28`, alongside explicit inbound interest in sponsorship, grants, services, or optional add-ons that do not break the core promise. Any business-model or pricing decision is quarterly, founder-owned, and never automated.

## 7. Automation rollout

Keep one scheduled automation. It is a full-funnel sensing and routing layer, not five independent agents competing to create work.

### Executable read contract

Every pulse must first run `pnpm gtm:pulse:data`, then consume only `.agents/loops/skillsboard-gtm-pulse-data.json`. The router may proceed only when the file is fresh, schema-valid, and has top-level `status=ready`. Each query carries `data_status=available|unavailable|broken`: a valid zero is `available`; missing credentials, definitions, or sources are `unavailable`; failed, stale, partial, or malformed results are `broken`. Query availability covers execution and schema validation only; stage-level `decision_status` and `measurement_status` still determine whether a metric may enter routing. The router never estimates missing values, queries PostHog ad hoc, or substitutes DB or dashboard proxies.

Event ingestion and metric reading use different PostHog credentials. `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` with `NEXT_PUBLIC_POSTHOG_HOST` only sends events. Read-only execution requires server/local-only `POSTHOG_PERSONAL_API_KEY` with minimum `Query Read`, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_HOST`; optional `POSTHOG_DEPLOYMENT_ENVIRONMENT` is allowlisted to `production` (default), `preview`, or `development`. The Personal API Key must never be exposed to the client, stored in the generated JSON, or committed.

The automation is not live merely because it is scheduled. The production credentials, runner call, artifact validation, and first artifact-only dry run were completed on 2026-07-17. That dry run correctly produced Tracking QA only: the deployed production events do not yet satisfy the schema-v2 and semantic coverage contract in this branch. Growth routing remains gated until a post-deploy run passes those checks and internal/test exclusion exists.

### Loop 0 — Full-funnel router and tracking QA

- **Check cadence:** Monday 09:00 Europe/Rome and after relevant analytics changes.
- **Acts when:** Always refreshes the scorecard; opens a diagnostic only when data is trustworthy, a decision threshold is met, and no diagnostic, implementation, experiment, or overlapping PR is already open. A directly evidenced repository-fixable Tracking QA defect may route only a tracking-repair PR.
- **Purpose:** Show the whole growth system and choose the single highest-leverage evidenced constraint.
- **Skills used:** analytics, marketing-plan, marketing-loops, plus the selected stage skill only after routing.
- **Body:** run `pnpm gtm:pulse:data`; validate and consume only the generated JSON; calculate all five scorecard rows and `ΔAAT` from `available` values; exclude unavailable, broken, or immature stages; route a verified product defect first; route Revenue/sustainability next only for a proven cost-cap breach or due quarterly review after its self-check passes; otherwise apply downstream health gates before Acquisition scaling and select among eligible growth stages by absolute teams affected and strength of evidence. Revenue/sustainability never enters the team-count comparator.
- **Self-check:** environment and internal/test filters, stable windows, no duplicates, cross-user metrics grouped by `team_id`, cohort maturity, source freshness, and sample size.
- **State / idempotency:** schema version, last successful run, metric snapshots, per-stage status, one open diagnostic, one in-flight experiment, one open pulse PR, pending human decisions, signal hashes, and cooldowns.
- **Stop / bail-out:** broken or stale data makes Tracking QA the only action. No owner means no experiment. Four unanswered weekly recommendations pause action modules; the heartbeat may continue monthly.
- **Output:** five AARRR rows, `ΔAAT`, cohort `n` and maturity, data quality, one routed constraint, its owner, the next success check, and—when implementation qualifies—the draft PR URL plus verification and revert checks.

### Controlled implementation and PR gate

The pulse may implement only its single routed constraint. Eligible work is a repository-fixable product or Tracking QA defect proven by source inspection plus a reproducible check, one bounded experiment whose data, maturity, threshold, ownership, and concurrency gates all pass, or one routed problem-led pSEO candidate with `demand_gate=pass` that passes every global and dedicated gate. A specifically named one-page qualitative pSEO pilot is eligible only while its exact, unconsumed approval key is recorded in state; that approval overrides only the quantitative-demand gate. Broken Tracking QA blocks growth implementations and permits only a directly evidenced tracking repair.

Before editing, the pulse requires a clean checkout on the synchronized repository default branch and no overlapping local-state or GitHub PR. It creates a `codex/gtm-<slug>` branch, makes one small reversible change, adds focused tests, and runs relevant tests, typecheck, and proportionate build or browser verification. A different base branch, failed verification, unrelated changes, or suspected secrets stop the workflow before push.

After verification it may commit, push, and open a **draft** PR containing the aggregate evidence, routed metric and window, root cause, scope, tests, observation window, success check, and kill/revert check. It records the PR in non-PII state so later runs update instead of duplicate it. The pulse never marks its PR ready, approves, merges, deploys, or directly changes production configuration. Auth, authorization, billing, secrets, destructive migrations, pricing, the free-forever promise, outbound communication, spend, and production configuration remain human-gated.

### Diagnostic modules — dormant until routed

These are one-shot branches of Loop 0, not independent scheduled loops. They inherit its cadence, QA, single-open-diagnostic rule, human checkpoint, state, and stop conditions. The detailed per-module procedure and state keys live in `.agents/loops/skillsboard-gtm-pulse.md`.

| Module | Check and trigger | Output | Key stop condition |
|---|---|---|---|
| Acquisition | Weekly scorecard; public scan only when Acquisition is selected. A monthly pSEO research appendix may run only after `no action` with no open work. The pSEO branch may maintain 30 deduplicated seeds and shortlist at most five opportunities. | One channel/content hypothesis; one named pSEO pilot recommendation when demand is unproven; or one pSEO draft PR with one page by default and at most three pages after the implementation gates pass. | Qualification or attribution gaps block growth conclusions; any `demand_gate` other than `pass` blocks autonomous pSEO implementation but not qualitative research; no unique value, intent overlap, thin content, or failed SEO/verification gates block the PR. |
| Activation | Weekly at current volume; stalled mature cohorts or a verified product defect. | One step-level diagnosis and one bounded in-product experiment. | Tracking gap, active cooldown, unresolved bug, or two failed nudges. |
| Retention | Weekly snapshot, monthly diagnosis after a mature cohort exists. | One cause candidate supported by usage and an interview/research plan. | Cohort not mature, normal low-frequency behavior not ruled out, or outage/event change. |
| Referral | Monthly and dormant until happy moments exist. | One in-product ask or case-study draft for human review. | Team not healthy, no referral attribution, no consent, or 60d cooldown. |
| Revenue / sustainability | Weekly digest shows the latest monthly snapshot with `as_of`; route only on a cost-cap breach or during the quarterly review. | Separate cash coverage, fully loaded cost, acquisition cost, and explicit economic-demand signals. | Incomplete costs; it never competes by “teams affected”; any pricing, spend, or free-forever change always escalates. |
| Experiment / learning | Only after a human accepts the routed diagnostic. | One hypothesis, owner, success check, result, and postmortem. | Never start while another experiment is in flight. |

No module sends, publishes, spends, merges, deploys, changes production directly, or stores raw PII. An eligible module may prepare one reviewable draft PR; a loop earns continued operation only when its output produces a decision and a verifiable learning.

## 8. 30 / 60 / 90 day roadmap

| Window | Outcome | Work |
|---|---|---|
| Days 0–30 | Trust the full-funnel board | Already shipped locally: URL sanitization, acquisition-intent and team-return events, read-only PostHog query access, per-query availability states, and an artifact-only router dry run. Remaining: deploy schema v2, validate production payloads until Tracking QA passes, and define attribution plus internal/test exclusion. |
| Days 31–60 | Diagnose the real constraint | Observe mature cohorts; interview target users, stalled teams, or lost teams according to the routed stage; run exactly one report-only diagnostic; instrument Referral or sustainability only if its prerequisite signal exists. |
| Days 61–90 | Prove one intervention and one learning | Ship one bounded experiment on the selected stage; measure the stage-appropriate leading result and schedule its mature read; keep, revise, or kill only when the observation window closes; publish a postmortem; make an explicit sustainability-model decision without changing the free product by default. |

## 9. RACI and operating constraints

| Work | Automation | Founder / human owner |
|---|---|---|
| Full-funnel read, QA, score, draft, and report | Responsible | Accountable |
| Select one diagnostic from evidenced constraints | Recommends | Approves priority and owner |
| Bounded repository implementation | Creates tested branch, commit, and draft PR when gates pass | Reviews, marks ready, merges, and deploys |
| Positioning and creative direction | Support | Responsible and accountable |
| Public replies, outreach, publishing | Draft only | Approves and sends |
| Product nudges | May prepare a draft PR after QA and bounded rules | Approves experiment, merge, and deployment |
| Email sends | Disabled until compliance foundation | Approves audience, copy, and send |
| Spend or budget movement | Disabled | Responsible and accountable |
| Pricing, monetization, or free-forever changes | Disabled | Responsible and accountable |

Global kill switch: pause the scheduled Codex automation. Product lifecycle automation must also have its own environment-level disable flag before launch.

## 10. Full-funnel measurement contract

Every PostHog event includes `analytics_schema_version` and `deployment_environment`. Team-scoped events carry `team_id`. No raw invited email, team name, invitation capability token, or full repository URL is sent in custom event properties.

Instrumentation status is not query availability. The browser-safe project token proves only that the app can ingest events. The executable read contract in §7 is API-validated, but its initial production artifact exposes legacy and missing event semantics. No PostHog-derived growth metric is decision-ready until Tracking QA passes after schema-v2 deployment.

| Stage | Event or derived metric | Required properties / rule | Status |
|---|---|---|---|
| Acquisition | `$pageview` | PostHog automatic pageview on non-sensitive routes with a sanitized URL; only allowlisted UTMs remain. Invite, auth, and consent pageviews are dropped in both PostHog and Vercel Analytics. | Implemented |
| Acquisition | `landing_cta_clicked` | `location`, `destination`, `visitor_state`; Acquisition filters `visitor_state=anonymous`. | Implemented |
| Acquisition | `signup_form_submitted` | `method`, `signup_context=new_team\|team_invitation`; invitation signup is not new-team acquisition. | Implemented |
| Activation | `user_signed_up` | `method`, `signup_context=new_team\|team_invitation`; measures completion after signup intent. | Implemented |
| Acquisition | qualified visitors and activated teams by source | Written qualification rule, internal/test exclusion, normalized source taxonomy, 30d first-touch/last-non-direct query, and referral override. | Unavailable until §11 |
| Activation | `team_created` | `team_id`, `creation_surface=onboarding\|in_app`. | Implemented |
| Activation | `skill_saved`, invite prompt, `team_member_invited`, `invitation_accepted` | Existing semantic properties plus stable `team_id`. | Implemented |
| Activation / Retention | `skill_usage_path_selected`, `skill_downloaded` | `team_id`, skill metadata, `method`, `surface`, `actor_is_skill_creator`; union as the `team_value_action` access proxy, not proof of installation. | Implemented |
| Retention | `team_library_viewed` | `team_id`, `skill_count`, `has_skills`, `filter_state`; one event per mounted route-state transition, including search/tag navigation, with same-route skill mutations deduplicated while mounted. | Implemented |
| Retention | `AAT-28` states | HogQL grouped by `team_id`, never a person funnel; fail closed until historical activation is reconciled. | Query implemented; measurement unavailable |
| Referral research | `organic_champion_replication` | Invited user later creates and activates a different `team_id`; correlation only, not referral attribution. | Query required |
| Referral | ask/copy/create/activate events | Add only after a referral surface exists; optimize for `referred_team_activated`. | Planned, gated |
| Revenue / sustainability | cash coverage, fully loaded cost per current `AAT-28`, acquisition cost per new `AAT-28` | Aggregate Vercel, Neon, Resend, GTM spend, and founder-time inputs; not user events. | Data connection required |

Client analytics drops pageviews for invite, auth, consent, and Better Auth routes; recursively removes sensitive property keys; retains only allowlisted UTM query parameters elsewhere; disables exception capture, session replay, and generic autocapture; and respects Do Not Track. Vercel Analytics applies the same sensitive-route exclusion and URL sanitizer. Client and server events share the build-time `NEXT_PUBLIC_ANALYTICS_ENVIRONMENT` value. Server-side analytics is fail-open so analytics failure cannot convert a successful product mutation into a user-visible error. Consent, retention, and internal-user policy remain launch blockers rather than assumptions.

## 11. Open decisions

1. Production scorecard baseline across Acquisition, Activation, Retention, Referral, and sustainability. The development snapshot is not sufficient.
2. Internal/test team allowlist or property for every denominator.
3. Qualified-visitor rule plus first-touch, last non-direct, referral override, normalized UTM source taxonomy, and team-level attribution query.
4. Consent, opt-out, data-retention, deletion, and internal-user policy for product analytics; unsubscribe/suppression before lifecycle email.
5. Marketing cash budget, founder-time valuation/cap, and explicit owner for the weekly review.
6. Deploy schema-v2 analytics, then repeat the production artifact dry run until semantic coverage, environment, `team_id`, freshness, and internal/test exclusion checks pass.
7. Whether the primary acquisition surface is English only or also Italian.
8. Whether consultant-created libraries are the primary multiplier ICP or a separate use case.
9. Sustainability mode for the next 12 months: intentional public good, sponsorship/grants, services, or optional add-ons that preserve the free core.
10. Whether to connect Search Console and optional DataForSEO server-only API credentials, target market/language, and approved per-run spend cap; until then quantitative pSEO fields remain `unavailable`.

## 12. Reference points

- [GitHub Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [GitHub CLI skill management](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)
- [DataForSEO API authentication](https://docs.dataforseo.com/v3/auth/)
- [DataForSEO Google Ads keyword data](https://docs.dataforseo.com/v3/keywords_data-google_ads-overview/)
- [OpenAI workspace skill sharing](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)
- [Claude organization skill provisioning](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)
- [Cursor team product and marketplace](https://cursor.com/pricing)
- [PostHog group analytics](https://posthog.com/docs/product-analytics/group-analytics) — useful later, but a paid add-on; v1 uses a stable `team_id` event property instead.
