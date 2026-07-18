import { readFile, readdir } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

import { getQueryResultSchema } from "../../../analytics/posthog/query-result-schemas.mjs";
import {
  DEFAULT_QUERY_DIRECTORY,
  isAllowedDeploymentEnvironment,
} from "./config.mjs";
import { ScorecardError } from "./errors.mjs";

const ENVIRONMENT_PLACEHOLDER = "{{environment}}";
const UNRESOLVED_PLACEHOLDER_PATTERN = /\{\{[^{}]+\}\}/;
const RESERVED_QUERY_NAMES = new Set(["__proto__", "constructor", "prototype"]);

export function resolveQueryPlaceholders(sql, deploymentEnvironment) {
  if (!isAllowedDeploymentEnvironment(deploymentEnvironment)) {
    throw new ScorecardError(
      "invalid_deployment_environment",
      "The PostHog deployment environment is not allowlisted.",
      "unavailable",
    );
  }

  const resolvedSql = sql.replaceAll(
    ENVIRONMENT_PLACEHOLDER,
    deploymentEnvironment,
  );
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
  const explicitName = sql.match(
    /^\s*--\s*name\s*:\s*([a-z0-9][a-z0-9_.-]*)\s*$/im,
  )?.[1];
  const queryName = explicitName ?? basename(fileName, extname(fileName));

  if (
    !/^[a-z0-9][a-z0-9_.-]*$/.test(queryName) ||
    RESERVED_QUERY_NAMES.has(queryName)
  ) {
    throw new ScorecardError(
      "invalid_query_name",
      `Query file ${fileName} has an invalid name. Use lowercase letters, numbers, dots, dashes, or underscores.`,
    );
  }

  return queryName;
}

export function requireQueryResultSchema(queryName) {
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

function validateQuerySql(sql, fileName, queryName) {
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

  const resultSchema = requireQueryResultSchema(queryName);
  const hasAggregate =
    /\b(count(?:if)?|sum(?:if)?|avg(?:if)?|min(?:if)?|max(?:if)?|uniq\w*|quantile\w*|median\w*|group\s+by)\s*\(?/i.test(
      normalizedSql,
    );
  const isAllowedSourceFreeConstant =
    resultSchema.allowSourceFreeConstantRow &&
    !/\b(from|join)\b/i.test(normalizedSql);

  if (!hasAggregate && !isAllowedSourceFreeConstant) {
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

  const files = await Promise.all(
    fileNames.map(async (fileName) => ({
      fileName,
      sql: await readFile(resolve(queryDirectory, fileName), "utf8"),
    })),
  );
  const queries = [];
  const names = new Set();

  for (const { fileName, sql } of files) {
    const name = parseQueryName(sql, fileName);

    if (names.has(name)) {
      throw new ScorecardError(
        "duplicate_query_name",
        `More than one scorecard query is named ${name}.`,
      );
    }

    names.add(name);
    queries.push({ name, sql: validateQuerySql(sql, fileName, name) });
  }

  return queries;
}
