#!/usr/bin/env node

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { runCli, writeUnexpectedCliFailure } from "./scorecard/cli.mjs";

export {
  QUERY_RESULT_NAMES,
  QUERY_RESULT_SCHEMAS,
  TRACKING_HEALTH_EVENT_NAMES,
} from "../../analytics/posthog/query-result-schemas.mjs";
export {
  ANALYTICS_EVENT_MANIFEST,
  ANALYTICS_SCHEMA_VERSION,
  ANALYTICS_SYSTEM_PROPERTY_NAMES,
} from "../../analytics/posthog/event-manifest.mjs";
export {
  DEFAULT_OUTPUT_PATH,
  DEFAULT_QUERY_DIRECTORY,
  DEFAULT_TIMEOUT_MS,
  SCHEMA_VERSION,
  validateConfiguration,
} from "./scorecard/config.mjs";
export { parseCliArguments, runCli } from "./scorecard/cli.mjs";
export { writeJsonAtomically } from "./scorecard/fs.mjs";
export { executeHogQlQuery } from "./scorecard/hogql.mjs";
export { normalizeAggregateResult } from "./scorecard/normalize.mjs";
export {
  loadQueries,
  resolveQueryPlaceholders,
} from "./scorecard/queries.mjs";
export { runScorecard } from "./scorecard/run.mjs";

const isDirectExecution =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  runCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch(() => {
      writeUnexpectedCliFailure();
      process.exitCode = 1;
    });
}
