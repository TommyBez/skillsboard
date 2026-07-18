# Skills Board — automated full-funnel GTM v1

**Date:** 2026-07-17
**Status:** Official PostHog plugin-first autonomous control loop; production Tracking QA remains incomplete
**Primary outcome:** Grow retained teams by finding and removing the largest evidenced constraint across the whole funnel, not by optimizing one stage in isolation.

## 1. Executive decision

The GTM system is a full-funnel control loop:

1. A qualified team encounters Skills Board through a problem-led page, public recommendation, maintainer, champion, or direct visit.
2. A visitor expresses intent, creates an account, and starts a team library.
3. The team saves a useful skill, adds a teammate, and reaches shared value.
4. The team returns when another task appears and repeats access to shared recommendations.
5. A healthy team can create another team through a champion or an explicit referral path.
6. The system measures the cost and sustainability of that growth while preserving the free-forever product promise.

One weekly router reads every stage, validates the data, selects at most one primary diagnostic, and executes the next bounded action. Acquisition scanning is conditional work, not a mandatory output when another stage is the constraint. Active experiments and rollouts receive a separate daily monitor.

The system is autonomous by default. It may operate connected GTM tools, run experiments, send or publish inside configured caps, and repair its own analytics assets without per-action approval. The only human checkpoint is independent approval of a repository PR; after approval and green checks, the pulse may merge and monitor deployment.

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
| Revenue / sustainability | Product usage → durable economic support. | Monthly cash infrastructure/tool cost, founder hours, GTM cash/time, explicit sponsorship/service/add-on demand. | Cash coverage, fully loaded cost per current `AAT-28`, and acquisition cost per new `AAT-28`. Current product revenue is explicitly €0. | Monthly cost check, quarterly model review. Undefined denominators remain `undefined`. Never use team growth as revenue. A free-forever contract change requires the repository PR checkpoint before autonomous execution. |

**Current Acquisition availability:** raw public visits, CTA intent, signup intent, and signup context are instrumented. The qualified-visitor denominator and source-to-activation attribution are `unavailable` until the qualification rule, internal/test exclusions, source taxonomy, and team-level attribution query in §11 are implemented. Until then, the router may report raw counts but must not apply source kill/scale thresholds or route an Acquisition experiment from those metrics.

**Current Retention availability:** historical events cannot reconstruct activation milestones for teams that existed before complete team-scoped instrumentation. Retention therefore remains `unavailable` until a trustworthy database reconciliation, state snapshot, or backfill exists. The router must not calculate `AAT-28`, route Retention, or use dependent sustainability ratios until that stage-level status becomes available, while independent stages may still report.

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

The repository evidence still does not establish a trustworthy production growth baseline, budget, customer-interview corpus, or mature retention read. The development database snapshot above remains aggregate and directional only; the official PostHog plugin must validate production event semantics and coverage before the Pulse routes dependent actions.

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

The module has two modes. A monthly research appendix may run after the router returns `no_action`; it may maintain the deduplicated backlog and open one focused experimental-page PR when its evidence and quality checks pass. The operational diagnostic runs when Acquisition is the primary routed constraint. It uses `programmatic-seo` and `content-strategy`, with `seo-audit` before any PR. Inputs are the product-marketing contract, current routes and canonical intents, public SERPs, official vendor documentation, primary research, attributable public problem signals, Search Console when connected, downstream PostHog outcomes, and optionally DataForSEO. An unrelated open PR does not block this research.

DataForSEO is optional enrichment, not a prerequisite for qualitative research. The pulse may use it automatically when server-only credentials, target market/language, request cap, and spend cap are configured. Until then the source remains `unavailable`, no paid call is made, and the pulse continues without requesting approval. Quantitative fields are `search_volume`, source `monthly_searches`, `keyword_difficulty`, `google_ads_competition`, and `cpc`, each with status, source, market/language, and `as_of`; missing values are never zero or inferred. A `trend` is not derived until its formula, window, and series-completeness rule are versioned. Categorical `search_intent` is stored separately with evidence and confidence and may be inferred qualitatively from a current SERP; provider probabilities are optional enrichment, not demand evidence. Google Ads competition and organic keyword difficulty remain separate metrics.

