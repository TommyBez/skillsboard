-- name: activation_v1
-- Two fully mature 14-day team-creation cohorts are compared.
WITH cohort_windows AS (
    SELECT
        'current' AS cohort_period,
        toStartOfDay(now()) - INTERVAL 28 DAY AS cohort_start,
        toStartOfDay(now()) - INTERVAL 14 DAY AS cohort_end,
        1 AS sort_order
    UNION ALL
    SELECT
        'previous',
        toStartOfDay(now()) - INTERVAL 42 DAY,
        toStartOfDay(now()) - INTERVAL 28 DAY,
        2
),
scoped_events AS (
    SELECT
        event,
        timestamp,
        properties
    FROM events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 42 DAY
      AND timestamp < toStartOfDay(now())
      AND properties.analytics_schema_version = 2
      AND properties.deployment_environment = '{{environment}}'
      AND properties.team_id IS NOT NULL
      AND properties.team_id != ''
      AND event IN (
          'team_created',
          'skill_saved',
          'team_member_invited',
          'invitation_accepted',
          'skill_usage_path_selected',
          'skill_downloaded'
      )
),
created_teams AS (
    SELECT
        properties.team_id AS scoped_team_key,
        min(timestamp) AS created_at
    FROM scoped_events
    WHERE event = 'team_created'
      AND timestamp >= toStartOfDay(now()) - INTERVAL 42 DAY
      AND timestamp < toStartOfDay(now()) - INTERVAL 14 DAY
    GROUP BY properties.team_id
),
skill_milestones AS (
    SELECT
        created.scoped_team_key AS scoped_team_key,
        created.created_at AS created_at,
        minIf(
            toNullable(candidate.timestamp),
            candidate.event = 'skill_saved'
            AND candidate.timestamp >= created.created_at
            AND candidate.timestamp < created.created_at + INTERVAL 1 DAY
        ) AS first_skill_at
    FROM created_teams AS created
    LEFT JOIN scoped_events AS candidate
        ON candidate.properties.team_id = created.scoped_team_key
    GROUP BY created.scoped_team_key, created.created_at
),
invite_milestones AS (
    SELECT
        skilled.scoped_team_key AS scoped_team_key,
        skilled.created_at AS created_at,
        skilled.first_skill_at AS first_skill_at,
        minIf(
            toNullable(candidate.timestamp),
            candidate.event = 'team_member_invited'
            AND skilled.first_skill_at IS NOT NULL
            AND candidate.timestamp >= skilled.first_skill_at
            AND candidate.timestamp < skilled.created_at + INTERVAL 3 DAY
        ) AS first_invite_at
    FROM skill_milestones AS skilled
    LEFT JOIN scoped_events AS candidate
        ON candidate.properties.team_id = skilled.scoped_team_key
    GROUP BY skilled.scoped_team_key, skilled.created_at, skilled.first_skill_at
),
acceptance_milestones AS (
    SELECT
        first.scoped_team_key AS scoped_team_key,
        first.created_at AS created_at,
        first.first_skill_at AS first_skill_at,
        first.first_invite_at AS first_invite_at,
        minIf(
            toNullable(candidate.timestamp),
            candidate.event = 'invitation_accepted'
            AND first.first_skill_at IS NOT NULL
            AND first.first_invite_at IS NOT NULL
            AND candidate.timestamp >= first.first_invite_at
            AND candidate.timestamp < first.created_at + INTERVAL 7 DAY
        ) AS first_acceptance_at
    FROM invite_milestones AS first
    LEFT JOIN scoped_events AS candidate
        ON candidate.properties.team_id = first.scoped_team_key
    GROUP BY
        first.scoped_team_key,
        first.created_at,
        first.first_skill_at,
        first.first_invite_at
),
value_milestones AS (
    SELECT
        accepted.scoped_team_key AS scoped_team_key,
        accepted.created_at AS created_at,
        accepted.first_skill_at AS first_skill_at,
        accepted.first_invite_at AS first_invite_at,
        accepted.first_acceptance_at AS first_acceptance_at,
        minIf(
            toNullable(candidate.timestamp),
            candidate.event IN ('skill_usage_path_selected', 'skill_downloaded')
            AND candidate.properties.actor_is_skill_creator = false
            AND accepted.first_acceptance_at IS NOT NULL
            AND candidate.timestamp >= accepted.first_acceptance_at
            AND candidate.timestamp < accepted.created_at + INTERVAL 14 DAY
        ) AS first_noncreator_value_at
    FROM acceptance_milestones AS accepted
    LEFT JOIN scoped_events AS candidate
        ON candidate.properties.team_id = accepted.scoped_team_key
    GROUP BY
        accepted.scoped_team_key,
        accepted.created_at,
        accepted.first_skill_at,
        accepted.first_invite_at,
        accepted.first_acceptance_at
),
cohort_teams AS (
    SELECT
        scoped_team_key,
        created_at,
        first_skill_at,
        first_invite_at,
        first_acceptance_at,
        first_noncreator_value_at,
        if(
            created_at >= toStartOfDay(now()) - INTERVAL 28 DAY,
            'current',
            'previous'
        ) AS cohort_period
    FROM value_milestones
)
SELECT
    window.cohort_period AS cohort_period,
    window.cohort_start AS cohort_start,
    window.cohort_end AS cohort_end,
    14 AS observation_days,
    countIf(team.scoped_team_key IS NOT NULL) AS teams_created,
    countIf(team.first_skill_at IS NOT NULL) AS teams_with_first_skill_24h,
    countIf(team.first_invite_at IS NOT NULL) AS teams_with_invite_72h,
    countIf(team.first_acceptance_at IS NOT NULL) AS teams_with_acceptance_7d,
    countIf(team.first_noncreator_value_at IS NOT NULL) AS teams_activated_14d,
    countIf(team.scoped_team_key IS NOT NULL AND team.first_skill_at IS NULL) AS stalled_before_first_skill,
    countIf(
        team.first_skill_at IS NOT NULL
        AND team.first_invite_at IS NULL
    ) AS stalled_before_invite,
    countIf(
        team.first_invite_at IS NOT NULL
        AND team.first_acceptance_at IS NULL
    ) AS stalled_before_acceptance,
    countIf(
        team.first_acceptance_at IS NOT NULL
        AND team.first_noncreator_value_at IS NULL
    ) AS stalled_before_noncreator_value,
    if(
        countIf(team.scoped_team_key IS NOT NULL) = 0,
        NULL,
        countIf(team.first_noncreator_value_at IS NOT NULL) * 1.0
            / countIf(team.scoped_team_key IS NOT NULL)
    ) AS activation_rate_14d,
    if(
        countIf(team.first_noncreator_value_at IS NOT NULL) = 0,
        NULL,
        medianIf(
            dateDiff('minute', team.created_at, team.first_noncreator_value_at),
            team.first_noncreator_value_at IS NOT NULL
        )
    ) AS median_minutes_to_activation,
    if(
        countIf(team.scoped_team_key IS NOT NULL) = 0,
        'empty',
        'mature'
    ) AS cohort_maturity
FROM cohort_windows AS window
LEFT JOIN cohort_teams AS team
    ON team.cohort_period = window.cohort_period
GROUP BY
    window.cohort_period,
    window.cohort_start,
    window.cohort_end,
    window.sort_order
ORDER BY window.sort_order
