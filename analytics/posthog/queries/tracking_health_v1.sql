-- name: tracking_health_v1
-- Complete seven-day tracking-health window: [start of today - 7d, start of today).
WITH expected_events AS (
    SELECT '$pageview' AS event_name, 0 AS team_scoped_required, 1 AS sort_order
    UNION ALL SELECT 'landing_cta_clicked', 0, 2
    UNION ALL SELECT 'signup_form_submitted', 0, 3
    UNION ALL SELECT 'user_signed_up', 0, 4
    UNION ALL SELECT 'team_created', 1, 5
    UNION ALL SELECT 'skill_saved', 1, 6
    UNION ALL SELECT 'team_member_invited', 1, 7
    UNION ALL SELECT 'invitation_accepted', 1, 8
    UNION ALL SELECT 'skill_usage_path_selected', 1, 9
    UNION ALL SELECT 'skill_downloaded', 1, 10
    UNION ALL SELECT 'team_library_viewed', 1, 11
),
observed_events AS (
    SELECT
        event AS event_name,
        count() AS event_count,
        uniqIf(
            properties.team_id,
            properties.team_id IS NOT NULL AND properties.team_id != ''
        ) AS unique_teams,
        countIf(properties.team_id IS NULL OR properties.team_id = '') AS missing_team_scope_count,
        count() - countIf(properties.analytics_schema_version = 2) AS invalid_schema_count,
        countIf(properties.deployment_environment IS NULL) AS missing_environment_count,
        min(timestamp) AS first_seen_at,
        max(timestamp) AS last_seen_at
    FROM events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 7 DAY
      AND timestamp < toStartOfDay(now())
      AND event IN (
          '$pageview',
          'landing_cta_clicked',
          'signup_form_submitted',
          'user_signed_up',
          'team_created',
          'skill_saved',
          'team_member_invited',
          'invitation_accepted',
          'skill_usage_path_selected',
          'skill_downloaded',
          'team_library_viewed'
      )
      AND (
          properties.deployment_environment = '{{environment}}'
          OR properties.deployment_environment IS NULL
      )
    GROUP BY event
)
SELECT
    expected.event_name AS event_name,
    expected.team_scoped_required AS team_scoped_required,
    toStartOfDay(now()) - INTERVAL 7 DAY AS window_start,
    toStartOfDay(now()) AS window_end,
    coalesce(observed.event_count, 0) AS event_count,
    coalesce(observed.unique_teams, 0) AS unique_teams,
    if(
        expected.team_scoped_required = 1,
        coalesce(observed.missing_team_scope_count, 0),
        0
    ) AS missing_team_scope_count,
    coalesce(observed.invalid_schema_count, 0) AS invalid_schema_count,
    coalesce(observed.missing_environment_count, 0) AS missing_environment_count,
    observed.first_seen_at AS first_seen_at,
    observed.last_seen_at AS last_seen_at,
    multiIf(
        observed.event_count IS NULL OR observed.event_count = 0, 'missing',
        observed.invalid_schema_count > 0, 'schema_mismatch',
        observed.missing_environment_count > 0, 'missing_environment',
        expected.team_scoped_required = 1 AND observed.missing_team_scope_count > 0, 'missing_team_scope',
        'healthy'
    ) AS health_status
FROM expected_events AS expected
LEFT JOIN observed_events AS observed ON observed.event_name = expected.event_name
ORDER BY expected.sort_order