Field availability is not proof of demand. Store `demand_gate=pass|fail|unavailable|broken` separately: a valid zero is available but cannot pass, and CPC, keyword difficulty, Google Ads competition, or search-intent classification never satisfy the gate. The pulse owns and versions the rule over demand measures such as search volume, its monthly source series, or target-query Search Console impressions. Until market/language, formula, comparison window, minimum completeness, and threshold are recorded, the gate is `unavailable`; credentials alone never constitute demand.

Each research run keeps at most 30 deduplicated seed queries and shortlists at most five opportunities. A `canonical_intent_id` combines normalized locale, audience/problem, and intent independently of format; candidates, existing canonical URLs, and open PRs are deduplicated on that ID before shortlisting. Every candidate must have a distinct intent, a natural `create a team library` conversion path, current attributable sources, differentiated utility such as an original comparison, workflow, checklist, template, or decision framework, product-contract-safe claims, no canonical overlap, and complete metadata, internal-link, sitemap, indexation, and supported-schema handling.

Qualitative evidence may justify one experimental page PR when product fit, unique value, source quality, honest claims, indexation, measurement, and rollback checks pass. Quantitative demand may justify at most three new indexable pages in one intent cluster. The PR is the sole human checkpoint: no separate pilot approval or approval key exists. After independent approval, merge, and deployment, evaluate a page over a complete eight-week window using indexation and Search Console query/page impressions for the target intent when available. Use page-specific CTA/signup intent only after a stable landing identifier such as `landing_path` and its query are implemented and validated; the current `landing_cta_clicked.location` describes the CTA surface, not the landing page. Use activated teams only after attribution is operational, and apply success or kill checks only to available page-attributable measures. Pause a pattern after two mature comparable misses and diagnose it before producing more.

**Measurement target:** normalized UTMs, anonymous landing CTA intent, signup context, and eventual activated teams by source. Raw intent is available now; qualified visitors and source-to-activation attribution remain unavailable until §11 is resolved. Scan public demand when the router selects Acquisition; the monthly pSEO appendix may run after `no_action` and ignores unrelated resource locks.

**Not now:** broad paid acquisition, mass cold email, unsolicited commercial GitHub issues, or generic “AI tools” content.

### Activation

**Outcome:** move a completed signup to shared team value within 14 days.

**Current bets:** stable `team_id`, returning-user identity, a post-first-skill invite prompt, and honest usage-path events rather than install claims.

**Measurement:** mature cohorts through team creation, first skill, invite, acceptance, and non-creator usage, aggregated by team rather than person.

**Next only if routed:** classify no-team, no-skill, no-invite, pending-invite, and no-second-member-use stalls; expose one recovery at a time.

### Retention

**Outcome:** make shared skill reuse recur when new work appears.

**Current bets:** team-level library views, repeated non-creator usage-path selection, and `AAT-28` state transitions. Use targeted research before lifecycle messaging; a consented, suppressed, capped intervention may run autonomously.

**Measurement:** retained, reactivated, and lost teams across non-overlapping 28d periods, plus breadth of members and recommendations accessed. `team_value_action` is a proxy for accessing or selecting a usage path, not proof of installation or agent execution.

**Guardrail:** no noisy weekly email. Any digest or win-back requires consent, suppression, an unsubscribe path, a send cap, and evidence that absence represents churn rather than normal low-frequency use. Missing prerequisites produce `no_action`, not an approval request.

### Referral

**Outcome:** turn retained value into another activated team.

**Current bet:** first measure `organic_champion_replication` — an invited teammate later creates and activates a different team. This is a useful correlation, not referral attribution. Add an explicit referral source only after the replication signal exists.

