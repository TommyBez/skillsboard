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
| `retention_v1.sql` | Rolling/current 28d, previous 28d, and mature days 29–56 cohort | Returns `measurement_status=unavailable` and null retention metrics until historical activation milestones are backfilled reliably. |

## Known event-only limits

Schema v2 was deployed after teams had already accumulated milestones, and older events do not contain reliable team scope and semantics. Filtering to v2 therefore cannot reconstruct every team's `skill_saved`, `invitation_accepted`, and activation history. Existing events also cannot prove lasting structural eligibility: `skill_saved` lacks the later `skill_id`, and membership-removal events do not exist.

Until the query can reconcile current team state and historical activation from the database, or consume trustworthy state-snapshot/backfill events, it returns a constant aggregate marker without scanning the events table: `measurement_status=unavailable`, `unavailable_reason=historical_activation_milestones_not_backfilled`, and null metric values. This keeps independent stages readable without publishing partial Retention metrics.

The SQL uses supported HogQL/ClickHouse aggregates (`countIf`, `uniqIf`, `minIf`, and `medianIf`) and explicit event properties found in this repository. All four queries, including the fail-closed Retention result, passed the live PostHog API runner on 2026-07-17. Future runs still require the local read-only Personal API Key.
