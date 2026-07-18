import {
  DEFAULT_QUERY_DIRECTORY,
  DEFAULT_TIMEOUT_MS,
  SCHEMA_VERSION,
  validateConfiguration,
  validateNodeVersion,
} from "./config.mjs";
import {
  queryStatusForError,
  safeError,
  statusError,
} from "./errors.mjs";
import { executeHogQlQuery } from "./hogql.mjs";
import { normalizeAggregateResult } from "./normalize.mjs";
import { loadQueries, resolveQueryPlaceholders } from "./queries.mjs";

export function baseSnapshot({ generatedAt, mode }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt,
    mode,
    status: "broken",
    source: "posthog",
    queries: [],
    metrics: {},
  };
}

function configurationUnavailableSnapshot({
  generatedAt,
  mode,
  queries,
  validation,
}) {
  const unavailable = baseSnapshot({ generatedAt, mode });
  const fields = validation.missing ?? validation.invalid ?? [];

  unavailable.status = "unavailable";
  unavailable.error = statusError(
    "missing_or_invalid_configuration",
    `PostHog read access is unavailable. Check: ${fields.join(", ")}.`,
  );
  unavailable.queries = (
    mode === "check" ? [{ name: "readiness" }] : queries
  ).map(({ name }) => ({
    name,
    data_status: "unavailable",
    error: statusError(
      "missing_or_invalid_configuration",
      "The PostHog read-only connection is not configured.",
    ),
  }));

  return unavailable;
}

function overallStatus(queryStatuses) {
  const available = queryStatuses.filter(
    (query) => query.data_status === "available",
  ).length;

  if (available === queryStatuses.length) {
    return "ready";
  }

  if (queryStatuses.some((query) => query.data_status === "broken")) {
    return "broken";
  }

  if (queryStatuses.some((query) => query.data_status === "unavailable")) {
    return "unavailable";
  }

  return "broken";
}

export async function runQuery({
  config,
  fetchImpl,
  query,
  timeoutMs,
}) {
  const startedAt = performance.now();

  try {
    const payload = await executeHogQlQuery({
      config,
      sql: resolveQueryPlaceholders(query.sql, config.deploymentEnvironment),
      fetchImpl,
      timeoutMs,
    });
    const result = normalizeAggregateResult(payload, query.name);

    return {
      queryStatus: {
        name: query.name,
        data_status: "available",
        rowCount: result.rowCount,
        durationMs: Math.round(performance.now() - startedAt),
      },
      metrics: result.metrics,
    };
  } catch (error) {
    return {
      queryStatus: {
        name: query.name,
        data_status: queryStatusForError(error),
        durationMs: Math.round(performance.now() - startedAt),
        error: safeError(error),
      },
    };
  }
}

export async function runScorecard({
  check = false,
  environment = process.env,
  fetchImpl = globalThis.fetch,
  generatedAt = new Date().toISOString(),
  queryDirectory = DEFAULT_QUERY_DIRECTORY,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  validateNodeVersion();

  const validation = validateConfiguration(environment);
  if (!validation.ok) {
    let unavailableQueries = [];

    if (!check) {
      try {
        unavailableQueries = await loadQueries(queryDirectory);
      } catch {
        // Missing credentials take precedence and no query contents are exposed.
      }
    }

    return configurationUnavailableSnapshot({
      generatedAt,
      mode: check ? "check" : "snapshot",
      queries: unavailableQueries,
      validation,
    });
  }

  let queries = [];
  if (!check) {
    try {
      queries = await loadQueries(queryDirectory);
    } catch (error) {
      const snapshot = baseSnapshot({ generatedAt, mode: "snapshot" });
      const dataStatus = queryStatusForError(error);

      snapshot.status = dataStatus;
      snapshot.error = safeError(error);
      snapshot.queries = [
        {
          name: "scorecard_queries",
          data_status: dataStatus,
          error: safeError(error),
        },
      ];
      return snapshot;
    }
  }

  const snapshot = baseSnapshot({
    generatedAt,
    mode: check ? "check" : "snapshot",
  });
  const queriesToRun = check
    ? [{ name: "readiness", sql: "SELECT 1 AS ready" }]
    : queries;
  const settledQueries = await Promise.allSettled(
    queriesToRun.map((query) =>
      runQuery({
        config: validation.config,
        fetchImpl,
        query,
        timeoutMs,
      }),
    ),
  );

  settledQueries.forEach((settledQuery, index) => {
    if (settledQuery.status === "rejected") {
      const error = settledQuery.reason;
      snapshot.queries.push({
        name: queriesToRun[index].name,
        data_status: queryStatusForError(error),
        durationMs: 0,
        error: safeError(error),
      });
      return;
    }

    snapshot.queries.push(settledQuery.value.queryStatus);
    if (Object.hasOwn(settledQuery.value, "metrics")) {
      snapshot.metrics[queriesToRun[index].name] = settledQuery.value.metrics;
    }
  });

  snapshot.status = overallStatus(snapshot.queries);
  return snapshot;
}
