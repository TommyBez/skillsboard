import { z } from "zod";

import {
  ANALYTICS_EVENT_MANIFEST,
  TRACKING_HEALTH_EVENT_NAMES,
} from "./event-manifest.mjs";

const ISO_UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;

const nonNegativeInteger = z.number().int().nonnegative();
const nullableNonNegativeNumber = z.number().nonnegative().nullable();
const nullableRate = z.number().min(0).max(1).nullable();
const utcTimestamp = z
  .string()
  .regex(ISO_UTC_TIMESTAMP_PATTERN)
  .refine((value) => Number.isFinite(Date.parse(value)));
const nullableUtcTimestamp = utcTimestamp.nullable();

function withRequiredValues(rowsSchema, column, requiredValues) {
  return rowsSchema.superRefine((rows, context) => {
    const observedValues = new Set(rows.map((row) => row[column]));

    if (
      observedValues.size !== requiredValues.length ||
      requiredValues.some((requiredValue) => !observedValues.has(requiredValue))
    ) {
      context.addIssue({
        code: "custom",
        message: `Expected exactly one row for each required ${column} value.`,
      });
    }
  });
}

function queryResultContract({
  fields,
  exactRows,
  refineRows,
  requiredValues,
  allowSourceFreeConstantRow = false,
}) {
  const columns = Object.freeze(fields.map(([column]) => column));
  const rowSchema = z.object(Object.fromEntries(fields)).strict();
  let rowsSchema = z.array(rowSchema).length(exactRows);

  if (requiredValues) {
    rowsSchema = withRequiredValues(
      rowsSchema,
      requiredValues.column,
      requiredValues.values,
    );
  }

  if (refineRows) {
    rowsSchema = rowsSchema.superRefine(refineRows);
  }

  return Object.freeze({
    allowSourceFreeConstantRow,
    columns,
    columnsSchema: z.tuple(columns.map((column) => z.literal(column))),
    exactRows,
    rowsSchema,
  });
}

