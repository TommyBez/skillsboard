# Tracking QA and five-stage scorecard

**Node:** `analytics.scorecard`

Load for Monday strategic runs, analytics-semantic changes, Tracking QA, or any decision using Acquisition, Activation, Retention, Referral, or Sustainability. It depends on `analytics.control_plane`.

## Tracking QA

Run on every strategic pulse and after any analytics-semantic change. Verify event names and semantics, production host/environment, sensitive URL sanitization, duplicates, stable `team_id`, internal/test exclusions, first-touch and last non-direct attribution, freshness, and any explicitly designed DB/PostHog aggregate reconciliation. A broken dependency blocks only its decisions and becomes repair work.

Only the production deployment sends PostHog or Vercel Analytics events. Decision queries filter `properties.$host = 'www.skillsboard.sh'`; `localhost:3000`, Preview, internal, and test traffic never enter denominators. Team-scoped events carry stable `team_id`. Custom properties never contain a raw invited email, team name, invitation capability token, or full repository URL.

| Stage | Event or derived metric | Required semantics |
|---|---|---|
| Acquisition | `$pageview` | Canonical URL; retain only allowlisted UTMs; invitation capability paths become `/invite/[redacted]`. |
| Acquisition | `landing_cta_clicked` | `location`, `destination`, `visitor_state`; Acquisition uses `visitor_state=anonymous`. |
| Acquisition | `signup_form_submitted` | `method`, `signup_context=new_team\|team_invitation`; invitation signup is not new-team acquisition. |
| Activation | `user_signed_up` | `method`, `signup_context=new_team\|team_invitation`; completion after intent. |
| Activation | `team_created` | Stable `team_id`, `creation_surface=onboarding\|in_app`. |
| Activation | `skill_saved`, `team_member_invited`, `invitation_accepted` | Stable `team_id` and existing versioned semantic properties. |
| Activation / Retention | `skill_usage_path_selected`, `skill_downloaded` | `team_id`, skill metadata, method, surface, `actor_is_skill_creator`; union is `team_value_action`. |
| Retention | `team_library_viewed` | `team_id`, `skill_count`, `has_skills`, `filter_state`; deduplicate same-route mutations while mounted. |
| Retention | `AAT-28` states | HogQL grouped by `team_id`; fail closed until historical activation is reconciled. |
| Referral research | `organic_champion_replication` | Invited user later creates and activates another `team_id`; correlation only. |
| Referral | ask, copy, create, activate | Add only with an explicit referral surface; optimize for `referred_team_activated`. |

URL sanitization removes hashes and non-allowlisted query parameters and canonicalizes invitation paths. Replay URLs use the same sanitizer; network bodies, headers, and rendered invitation links remain excluded. Honor Do Not Track. Analytics is fail-open for product mutations: analytics failure cannot turn successful product work into a user-visible error. The browser-safe project token proves ingestion only; authenticated reads and asset management still require the official plugin.

At contract adoption, raw public visits, CTA/signup intent, and signup context may be present while the qualified-visitor denominator and source-to-activation attribution remain `unavailable` until qualification, source taxonomy, exclusions, and the team-level attribution query pass Tracking QA. Historical events may not reconstruct activation for pre-instrumentation teams; Retention and dependent `AAT-28` remain unavailable until trustworthy reconciliation or backfill. Raw counts may be descriptive but cannot trigger scale or kill thresholds.

Every row records absolute numerator/count, denominator, window, comparison period, cohort maturity, `data_status = available|unavailable|broken`, confidence, and dependencies. A valid zero is available. Missing is not zero. Below 30 eligible teams, lead with absolute outcomes, raw ratios, and qualitative corroboration; percentage movement cannot decide.

## North Star and team definitions

`AAT-28` is the rolling count of Activated Active Teams, not an Activation-only metric. An organization counts when it has at least two members, at least one saved skill, and a member other than that skill's creator selected a usage path or downloaded it in the last 28 days.

```text
AAT_t = new activated_t + retained_t + reactivated_t
delta_AAT = new activated_t + reactivated_t - lost_t

new activated = visitor-led non-referral activated
  + champion-led non-referral activated
  + explicitly referred activated
```

Explicit referral overrides visitor/champion classification so each activated team has one growth path.

A new team reaches `team_activated_14d` only when, within 14 days of `team_created`, it completes:

```text
first skill saved -> invitation accepted -> non-creator selects a usage path
```