**Measurement:** report organic champion replication separately. For an explicit referral path, measure eligible happy teams, asks, copies, attributed teams created, and `referred_team_activated`; referral attribution overrides generic UTM attribution.

**Guardrail:** ask only after activation plus later multi-member use. Use only product-owned, consented destinations with a 60-day cooldown and configured volume cap; never inspect unrelated contacts.

### Revenue / sustainability

The hosted product remains free forever and currently has no revenue conversion. The framework must show that explicitly rather than relabeling team growth as Revenue.

The operating question is whether the free product is sustainably funded. Track aggregate Vercel, Neon, Resend, and founder-time cost per `AAT-28`, alongside explicit inbound interest in sponsorship, grants, services, or optional add-ons that do not break the core promise. The pulse may optimize configured GTM and tool spend within machine-enforced caps. A durable change to pricing or the free-forever contract first requires a versioned repository PR; once independently approved and merged, the pulse may execute the corresponding connected-system changes.

## 7. Automation rollout

Keep one scheduled automation. It is a full-funnel sensing and routing layer, not five independent agents competing to create work.

### Official PostHog plugin control contract

The official authenticated PostHog plugin — the `posthog:posthog` skill and its tools — is authoritative for analytics control; product SDK ingestion remains separate. Every run discovers the tools currently advertised, verifies production project `225645`, and reads the real schema, resources, and lifecycle state before any write. The pulse manages only resources with exact Pulse ownership, fails closed on project mismatch or ambiguous identity, and never uses private APIs or introduces an alternate PostHog query or control client.

The pulse reconciles one owned GTM dashboard plus versioned stage and Tracking QA insights. Stable logical keys, ownership markers, semantic versions, definition hashes, and live PostHog IDs are persisted so retries update existing resources rather than duplicate them. It uses only operations advertised in the current run and obeys each tool's lifecycle, confirmation, and irreversibility rules; unsupported or non-automatable transitions remain `unavailable`. Before launching any flag-backed experiment, it verifies that deployed product code consumes the exact flag. Otherwise it opens and deploys the repository PR first and leaves the experiment unlaunched. Team-level metrics use HogQL grouped by `team_id` and do not depend on `person.properties.*`.

If the official PostHog plugin is unavailable or a required operation is not exposed, only PostHog-dependent metrics and actions are `unavailable`. The Pulse retries on its next run and continues with independent trustworthy sources and channels. It never estimates missing values or substitutes screenshots, repository guesses, database proxies, or private APIs for missing PostHog data or capabilities.

### Loop 0 — Full-funnel router and tracking QA

- **Check cadence:** Monday 09:00 Europe/Rome and after relevant analytics changes.
- **Acts when:** Always reconciles PostHog and refreshes the scorecard; executes when data is trustworthy, a decision threshold is met, and no conflicting action owns the same `resource_key`. A PR blocks only overlapping repository work.
- **Purpose:** Show the whole growth system and choose the single highest-leverage evidenced constraint.
- **Skills used:** analytics, marketing-plan, marketing-loops, plus the selected stage skill only after routing.
- **Body:** discover official PostHog plugin capabilities; verify project identity; reconcile canonical PostHog assets; calculate all five scorecard rows and `ΔAAT` from valid values; exclude unavailable, broken, or immature stages; route a verified defect first; route Revenue/sustainability next only for a proven cap breach or due review; otherwise apply downstream health gates before Acquisition scaling and select among eligible growth stages by absolute teams affected and strength of evidence. Execute one bounded action and monitor active experiments daily.
- **Self-check:** environment and internal/test filters, stable windows, no duplicates, cross-user metrics grouped by `team_id`, cohort maturity, source freshness, and sample size.
- **State / idempotency:** schema version, metric snapshots, per-stage status, PostHog resource registry, resource locks, active experiments and surveys, PR status, action-policy version, caps, ledgers, signal hashes, and cooldowns.
- **Stop / bail-out:** broken or stale data makes Tracking QA the only action for dependent metrics. Missing caps, consent, targeting, or tools make only that action ineligible. A kill threshold pauses or rolls back immediately.
- **Output:** five AARRR rows, `ΔAAT`, cohort `n` and maturity, PostHog plugin and data quality, one routed constraint, the executed action or exact `no_action`, active rollouts, and any PR state.

