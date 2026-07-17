-- name: acquisition_v1
-- Current and comparison windows are complete, adjacent 28-day periods.
WITH scoped_events AS (
    SELECT
        event,
        timestamp,
        distinct_id,
        properties
    FROM events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 56 DAY
      AND timestamp < toStartOfDay(now())
      AND properties.analytics_schema_version = 2
      AND properties.deployment_environment = '{{environment}}'
      AND event IN (
          '$pageview',
          'landing_cta_clicked',
          'signup_form_submitted',
          'user_signed_up',
          'team_created'
      )
),
current_period AS (
    SELECT
        countIf(event = '$pageview' AND properties.$pathname = '/') AS public_pageviews,
        uniqIf(distinct_id, event = '$pageview' AND properties.$pathname = '/') AS public_visitors,
        countIf(
            event = 'landing_cta_clicked'
            AND properties.visitor_state = 'anonymous'
        ) AS anonymous_cta_clicks,
        countIf(
            event = 'signup_form_submitted'
            AND properties.signup_context = 'new_team'
        ) AS new_team_signup_intents,
        countIf(
            event = 'user_signed_up'
            AND properties.signup_context = 'new_team'
        ) AS new_team_signups,
        uniqIf(
            properties.team_id,
            event = 'team_created'
            AND properties.team_id IS NOT NULL
            AND properties.team_id != ''
        ) AS team_starts
    FROM scoped_events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 28 DAY
      AND timestamp < toStartOfDay(now())
),
previous_period AS (
    SELECT
        countIf(event = '$pageview' AND properties.$pathname = '/') AS public_pageviews,
        uniqIf(distinct_id, event = '$pageview' AND properties.$pathname = '/') AS public_visitors,
        countIf(
            event = 'landing_cta_clicked'
            AND properties.visitor_state = 'anonymous'
        ) AS anonymous_cta_clicks,
        countIf(
            event = 'signup_form_submitted'
            AND properties.signup_context = 'new_team'
        ) AS new_team_signup_intents,
        countIf(
            event = 'user_signed_up'
            AND properties.signup_context = 'new_team'
        ) AS new_team_signups,
        uniqIf(
            properties.team_id,
            event = 'team_created'
            AND properties.team_id IS NOT NULL
            AND properties.team_id != ''
        ) AS team_starts
    FROM scoped_events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 56 DAY
      AND timestamp < toStartOfDay(now()) - INTERVAL 28 DAY
)
SELECT
    'acquisition' AS stage,
    'unavailable' AS decision_status,
    'qualified_visitor_and_source_attribution_not_instrumented' AS unavailable_reason,
    toStartOfDay(now()) - INTERVAL 28 DAY AS current_window_start,
    toStartOfDay(now()) AS current_window_end,
    toStartOfDay(now()) - INTERVAL 56 DAY AS previous_window_start,
    toStartOfDay(now()) - INTERVAL 28 DAY AS previous_window_end,
    current_metrics.public_pageviews AS current_public_pageviews,
    current_metrics.public_visitors AS current_public_visitors,
    current_metrics.anonymous_cta_clicks AS current_anonymous_cta_clicks,
    current_metrics.new_team_signup_intents AS current_new_team_signup_intents,
    current_metrics.new_team_signups AS current_new_team_signups,
    current_metrics.team_starts AS current_team_starts,
    if(
        current_metrics.public_visitors = 0,
        NULL,
        current_metrics.new_team_signup_intents * 1.0 / current_metrics.public_visitors
    ) AS current_raw_signup_intent_rate,
    if(
        current_metrics.new_team_signup_intents = 0,
        NULL,
        current_metrics.new_team_signups * 1.0 / current_metrics.new_team_signup_intents
    ) AS current_signup_completion_rate,
    if(
        current_metrics.new_team_signups = 0,
        NULL,
        current_metrics.team_starts * 1.0 / current_metrics.new_team_signups
    ) AS current_team_start_rate,
    previous_metrics.public_pageviews AS previous_public_pageviews,
    previous_metrics.public_visitors AS previous_public_visitors,
    previous_metrics.anonymous_cta_clicks AS previous_anonymous_cta_clicks,
    previous_metrics.new_team_signup_intents AS previous_new_team_signup_intents,
    previous_metrics.new_team_signups AS previous_new_team_signups,
    previous_metrics.team_starts AS previous_team_starts
FROM current_period AS current_metrics
CROSS JOIN previous_period AS previous_metrics
