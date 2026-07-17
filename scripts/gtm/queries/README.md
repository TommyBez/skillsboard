# Skills Board GTM HogQL queries

These versioned queries are the aggregate PostHog inputs for the weekly GTM pulse. They read the `events` table only and never return person IDs, team IDs, emails, names, invitation tokens, or URLs.

## Runtime contract

- The runner replaces the single `{{environment}}` placeholder from an allowlist before submitting the query.
- Windows end at `toStartOfDay(now())`, so a run never compares a partial day with complete days.
- Metric queries accept only analytics schema version `2` and the selected deployment environment.
- Cross-user product metrics group internally on `properties.team_id`; identifiers are discarded before output.
- `skill_usage_path_selected` and `skill_downloaded` with `actor_is_skill_creator = false` form the `team_value_action` access proxy. They do not prove installation or execution in an agent.

## Files

| Query | Window | Meaning |
|---|---|---|
| `tracking_health_v1.sql` | Last 7 complete days | Presence, schema, environment, and team-scope checks for every scorecard event. |
| `acquisition_v1.sql` | Current and previous complete 28-day periods | Raw public demand, signup intent, completion, and team starts. The decision status is deliberately `unavailable` because qualified-visitor and source-attribution contracts do not exist yet. |
| `activation_v1.sql` | Team-created cohorts `[−28d, −14d)` and `[−42d, −28d)` | Mature 14-day cohorts through first skill in 24h, invite in 72h, acceptance in 7d, and subsequent non-creator value in 14d. |
| `retention_v1.sql` | Rolling/current 28d, previous 28d, and mature days 29–56 cohort | Aggregate `AAT-28`, mutually exclusive new/retained/reactivated/lost states, `delta_aat`, and period-1 retention. |

## Known event-only limits

`retention_v1.sql` uses a versioned 730-day history horizon and treats an observed `skill_saved` plus `invitation_accepted` as lasting structural eligibility. Existing events cannot reliably reconstruct removal of the last skill or second member: `skill_saved` lacks the later `skill_id`, and membership-removal events do not exist. The pulse must therefore label this result `event_only_proxy` until it reconciles current team state from the database or receives state-snapshot events.

The SQL uses supported HogQL/ClickHouse aggregates (`countIf`, `uniqIf`, `minIf`, and `medianIf`) and explicit event properties found in this repository. All four queries passed the live PostHog SQL editor on 2026-07-17. The API runner still requires a local read-only Personal API Key before its request and response path can be validated end to end.