### Autonomous execution and PR gate

The pulse executes only one primary routed action per strategic run, while existing experiments receive independent monitoring. Eligible work includes a PostHog reconciliation or experiment, a connected-channel action inside configured caps, a repository-fixable product or Tracking QA defect, and a focused pSEO PR that passes its evidence and quality checks. Broken Tracking QA blocks only dependent growth actions and permits direct repair of Pulse-owned analytics resources or an evidenced tracking PR.

Before repository edits, the pulse synchronizes the local default branch and requires a clean checkout plus no overlapping local-state or GitHub PR for the same `resource_key`, defined as `provider + resource_type + scope + logical_key`. It creates a `codex/gtm-<slug>` branch, makes one small reversible change, adds focused tests, and runs relevant tests, typecheck, and proportionate build or browser verification. A failed verification, unrelated changes, or suspected secrets stop that repository action before push without stopping independent GTM work.

After verification it may commit, push, and open a PR containing aggregate evidence, routed metric and window, root cause, scope, tests, observation window, success check, and kill/revert check. It may update the PR, answer review comments, and mark it ready. It never self-approves or bypasses branch protection. After an independent human approval and green required checks, it may merge and monitor deployment. The PR's `resource_key` alone remains locked; unrelated GTM work continues.

Repository changes involving auth, authorization, billing, secrets, migrations, pricing, the free-forever promise, or production configuration use the same PR checkpoint. Direct connected-system actions are autonomous only when reversible, Pulse-owned, allowlisted, and bounded by machine-enforced policy. Irreversible or ambiguous actions are skipped rather than escalated into a new approval queue.

### Diagnostic modules — dormant until routed

These are one-shot branches of Loop 0, not independent strategic routers. They inherit its QA, resource locks, automatic guardrails, state, and stop conditions. The detailed procedures live in `.agents/loops/skillsboard-gtm-pulse.md`.

| Module | Check and trigger | Output | Key stop condition |
|---|---|---|---|
| Acquisition | Weekly scorecard; public scan when Acquisition is selected. A monthly pSEO appendix may run after `no_action` and ignore unrelated locks. The branch maintains at most 30 deduplicated seeds and five shortlisted opportunities. | One bounded channel/content action; one experimental-page PR from strong qualitative evidence; or at most three pages in one intent cluster when quantitative demand passes. | Qualification or attribution gaps block source-scale conclusions; weak product fit, canonical overlap, thin content, an overlapping resource lock, or failed SEO/verification blocks the action. |
| Activation | Weekly at current volume; stalled mature cohorts or a verified product defect. | One step-level diagnosis and one bounded in-product experiment. | Tracking gap, active cooldown, unresolved bug, or two failed nudges. |
| Retention | Weekly snapshot, monthly diagnosis after a mature cohort exists. | One cause candidate plus a consented, capped research or lifecycle intervention. | Cohort not mature, normal low-frequency behavior not ruled out, missing consent/suppression, or outage/event change. |
| Referral | Monthly and dormant until happy moments exist. | One capped in-product or consented referral ask with explicit attribution. | Team not healthy, no attribution or consent, or 60d cooldown. |
| Revenue / sustainability | Weekly digest shows the latest monthly snapshot with `as_of`; route only on a cap breach or during the quarterly review. | Separate cash coverage, fully loaded cost, acquisition cost, and an autonomous bounded optimization when eligible. | Incomplete costs, missing cap, irreversible change, or product-contract conflict. |
| Experiment / learning | Starts automatically after the routed hypothesis passes its gates. | One hypothesis, flag or survey, owner=`pulse`, success check, kill check, result, and postmortem. | Never overlap the same population or surface; auto-pause on regression. |

