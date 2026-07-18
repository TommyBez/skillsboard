import { z } from "zod";

import { getQueryResultSchema } from "../../../analytics/posthog/query-result-schemas.mjs";
import { ScorecardError } from "./errors.mjs";

const MAX_RESULT_ROWS = 100;
const MAX_RESULT_COLUMNS = 64;
const MAX_STRING_LENGTH = 256;

const SENSITIVE_COLUMN_PATTERN =
  /(^|_)(distinct_id|person_id|user_id|team_id|organization_id|session_id|device_id|uuid|email|first_name|last_name|full_name|ip|url|token|secret|password|properties|elements_chain|raw_event|event_id)(_|$)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IP_ADDRESS_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

const tabularPayloadSchema = z
  .object({
    columns: z.array(z.unknown()),
    results: z.array(z.unknown()),
  })
  .passthrough();
const boundedPayloadSchema = z.object({
  columns: z.array(z.unknown()).min(1).max(MAX_RESULT_COLUMNS),
  results: z.array(z.unknown()).max(MAX_RESULT_ROWS),
});
const resultColumnSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/)
  .refine((column) => !SENSITIVE_COLUMN_PATTERN.test(column));
const aggregateScalarShapeSchema = z.union([
  z.null(),
  z.boolean(),
  z.number().finite(),
  z.string(),
]);
const safeAggregateStringSchema = z
  .string()
  .max(MAX_STRING_LENGTH)
  .refine((value) => !EMAIL_PATTERN.test(value))
  .refine((value) => !UUID_PATTERN.test(value))
  .refine((value) => !IP_ADDRESS_PATTERN.test(value))
  .refine((value) => !/^https?:\/\//i.test(value));

function requireQueryResultSchema(queryName) {
  if (typeof queryName !== "string" || queryName === "") {
    throw new ScorecardError(
      "query_schema_missing",
      "normalizeAggregateResult requires an explicit query name.",
      "unavailable",
    );
  }

  const schema = getQueryResultSchema(queryName);
  if (!schema) {
    throw new ScorecardError(
      "query_schema_missing",
      `Query ${queryName} does not have an explicit result schema.`,
      "unavailable",
    );
  }

  return schema;
}

function validateAggregateValues(results) {
  for (const row of results) {
    for (const value of row) {
      if (!aggregateScalarShapeSchema.safeParse(value).success) {
        throw new ScorecardError(
          "unsafe_result_shape",
          "Scorecard results may contain only aggregate scalar values.",
        );
      }

      if (
        typeof value === "string" &&
        !safeAggregateStringSchema.safeParse(value).success
      ) {
        throw new ScorecardError(
          "unsafe_result_value",
          "A scorecard result contained a value that may identify a person or raw event.",
        );
      }
    }
  }
}

export function normalizeAggregateResult(payload, queryName) {
  const resultSchema = requireQueryResultSchema(queryName);
  const tabularPayload = tabularPayloadSchema.safeParse(payload);

  if (!tabularPayload.success) {
    throw new ScorecardError(
      "invalid_response_shape",
      "PostHog did not return tabular HogQL results.",
    );
  }

  if (!boundedPayloadSchema.safeParse(tabularPayload.data).success) {
    throw new ScorecardError(
      "unsafe_result_shape",
      "The scorecard query returned an invalid number of rows or columns.",
    );
  }

  const columns = tabularPayload.data.columns;
  if (!z.array(resultColumnSchema).safeParse(columns).success) {
    throw new ScorecardError(
      "unsafe_result_column",
      "The scorecard query returned a raw or sensitive column.",
    );
  }

  if (new Set(columns).size !== columns.length) {
    throw new ScorecardError(
      "unsafe_result_shape",
      "The scorecard query returned duplicate column names.",
    );
  }

  if (!resultSchema.columnsSchema.safeParse(columns).success) {
    throw new ScorecardError(
      "unsafe_result_schema",
      "The scorecard result columns do not match the explicit schema for its query.",
    );
  }

  if (
    !z
      .array(z.unknown())
      .length(resultSchema.exactRows)
      .safeParse(tabularPayload.data.results).success
  ) {
    throw new ScorecardError(
      "unsafe_result_shape",
      "The scorecard result row count does not match the explicit schema for its query.",
    );
  }

  const rowStructureSchema = z.array(
    z.array(z.unknown()).length(columns.length),
  );
  const structuredRows = rowStructureSchema.safeParse(tabularPayload.data.results);
  if (!structuredRows.success) {
    throw new ScorecardError(
      "invalid_response_shape",
      "PostHog returned a malformed scorecard row.",
    );
  }

  validateAggregateValues(structuredRows.data);

  const records = structuredRows.data.map((row) =>
    Object.fromEntries(columns.map((column, index) => [column, row[index]])),
  );
  const parsedRecords = resultSchema.rowsSchema.safeParse(records);
  if (!parsedRecords.success) {
    throw new ScorecardError(
      "unsafe_result_value",
      "A scorecard result did not match the values allowed by its query schema.",
    );
  }

  if (parsedRecords.data.length === 1) {
    return { metrics: parsedRecords.data[0], rowCount: 1 };
  }

  return {
    metrics: parsedRecords.data,
    rowCount: parsedRecords.data.length,
  };
}