Because the sequence crosses people, Activation, Retention, and `AAT-28` use HogQL grouped by event `properties.team_id`; never a person funnel or person properties.

For closed non-overlapping 28-day periods: `new` first activates in the current period; `retained` is active in current and previous; `reactivated` is active now, absent in the previous, and active earlier; `lost` was active previously and is absent now.

Period-1 retention is teams with a value-action proxy during days 29–56 after `activation_at`, divided by activated teams with 56 complete observation days. `team_value_action` is a proxy for accessing or choosing a path, not proof of install or execution.

## Five scorecard rows

### Acquisition

Boundary: qualified anonymous visit to signup intent. Signup completion belongs to Activation.

Track qualified public visits, anonymous `landing_cta_clicked`, `signup_form_submitted` with `signup_context=new_team`, visitor-led team creation, attributable public demand signals, and mature activated teams by first touch and last non-direct source. Keep explicit referral and champion-led creation separate. Raw descriptive counts may appear before qualification, but decisions stay unavailable.

Use a rolling 28-day view. Suspend a source only after either 100 qualified sessions across eight weeks with no team start or five mature team starts with no activation. Three activated teams authorize another bounded test, not scaling.

Eligible work: protected pSEO or a queued capped organic/community/content test. Block on weak product fit, false claims, canonical conflict, missing attribution required by the decision, failed cap/allowlist, or too many uncheckpointed pSEO pages.

### Activation

Boundary: signup intent through first shared team value. Report account completion, team creation, first skill within 24 hours, invite within 72 hours, acceptance within seven days, non-creator usage-path selection within 14 days, `team_activated_14d`, and median time to activation.

Use only cohorts with 14 complete days. Investigate after five mature teams produce zero activations, or one step contains at least half of stalled teams in two comparable checks. One team is a case to investigate, not a trend.

Eligible work: relevant structured survey, compatible flag experiment, or PR for the largest verified stall. Block on immature cohort, invalid unit, missing `team_id`, contamination, or guardrail regression.

### Retention

Boundary: activated team through repeated access to shared recommendations. Report `team_library_viewed`, teams approaching 21 days without a value-action proxy, breadth of active members/recommendations, rolling `AAT-28`, closed-period new/retained/reactivated/lost, and period-1 retention.

Compare closed non-overlapping 28-day periods; first-cohort retention needs 56 days. Prioritize when `lost > new + reactivated` or at least three mature teams are lost. Retention diagnosis remains monthly until volume supports weekly comparison.

Eligible work: diagnose lost/reactivated teams and one capped in-product or lifecycle intervention. Block on immature cohort, semantic outage, missing consent/suppression, or attempt limit.

### Referral

Boundary: healthy retained team through another team reaching value from an explicit referral source. Report eligible healthy moments, ask viewed, link copied, referred visits, `referred_team_activated`, and activated viral coefficient. `organic_champion_replication` is correlation only.

Use one in-app prompt per eligible user per 30 days and a 28-day lifecycle plus at most one unchanged 28-day extension under `product.lifecycle`. Three independent activated teams are promising, not automatic scale.

Eligible work: capped in-product or consented ask after verified healthy value with explicit attribution. Block on unhealthy team, missing attribution or consent, interference, prompt cap, or lifecycle stop.

### Sustainability

Revenue is `not_monetized` and current revenue is zero until real money exists. Keep cash and founder time separate. Report monthly recurring cash infrastructure/tool cost, founder hours, GTM cash/time, explicit sponsorship/service/add-on demand, cash coverage, fully loaded cost per current `AAT-28`, and acquisition cost per new `AAT-28`.

```text
cash coverage = recurring cash support or revenue
  / recurring cash infrastructure and tool cost

fully loaded cost per current AAT =
  (cash cost + founder hours * agreed rate) / current AAT

acquisition cost per new AAT =
  (GTM cash + GTM hours * agreed rate) / new AAT
```

A zero denominator is `undefined`, never zero or infinity. Monthly cost check and quarterly model review apply. Team growth is never called revenue.

Eligible work: reconcile configured aggregate costs and optimize spend inside machine caps; route contract changes through a PR. Block on incomplete costs, zero denominator, anomaly, cap breach, or irreversible ambiguity.

## Decision integrity

Do not compare windows with different elapsed maturity, silently change an event definition, or use a repaired window as though uninterrupted. Preserve cohort size, exclusions, semantic version, and evidence grade. Broken observability is `measurement_failure`, not an unfavorable or inconclusive product result.
