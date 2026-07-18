import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ScorecardError, safeError } from "./errors.mjs";

export const SCHEMA_VERSION = 1;
export const DEFAULT_TIMEOUT_MS = 15_000;

const MODULE_DIRECTORY = dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_ROOT = resolve(MODULE_DIRECTORY, "../../..");
export const DEFAULT_QUERY_DIRECTORY = resolve(
  REPOSITORY_ROOT,
  "analytics/posthog/queries",
);
export const DEFAULT_OUTPUT_PATH = resolve(
  REPOSITORY_ROOT,
  ".agents/loops/skillsboard-gtm-pulse-data.json",
);

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

export function isAllowedDeploymentEnvironment(value) {
  return ALLOWED_DEPLOYMENT_ENVIRONMENTS.has(value);
}

export function validateNodeVersion() {
  const majorVersion = Number.parseInt(
    process.versions.node.split(".")[0] ?? "0",
    10,
  );

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

  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(
    parsedHost.hostname,
  );
  if (
    parsedHost.protocol !== "https:" &&
    !(parsedHost.protocol === "http:" && isLocalHost)
  ) {
    throw new ScorecardError(
      "invalid_posthog_host",
      "POSTHOG_API_HOST must use HTTPS (HTTP is accepted only for localhost tests).",
      "unavailable",
    );
  }

  if (
    parsedHost.username ||
    parsedHost.password ||
    parsedHost.search ||
    parsedHost.hash
  ) {
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
    (name) =>
      typeof environment[name] !== "string" || environment[name].trim() === "",
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
  if (!isAllowedDeploymentEnvironment(deploymentEnvironment)) {
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
