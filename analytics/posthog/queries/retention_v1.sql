-- name: retention_v1
-- Fail closed without scanning events until historical activation milestones are reconciled.
SELECT
    'retention' AS stage,
    'unavailable' AS measurement_status,
    'historical_activation_milestones_not_backfilled' AS unavailable_reason,
    toStartOfDay(now()) - INTERVAL 28 DAY AS rolling_window_start,
    toStartOfDay(now()) AS rolling_window_end,
    toStartOfDay(now()) - INTERVAL 28 DAY AS current_period_start,
    toStartOfDay(now()) AS current_period_end,
    toStartOfDay(now()) - INTERVAL 56 DAY AS previous_period_start,
    toStartOfDay(now()) - INTERVAL 28 DAY AS previous_period_end,
    NULL AS aat_28,
    NULL AS previous_aat_28,
    NULL AS new_activated,
    NULL AS retained,
    NULL AS reactivated,
    NULL AS lost,
    NULL AS delta_aat,
    toStartOfDay(now()) - INTERVAL 84 DAY AS period_1_cohort_start,
    toStartOfDay(now()) - INTERVAL 56 DAY AS period_1_cohort_end,
    NULL AS period_1_mature_activated,
    NULL AS period_1_retained,
    NULL AS period_1_retention_rate