Modules may send, publish, spend, and change Pulse-owned connected resources when automatic consent, cap, allowlist, ownership, and rollback checks pass. They never store raw PII. Repository changes use the single PR checkpoint; after independent approval the pulse may merge and monitor deployment.

## 8. 30 / 60 / 90 day roadmap

| Window | Outcome | Work |
|---|---|---|
| Days 0–30 | Trust the full-funnel board | Already shipped: URL sanitization, acquisition-intent events, and team-return events. Remaining: reconcile the plugin-owned dashboard and insights, validate production payloads until Tracking QA passes, and define attribution plus internal/test exclusion. |
| Days 31–60 | Diagnose and act on the real constraint | Observe mature cohorts; run one diagnostic and one bounded autonomous action; instrument Referral or sustainability when its prerequisite signal exists. |
| Days 61–90 | Prove one intervention and one learning | Run one bounded experiment on the selected stage; monitor guardrails daily; keep, revise, roll back, or kill from the versioned observation rule; publish a postmortem and update the next hypothesis automatically. |

## 9. Operating authority

| Work | Pulse authority | Automatic boundary |
|---|---|---|
| Full-funnel analytics and PostHog assets | Responsible and accountable; create, update, reuse, pause, and retire Pulse-owned assets | Verified project, ownership marker, idempotency, privacy |
| Diagnostic and experiment selection | Selects, launches, monitors, and ends | Trustworthy metric, versioned threshold, no overlap, rollback |
| Repository implementation | Branches, verifies, commits, pushes, opens/updates PR, handles review, marks ready | Independent PR approval is required before merge |
| Merge and deployment | Merges after independent approval and green checks; monitors and rolls back through a follow-up PR when needed | Never self-approve or bypass protection |
| Outreach, lifecycle, referral, publishing | Executes autonomously | Consent, suppression, allowlist, volume cap, cooldown, ToS |
| Spend and budget movement | Executes within configured machine caps | Hard ceiling, per-run delta, allowlist, outcome guardrail |
| Product-contract changes | Authors the versioned contract and implementation PR, then executes after merge | The PR is the sole human checkpoint |

Global kill switch: pause the scheduled Codex automation. Product lifecycle automation must also have its own environment-level disable flag before launch.

## 10. Full-funnel measurement contract

Every custom PostHog event includes `deployment_environment`. Team-scoped events carry `team_id`. No raw invited email, team name, invitation capability token, or full repository URL is sent in custom event properties.

The browser-safe project token proves only that the app can ingest events; the official PostHog plugin independently provides authenticated analytics reads and resource management. Each PostHog-derived metric becomes decision-ready when its events, filters, environment, freshness, `team_id`, and internal/test checks pass. One broken or unavailable metric does not globally block healthy stages or independent sources.