export const QUERY_RESULT_SCHEMAS = Object.freeze({
  readiness: queryResultContract({
    exactRows: 1,
    fields: [["ready", z.literal(1)]],
  }),
  acquisition_v1: queryResultContract({
    exactRows: 1,
    fields: [
      ["stage", z.literal("acquisition")],
      ["decision_status", z.literal("unavailable")],
      [
        "unavailable_reason",
        z.literal("qualified_visitor_and_source_attribution_not_instrumented"),
      ],
      ["current_window_start", utcTimestamp],
      ["current_window_end", utcTimestamp],
      ["previous_window_start", utcTimestamp],
      ["previous_window_end", utcTimestamp],
      ["current_public_pageviews", nonNegativeInteger],
      ["current_public_visitors", nonNegativeInteger],
      ["current_anonymous_cta_clicks", nonNegativeInteger],
      ["current_new_team_signup_intents", nonNegativeInteger],
      ["current_new_team_signups", nonNegativeInteger],
      ["current_team_starts", nonNegativeInteger],
      ["current_raw_signup_intent_rate", nullableNonNegativeNumber],
      ["current_signup_completion_rate", nullableNonNegativeNumber],
      ["current_team_start_rate", nullableNonNegativeNumber],
      ["previous_public_pageviews", nonNegativeInteger],
      ["previous_public_visitors", nonNegativeInteger],
      ["previous_anonymous_cta_clicks", nonNegativeInteger],
      ["previous_new_team_signup_intents", nonNegativeInteger],
      ["previous_new_team_signups", nonNegativeInteger],
      ["previous_team_starts", nonNegativeInteger],
    ],
  }),
  activation_v1: queryResultContract({
    exactRows: 2,
    fields: [
      ["cohort_period", z.enum(["current", "previous"])],
      ["cohort_start", utcTimestamp],
      ["cohort_end", utcTimestamp],
      ["observation_days", z.literal(14)],
      ["teams_created", nonNegativeInteger],
      ["teams_with_first_skill_24h", nonNegativeInteger],
      ["teams_with_invite_72h", nonNegativeInteger],
      ["teams_with_acceptance_7d", nonNegativeInteger],
      ["teams_activated_14d", nonNegativeInteger],
      ["stalled_before_first_skill", nonNegativeInteger],
      ["stalled_before_invite", nonNegativeInteger],
      ["stalled_before_acceptance", nonNegativeInteger],
      ["stalled_before_noncreator_value", nonNegativeInteger],
      ["activation_rate_14d", nullableRate],
      ["median_minutes_to_activation", nullableNonNegativeNumber],
      ["cohort_maturity", z.enum(["empty", "mature"])],
    ],
    requiredValues: {
      column: "cohort_period",
      values: ["current", "previous"],
    },
  }),
  retention_v1: queryResultContract({
    exactRows: 1,
    allowSourceFreeConstantRow: true,
    fields: [
      ["stage", z.literal("retention")],
      ["measurement_status", z.literal("unavailable")],
      [
        "unavailable_reason",
        z.literal("historical_activation_milestones_not_backfilled"),
      ],
      ["rolling_window_start", utcTimestamp],
      ["rolling_window_end", utcTimestamp],
      ["current_period_start", utcTimestamp],
      ["current_period_end", utcTimestamp],
      ["previous_period_start", utcTimestamp],
      ["previous_period_end", utcTimestamp],
      ["aat_28", z.null()],
      ["previous_aat_28", z.null()],
      ["new_activated", z.null()],
      ["retained", z.null()],
      ["reactivated", z.null()],
      ["lost", z.null()],
      ["delta_aat", z.null()],
      ["period_1_cohort_start", utcTimestamp],
      ["period_1_cohort_end", utcTimestamp],
      ["period_1_mature_activated", z.null()],
      ["period_1_retained", z.null()],
      ["period_1_retention_rate", z.null()],
    ],
  }),
  tracking_health_v1: queryResultContract({
    exactRows: TRACKING_HEALTH_EVENT_NAMES.length,
    fields: [
      ["event_name", z.enum(TRACKING_HEALTH_EVENT_NAMES)],
      ["team_scoped_required", z.union([z.literal(0), z.literal(1)])],
      ["window_start", utcTimestamp],
      ["window_end", utcTimestamp],
      ["event_count", nonNegativeInteger],
      ["unique_teams", nonNegativeInteger],
      ["missing_team_scope_count", nonNegativeInteger],
      ["invalid_schema_count", nonNegativeInteger],
      ["missing_environment_count", nonNegativeInteger],
      ["first_seen_at", nullableUtcTimestamp],
      ["last_seen_at", nullableUtcTimestamp],
      [
        "health_status",
        z.enum([
          "missing",
          "schema_mismatch",
          "missing_environment",
          "missing_team_scope",
          "healthy",
        ]),
      ],
    ],
    requiredValues: {
      column: "event_name",
      values: TRACKING_HEALTH_EVENT_NAMES,
    },
    refineRows: (rows, context) => {
      for (const row of rows) {
        const eventDefinition = ANALYTICS_EVENT_MANIFEST[row.event_name];
        if (!eventDefinition) {
          context.addIssue({
            code: "custom",
            message: "Tracking-health event is not declared in the event manifest.",
          });
          continue;
        }

        const expectedTeamScope = eventDefinition.teamScoped ? 1 : 0;

        if (row.team_scoped_required !== expectedTeamScope) {
          context.addIssue({
            code: "custom",
            message: "Tracking-health team scope does not match the event manifest.",
          });
        }
      }
    },
  }),
});

export const QUERY_RESULT_NAMES = Object.freeze(Object.keys(QUERY_RESULT_SCHEMAS));

export function getQueryResultSchema(queryName) {
  return Object.hasOwn(QUERY_RESULT_SCHEMAS, queryName)
    ? QUERY_RESULT_SCHEMAS[queryName]
    : undefined;
}

export { TRACKING_HEALTH_EVENT_NAMES };
