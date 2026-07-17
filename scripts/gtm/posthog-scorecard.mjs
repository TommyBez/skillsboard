#!/usr/bin/env node

import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { config as loadDotenv } from "dotenv";

export const SCHEMA_VERSION = 1;
export const DEFAULT_TIMEOUT_MS = 15_000;

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "../..");
export const DEFAULT_QUERY_DIRECTORY = resolve(SCRIPT_DIRECTORY, "queries");
export const DEFAULT_OUTPUT_PATH = resolve(
  REPOSITORY_ROOT,
  ".agents/loops/skillsboard-gtm-pulse-data.json",
);

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_RESULT_ROWS = 100;
const MAX_RESULT_COLUMNS = 64;
const MAX_STRING_LENGTH = 256;

const REQUIRED_ENVIRONMENT_VARIABLES = [
  "POSTHOG_PERSONAL_API_KEY",
  "POSTHOG_PROJECT_ID",
  "POSTHOG_API_HOST",
];
const DEFAULT_DEPLOYMENT_ENVIRONMENT = "production";
const ALLOWED_DEPLOYMENT_ENVIRONMENTS = new Set([
  "production",
  "preview",
  "development",
]);
const ENVIRONMENT_PLACEHOLDER = "{{environment}}";
const UNRESOLVED_PLACEHOLDER_PATTERN = /\{\{[^{}]+\}\}/;

const RESERVED_QUERY_NAMES = new Set(["__proto__", "constructor", "prototype"]);
const SENSITIVE_COLUMN_PATTERN =
  /(^|_)(distinct_id|person_id|user_id|team_id|organization_id|session_id|device_id|uuid|email|first_name|last_name|full_name|ip|url|token|secret|password|properties|elements_chain|raw_event|event_id)(_|$)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IP_ADDRESS_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

class ScorecardError extends Error {
  constructor(code, message, dataStatus = "broken") {
    super(message);
    this.name = "ScorecardError";
    this.code = code;
    this.dataStatus = dataStatus;
  }
}

function statusError(code, message) {
  return { code, message };
}

function safeError(error) {
  if (error instanceof ScorecardError) {
    return statusError(error.code, error.message);
  }

  return statusError("unexpected_error", "The PostHog scorecard runner failed unexpectedly.");
}

function queryStatusForError(error) {
  return error instanceof ScorecardError && error.dataStatus === "unavailable"
    ? "unavailable"
    : "broken";
}

function validateNodeVersion() {
  const majorVersion = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

  if (!Number.isFinite(majorVersion) || majorVersion < 20) {
    throw new ScorecardError(
      "unsupported_node_version",
      "The PostHog scorecard runner requires Node.js 20 or newer.",
      "unavailable",
    );
  }
}

function normalizeHost(host) {
  let parsedHost;

  try {
    parsedHost = new URL(host);
  } catch {
    throw new ScorecardError(
      "invalid_posthog_host",
      "POSTHOG_API_HOST must be a valid HTTP(S) origin.",
      "unavailable",
    );
  }

  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(parsedHost.hostname);
  if (parsedHost.protocol !== "https:" && !(parsedHost.protocol === "http:" && isLocalHost)) {
    throw new ScorecardError(
      "invalid_posthog_host",
      "POSTHOG_API_HOST must use HTTPS (HTTP is accepted only for localhost tests).",
      "unavailable",
    );
  }

  if (parsedHost.username || parsedHost.password || parsedHost.search || parsedHost.hash) {
    throw new ScorecardError(
      "invalid_posthog_host",
      "POSTHOG_API_HOST must not contain credentials, query parameters, or fragments.",
      "unavailable",
    );
  }

  parsedHost.pathname = "/";
  return parsedHost.origin;
}