| Stage | Event or derived metric | Required properties / rule | Status |
|---|---|---|---|
| Acquisition | `$pageview` | PostHog automatic pageview with a canonical URL; only allowlisted UTMs remain and invitation capability paths become `/invite/[redacted]`. Signup, sign-in, consent, and invitation pageviews remain measurable in both PostHog and Vercel Analytics. | Implemented |
| Acquisition | `landing_cta_clicked` | `location`, `destination`, `visitor_state`; Acquisition filters `visitor_state=anonymous`. | Implemented |
| Acquisition | `signup_form_submitted` | `method`, `signup_context=new_team\|team_invitation`; invitation signup is not new-team acquisition. | Implemented |
| Activation | `user_signed_up` | `method`, `signup_context=new_team\|team_invitation`; measures completion after signup intent. | Implemented |
| Acquisition | qualified visitors and activated teams by source | Written qualification rule, internal/test exclusion, normalized source taxonomy, 30d first-touch/last-non-direct query, and referral override. | Unavailable until §11 |
| Activation | `team_created` | `team_id`, `creation_surface=onboarding\|in_app`. | Implemented |
| Activation | `skill_saved`, invite prompt, `team_member_invited`, `invitation_accepted` | Existing semantic properties plus stable `team_id`. | Implemented |
| Activation / Retention | `skill_usage_path_selected`, `skill_downloaded` | `team_id`, skill metadata, `method`, `surface`, `actor_is_skill_creator`; union as the `team_value_action` access proxy, not proof of installation. | Implemented |
| Retention | `team_library_viewed` | `team_id`, `skill_count`, `has_skills`, `filter_state`; one event per mounted route-state transition, including search/tag navigation, with same-route skill mutations deduplicated while mounted. | Implemented |
| Retention | `AAT-28` states | HogQL grouped by `team_id`, never a person funnel; fail closed until historical activation is reconciled. | Definition specified; measurement unavailable |
| Referral research | `organic_champion_replication` | Invited user later creates and activates a different `team_id`; correlation only, not referral attribution. | Query required |
| Referral | ask/copy/create/activate events | Add when a referral surface exists; optimize for `referred_team_activated`. | Planned |
| Revenue / sustainability | cash coverage, fully loaded cost per current `AAT-28`, acquisition cost per new `AAT-28` | Aggregate Vercel, Neon, Resend, GTM spend, and founder-time inputs; not user events. | Data connection required |

Client analytics sanitizes only automatic URL properties: hashes and non-UTM query parameters are removed, and invitation capability paths are canonicalized without dropping the pageview. SDK-owned properties and explicit custom-event properties remain intact. Autocapture and exception capture are restored to the original PostHog integration behavior, Session Replay remains controlled by the PostHog project, and Do Not Track is honored. Replay page and network URLs receive the same sanitizer; network bodies, headers, and the rendered invitation-link result are excluded because they can contain live credentials. Vercel Analytics applies the same canonical URL rule. Client and server events share the build-time `NEXT_PUBLIC_ANALYTICS_ENVIRONMENT` value. Server-side analytics is fail-open so analytics failure cannot convert a successful product mutation into a user-visible error. Consent, retention, and internal-user policy remain launch blockers rather than assumptions.

## 11. Autonomous backlog and configuration dependencies

Pulse owns the following backlog and resolves items from evidence rather than creating a human decision queue:

1. Establish the production scorecard baseline across Acquisition, Activation, Retention, Referral, and sustainability.
2. Implement and validate internal/test exclusion for every denominator.
3. Version the qualified-visitor rule, UTM taxonomy, first-touch, last-non-direct, referral override, and team-level attribution.
4. Enforce consent, opt-out, retention, deletion, unsubscribe, and suppression automatically before eligible actions.
5. Record machine-readable cash, send, and spend caps. Until a cap exists, the dependent action is `unavailable` and the loop chooses another action.
6. Reconcile production analytics until semantic coverage, environment, `team_id`, freshness, and internal/test checks pass.
7. Choose and record acquisition locale and multiplier ICP from current evidence, then revisit on a versioned cadence.
8. Evaluate sustainability modes that preserve the current free core; any durable contract change starts with a PR.
9. Use Search Console and DataForSEO automatically when their integrations or server-only credentials and caps become available; until then quantitative fields remain `unavailable`.

## 12. Reference points

- [GitHub Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [GitHub CLI skill management](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)
- [DataForSEO API authentication](https://docs.dataforseo.com/v3/auth/)
- [DataForSEO Google Ads keyword data](https://docs.dataforseo.com/v3/keywords_data-google_ads-overview/)
- [OpenAI workspace skill sharing](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)
- [Claude organization skill provisioning](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)
- [Cursor team product and marketplace](https://cursor.com/pricing)
- [PostHog group analytics](https://posthog.com/docs/product-analytics/group-analytics) — useful later, but a paid add-on; v1 uses a stable `team_id` event property instead.
