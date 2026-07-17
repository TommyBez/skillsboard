-- name: retention_v1
-- Rolling AAT-28 and closed 28-day states, using a two-year event-history horizon.
WITH scoped_events AS (
    SELECT
        event,
        timestamp,
        properties
    FROM events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 730 DAY
      AND timestamp < toStartOfDay(now())
      AND properties.analytics_schema_version = 2
      AND properties.deployment_environment = '{{environment}}'
      AND properties.team_id IS NOT NULL
      AND properties.team_id != ''
      AND event IN (
          'skill_saved',
          'invitation_accepted',
          'skill_usage_path_selected',
          'skill_downloaded'
      )
),
structural_milestones AS (
    SELECT
        properties.team_id AS scoped_team_key,
        minIf(toNullable(timestamp), event = 'skill_saved') AS first_skill_at,
        minIf(toNullable(timestamp), event = 'invitation_accepted') AS first_acceptance_at
    FROM scoped_events
    GROUP BY properties.team_id
),
activation_milestones AS (
    SELECT
        structure.scoped_team_key AS scoped_team_key,
        minIf(
            toNullable(candidate.timestamp),
            candidate.event IN ('skill_usage_path_selected', 'skill_downloaded')
            AND candidate.properties.actor_is_skill_creator = false
            AND structure.first_skill_at IS NOT NULL
            AND structure.first_acceptance_at IS NOT NULL
            AND candidate.timestamp >= greatest(
                structure.first_skill_at,
                structure.first_acceptance_at
            )
        ) AS activation_at
    FROM structural_milestones AS structure
    LEFT JOIN scoped_events AS candidate
        ON candidate.properties.team_id = structure.scoped_team_key
    GROUP BY structure.scoped_team_key
),
team_activity AS (
    SELECT
        activated.scoped_team_key AS scoped_team_key,
        activated.activation_at AS activation_at,
        countIf(
            candidate.event IN ('skill_usage_path_selected', 'skill_downloaded')
            AND candidate.properties.actor_is_skill_creator = false
            AND candidate.timestamp >= toStartOfDay(now()) - INTERVAL 28 DAY
            AND candidate.timestamp < toStartOfDay(now())
        ) > 0 AS active_current,
        countIf(
            candidate.event IN ('skill_usage_path_selected', 'skill_downloaded')
            AND candidate.properties.actor_is_skill_creator = false
            AND candidate.timestamp >= toStartOfDay(now()) - INTERVAL 56 DAY
            AND candidate.timestamp < toStartOfDay(now()) - INTERVAL 28 DAY
        ) > 0 AS active_previous,
        countIf(
            candidate.event IN ('skill_usage_path_selected', 'skill_downloaded')
            AND candidate.properties.actor_is_skill_creator = false
            AND candidate.timestamp >= activated.activation_at
            AND candidate.timestamp < toStartOfDay(now()) - INTERVAL 56 DAY
        ) > 0 AS active_earlier,
        countIf(
            candidate.event IN ('skill_usage_path_selected', 'skill_downloaded')
            AND candidate.properties.actor_is_skill_creator = false
            AND candidate.timestamp >= activated.activation_at + INTERVAL 28 DAY
            AND candidate.timestamp < activated.activation_at + INTERVAL 56 DAY
        ) > 0 AS retained_in_days_29_to_56
    FROM activation_milestones AS activated
    LEFT JOIN scoped_events AS candidate
        ON candidate.properties.team_id = activated.scoped_team_key
    WHERE activated.activation_at IS NOT NULL
    GROUP BY activated.scoped_team_key, activated.activation_at
)
SELECT
    'retention' AS stage,
    'event_only_proxy' AS measurement_status,
    toStartOfDay(now()) - INTERVAL 28 DAY AS rolling_window_start,
    toStartOfDay(now()) AS rolling_window_end,
    toStartOfDay(now()) - INTERVAL 28 DAY AS current_period_start,
    toStartOfDay(now()) AS current_period_end,
    toStartOfDay(now()) - INTERVAL 56 DAY AS previous_period_start,
    toStartOfDay(now()) - INTERVAL 28 DAY AS previous_period_end,
    countIf(active_current) AS aat_28,
    countIf(active_previous) AS previous_aat_28,
    countIf(
        active_current
        AND activation_at >= toStartOfDay(now()) - INTERVAL 28 DAY
        AND activation_at < toStartOfDay(now())
    ) AS new_activated,
    countIf(active_current AND active_previous) AS retained,
    countIf(
        active_current
        AND NOT active_previous
        AND active_earlier
        AND activation_at < toStartOfDay(now()) - INTERVAL 28 DAY
    ) AS reactivated,
    countIf(active_previous AND NOT active_current) AS lost,
    countIf(
        active_current
        AND activation_at >= toStartOfDay(now()) - INTERVAL 28 DAY
        AND activation_at < toStartOfDay(now())
    )
        + countIf(
            active_current
            AND NOT active_previous
            AND active_earlier
            AND activation_at < toStartOfDay(now()) - INTERVAL 28 DAY
        )
        - countIf(active_previous AND NOT active_current) AS delta_aat,
    toStartOfDay(now()) - INTERVAL 84 DAY AS period_1_cohort_start,
    toStartOfDay(now()) - INTERVAL 56 DAY AS period_1_cohort_end,
    countIf(
        activation_at >= toStartOfDay(now()) - INTERVAL 84 DAY
        AND activation_at < toStartOfDay(now()) - INTERVAL 56 DAY
    ) AS period_1_mature_activated,
    countIf(
        activation_at >= toStartOfDay(now()) - INTERVAL 84 DAY
        AND activation_at < toStartOfDay(now()) - INTERVAL 56 DAY
        AND retained_in_days_29_to_56
    ) AS period_1_retained,
    if(
        countIf(
            activation_at >= toStartOfDay(now()) - INTERVAL 84 DAY
            AND activation_at < toStartOfDay(now()) - INTERVAL 56 DAY
        ) = 0,
        NULL,
        countIf(
            activation_at >= toStartOfDay(now()) - INTERVAL 84 DAY
            AND activation_at < toStartOfDay(now()) - INTERVAL 56 DAY
            AND retained_in_days_29_to_56
        ) * 1.0
            / countIf(
                activation_at >= toStartOfDay(now()) - INTERVAL 84 DAY
                AND activation_at < toStartOfDay(now()) - INTERVAL 56 DAY
            )
    ) AS period_1_retention_rate
FROM team_activity