export function validateConfiguration(environment = process.env) {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter(
    (name) => typeof environment[name] !== "string" || environment[name].trim() === "",
  );

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  const projectId = environment.POSTHOG_PROJECT_ID.trim();
  if (!/^\d+$/.test(projectId)) {
    return {
      ok: false,
      invalid: ["POSTHOG_PROJECT_ID"],
    };
  }

  const deploymentEnvironment =
    environment.POSTHOG_DEPLOYMENT_ENVIRONMENT?.trim() ||
    DEFAULT_DEPLOYMENT_ENVIRONMENT;
  if (!ALLOWED_DEPLOYMENT_ENVIRONMENTS.has(deploymentEnvironment)) {
    return {
      ok: false,
      invalid: ["POSTHOG_DEPLOYMENT_ENVIRONMENT"],
    };
  }

  try {
    return {
      ok: true,
      config: {
        apiKey: environment.POSTHOG_PERSONAL_API_KEY.trim(),
        projectId,
        host: normalizeHost(environment.POSTHOG_API_HOST.trim()),
        deploymentEnvironment,
      },
    };
  } catch (error) {
    if (error instanceof ScorecardError) {
      return {
        ok: false,
        invalid: ["POSTHOG_API_HOST"],
        error: safeError(error),
      };
    }

    throw error;
  }
}

export function resolveQueryPlaceholders(sql, deploymentEnvironment) {
  if (!ALLOWED_DEPLOYMENT_ENVIRONMENTS.has(deploymentEnvironment)) {
    throw new ScorecardError(
      "invalid_deployment_environment",
      "The PostHog deployment environment is not allowlisted.",
      "unavailable",
    );
  }

  const resolvedSql = sql.replaceAll(ENVIRONMENT_PLACEHOLDER, deploymentEnvironment);
  if (UNRESOLVED_PLACEHOLDER_PATTERN.test(resolvedSql)) {
    throw new ScorecardError(
      "unresolved_query_placeholder",
      "A PostHog scorecard query contains an unsupported placeholder.",
      "unavailable",
    );
  }

  return resolvedSql;
}

function parseQueryName(sql, fileName) {
  const explicitName = sql.match(/^\s*--\s*name\s*:\s*([a-z0-9][a-z0-9_.-]*)\s*$/im)?.[1];
  const queryName = explicitName ?? basename(fileName, extname(fileName));

  if (!/^[a-z0-9][a-z0-9_.-]*$/.test(queryName) || RESERVED_QUERY_NAMES.has(queryName)) {
    throw new ScorecardError(
      "invalid_query_name",
      `Query file ${fileName} has an invalid name. Use lowercase letters, numbers, dots, dashes, or underscores.`,
    );
  }

  return queryName;
}

function validateQuerySql(sql, fileName) {
  const normalizedSql = sql.trim();

  if (normalizedSql === "") {
    throw new ScorecardError("empty_query", `Query file ${fileName} is empty.`);
  }

  if (/\bselect\s+(?:[a-zA-Z_][\w]*\.)?\*/i.test(normalizedSql)) {
    throw new ScorecardError(
      "unsafe_query",
      `Query file ${fileName} uses SELECT *, which is not allowed for aggregate scorecards.`,
    );
  }

  if (
    !/\b(count(?:if)?|sum(?:if)?|avg(?:if)?|min(?:if)?|max(?:if)?|uniq\w*|quantile\w*|median\w*|group\s+by)\s*\(?/i.test(
      normalizedSql,
    )
  ) {
    throw new ScorecardError(
      "non_aggregate_query",
      `Query file ${fileName} must return aggregate metrics rather than raw events.`,
    );
  }

  return normalizedSql;
}

export async function loadQueries(queryDirectory = DEFAULT_QUERY_DIRECTORY) {
  let entries;

  try {
    entries = await readdir(queryDirectory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      throw new ScorecardError(
        "query_directory_missing",
        "The PostHog scorecard query directory is missing.",
        "unavailable",
      );
    }

    throw error;
  }

  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (fileNames.length === 0) {
    throw new ScorecardError(
      "queries_missing",
      "No PostHog scorecard .sql queries were found.",
      "unavailable",
    );
  }

  const queries = [];
  const names = new Set();

  for (const fileName of fileNames) {
    const sql = await readFile(resolve(queryDirectory, fileName), "utf8");
    const name = parseQueryName(sql, fileName);

    if (names.has(name)) {
      throw new ScorecardError(
        "duplicate_query_name",
        `More than one scorecard query is named ${name}.`,
      );
    }

    names.add(name);
    queries.push({ name, sql: validateQuerySql(sql, fileName) });
  }

  return queries;
}

function responseError(response) {
  if (response.status === 401 || response.status === 403) {
    return new ScorecardError(
      "authentication_failed",
      "PostHog rejected the read-only API credentials.",
    );
  }

  if (response.status === 429) {
    return new ScorecardError(
      "rate_limited",
      "PostHog rate-limited the scorecard query.",
    );
  }

  if (response.status >= 500) {
    return new ScorecardError(
      "posthog_unavailable",
      "PostHog is temporarily unavailable.",
    );
  }

  return new ScorecardError(
    "query_rejected",
    `PostHog rejected the scorecard query with HTTP ${response.status}.`,
  );
}

export async function executeHogQlQuery({
  config,
  sql,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  if (typeof fetchImpl !== "function") {
    throw new ScorecardError("fetch_unavailable", "This Node.js runtime does not provide fetch.");
  }

  const endpoint = new URL(
    `/api/projects/${encodeURIComponent(config.projectId)}/query/`,
    config.host,
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;

    try {
      response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: sql,
          },
        }),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted || (error && error.name === "AbortError")) {
        throw new ScorecardError(
          "query_timeout",
          "The PostHog scorecard query timed out.",
        );
      }

      throw new ScorecardError(
        "network_error",
        "The PostHog scorecard query could not reach the API.",
      );
    }

    if (!response.ok) {
      throw responseError(response);
    }

    const responseText = await response.text();
    if (Buffer.byteLength(responseText, "utf8") > MAX_RESPONSE_BYTES) {
      throw new ScorecardError(
        "response_too_large",
        "PostHog returned more data than an aggregate scorecard may contain.",
      );
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new ScorecardError("invalid_response", "PostHog returned invalid JSON.");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function validateAggregateScalar(value) {
  if (value === null || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ScorecardError(
        "unsafe_result_shape",
        "A scorecard result contained a non-finite number.",
      );
    }

    return value;
  }

  if (typeof value === "string") {
    if (
      value.length > MAX_STRING_LENGTH ||
      EMAIL_PATTERN.test(value) ||
      UUID_PATTERN.test(value) ||
      IP_ADDRESS_PATTERN.test(value) ||
      /^https?:\/\//i.test(value)
    ) {
      throw new ScorecardError(
        "unsafe_result_value",
        "A scorecard result contained a value that may identify a person or raw event.",
      );
    }

    return value;
  }

  throw new ScorecardError(
    "unsafe_result_shape",
    "Scorecard results may contain only aggregate scalar values.",
  );
}

export function normalizeAggregateResult(payload) {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.columns) ||
    !Array.isArray(payload.results)
  ) {
    throw new ScorecardError(
      "invalid_response_shape",
      "PostHog did not return tabular HogQL results.",
    );
  }

  if (payload.columns.length === 0 || payload.columns.length > MAX_RESULT_COLUMNS) {
    throw new ScorecardError(
      "unsafe_result_shape",
      "The scorecard query returned an invalid number of columns.",
    );
  }

  if (payload.results.length > MAX_RESULT_ROWS) {
    throw new ScorecardError(
      "unsafe_result_shape",
      "The scorecard query returned too many rows to be aggregate output.",
    );
  }

  const columns = payload.columns.map((column) => {
    if (
      typeof column !== "string" ||
      !/^[a-z][a-z0-9_]*$/.test(column) ||
      SENSITIVE_COLUMN_PATTERN.test(column)
    ) {
      throw new ScorecardError(
        "unsafe_result_column",
        "The scorecard query returned a raw or sensitive column.",
      );
    }

    return column;
  });

  if (new Set(columns).size !== columns.length) {
    throw new ScorecardError(
      "unsafe_result_shape",
      "The scorecard query returned duplicate column names.",
    );
  }

  const records = payload.results.map((row) => {
    if (!Array.isArray(row) || row.length !== columns.length) {
      throw new ScorecardError(
        "invalid_response_shape",
        "PostHog returned a malformed scorecard row.",
      );
    }

    return Object.fromEntries(
      columns.map((column, index) => [column, validateAggregateScalar(row[index])]),
    );
  });

  if (records.length === 1) {
    return { metrics: records[0], rowCount: 1 };
  }

  return { metrics: records, rowCount: records.length };
}

function baseSnapshot({ generatedAt, mode }) {
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

function configurationUnavailableSnapshot({ generatedAt, mode, queries, validation }) {
  const unavailable = baseSnapshot({ generatedAt, mode });
  const fields = validation.missing ?? validation.invalid ?? [];

  unavailable.status = "unavailable";
  unavailable.error = statusError(
    "missing_or_invalid_configuration",
    `PostHog read access is unavailable. Check: ${fields.join(", ")}.`,
  );
  unavailable.queries = (mode === "check" ? [{ name: "readiness" }] : queries).map(
    ({ name }) => ({
      name,
      data_status: "unavailable",
      error: statusError(
        "missing_or_invalid_configuration",
        "The PostHog read-only connection is not configured.",
      ),
    }),
  );

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

  const snapshot = baseSnapshot({ generatedAt, mode: check ? "check" : "snapshot" });
  const queriesToRun = check
    ? [{ name: "readiness", sql: "SELECT 1 AS ready" }]
    : queries;

  for (const query of queriesToRun) {
    const startedAt = performance.now();

    try {
      const payload = await executeHogQlQuery({
        config: validation.config,
        sql: resolveQueryPlaceholders(
          query.sql,
          validation.config.deploymentEnvironment,
        ),
        fetchImpl,
        timeoutMs,
      });
      const result = normalizeAggregateResult(payload);

      snapshot.queries.push({
        name: query.name,
        data_status: "available",
        rowCount: result.rowCount,
        durationMs: Math.round(performance.now() - startedAt),
      });
      snapshot.metrics[query.name] = result.metrics;
    } catch (error) {
      snapshot.queries.push({
        name: query.name,
        data_status: queryStatusForError(error),
        durationMs: Math.round(performance.now() - startedAt),
        error: safeError(error),
      });
    }
  }

  snapshot.status = overallStatus(snapshot.queries);
  return snapshot;
}

export async function writeJsonAtomically(outputPath, value) {
  const outputDirectory = dirname(outputPath);
  const temporaryPath = resolve(
    outputDirectory,
    `.${basename(outputPath)}.${process.pid}.${Date.now()}.tmp`,
  );

  await mkdir(outputDirectory, { recursive: true });

  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporaryPath, outputPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

export function parseCliArguments(argumentsList) {
  const options = {
    check: false,
    help: false,
    outputPath: DEFAULT_OUTPUT_PATH,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    if (argument === "--check") {
      options.check = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--output") {
      const outputPath = argumentsList[index + 1];
      if (!outputPath) {
        throw new ScorecardError("invalid_arguments", "--output requires a file path.");
      }

      options.outputPath = resolve(process.cwd(), outputPath);
      index += 1;
      continue;
    }

    if (argument === "--timeout-ms") {
      const timeoutValue = Number.parseInt(argumentsList[index + 1] ?? "", 10);
      if (!Number.isInteger(timeoutValue) || timeoutValue < 1_000 || timeoutValue > 60_000) {
        throw new ScorecardError(
          "invalid_arguments",
          "--timeout-ms must be an integer between 1000 and 60000.",
        );
      }

      options.timeoutMs = timeoutValue;
      index += 1;
      continue;
    }

    throw new ScorecardError("invalid_arguments", "An unknown command-line argument was provided.");
  }

  return options;
}

function helpText() {
  return [
    "Usage: node scripts/gtm/posthog-scorecard.mjs [--check] [--output PATH] [--timeout-ms N]",
    "",
    "Without --check, executes aggregate queries and atomically writes:",
    `  ${DEFAULT_OUTPUT_PATH}`,
    "",
    "--check validates credentials and PostHog query API access without writing a snapshot.",
  ].join("\n");
}

export async function runCli(argumentsList = process.argv.slice(2)) {
  loadDotenv({ path: resolve(REPOSITORY_ROOT, ".env.local"), override: false, quiet: true });

  let options;
  try {
    options = parseCliArguments(argumentsList);
  } catch (error) {
    const snapshot = baseSnapshot({ generatedAt: new Date().toISOString(), mode: "check" });
    snapshot.error = safeError(error);
    process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
    return 1;
  }

  if (options.help) {
    process.stdout.write(`${helpText()}\n`);
    return 0;
  }

  const snapshot = await runScorecard({
    check: options.check,
    timeoutMs: options.timeoutMs,
  });

  if (!options.check) {
    await writeJsonAtomically(options.outputPath, snapshot);
  }

  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);

  if (snapshot.status === "ready") {
    return 0;
  }

  return snapshot.status === "unavailable" ? 2 : 1;
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  runCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch(() => {
      const snapshot = baseSnapshot({ generatedAt: new Date().toISOString(), mode: "snapshot" });
      snapshot.error = statusError(
        "unexpected_error",
        "The PostHog scorecard runner failed unexpectedly.",
      );
      process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
      process.exitCode = 1;
    });
}
