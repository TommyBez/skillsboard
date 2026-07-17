import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  DEFAULT_QUERY_DIRECTORY,
  executeHogQlQuery,
  loadQueries,
  normalizeAggregateResult,
  resolveQueryPlaceholders,
  runScorecard,
  validateConfiguration,
  writeJsonAtomically,
} from "./posthog-scorecard.mjs";

const VALID_ENVIRONMENT = {
  POSTHOG_PERSONAL_API_KEY: "phx_test_key",
  POSTHOG_PROJECT_ID: "12345",
  POSTHOG_API_HOST: "https://eu.posthog.com",
};

async function makeQueryDirectory(files) {
  const directory = await mkdtemp(join(tmpdir(), "skillsboard-gtm-"));

  await Promise.all(
    Object.entries(files).map(([fileName, content]) =>
      writeFile(join(directory, fileName), content, "utf8"),
    ),
  );

  return directory;
}

test("loadQueries uses -- name metadata and falls back to the basename", async () => {
  const queryDirectory = await makeQueryDirectory({
    "01-first.sql": "-- name: activation\nSELECT count() AS activated_teams FROM events",
    "retention.sql": "SELECT count() AS retained_teams FROM events",
  });

  const queries = await loadQueries(queryDirectory);

  assert.deepEqual(
    queries.map(({ name }) => name),
    ["activation", "retention"],
  );
});

test("the versioned full-funnel PostHog query set is complete", async () => {
  const queries = await loadQueries(DEFAULT_QUERY_DIRECTORY);

  assert.deepEqual(
    queries.map(({ name }) => name),
    ["acquisition_v1", "activation_v1", "retention_v1", "tracking_health_v1"],
  );
  for (const query of queries) {
    const resolved = resolveQueryPlaceholders(query.sql, "production");
    assert.doesNotMatch(resolved, /\{\{[^{}]+\}\}/);
  }
});

test("deployment environment defaults to production and is allowlisted", () => {
  assert.equal(
    validateConfiguration(VALID_ENVIRONMENT).config.deploymentEnvironment,
    "production",
  );
  assert.equal(
    validateConfiguration({
      ...VALID_ENVIRONMENT,
      POSTHOG_DEPLOYMENT_ENVIRONMENT: "preview",
    }).config.deploymentEnvironment,
    "preview",
  );
  assert.deepEqual(
    validateConfiguration({
      ...VALID_ENVIRONMENT,
      POSTHOG_DEPLOYMENT_ENVIRONMENT: "production' OR 1 = 1 --",
    }),
    { ok: false, invalid: ["POSTHOG_DEPLOYMENT_ENVIRONMENT"] },
  );
});

test("resolveQueryPlaceholders replaces only an allowlisted environment", () => {
  assert.equal(
    resolveQueryPlaceholders(
      "SELECT count() FROM events WHERE env = '{{environment}}'",
      "development",
    ),
    "SELECT count() FROM events WHERE env = 'development'",
  );
  assert.throws(
    () => resolveQueryPlaceholders("SELECT '{{other}}'", "production"),
    /unsupported placeholder/,
  );
  assert.throws(
    () => resolveQueryPlaceholders("SELECT '{{environment}}'", "prod"),
    /not allowlisted/,
  );
});

test("runScorecard fails closed when credentials are missing", async () => {
  const queryDirectory = await makeQueryDirectory({
    "activation.sql": "SELECT count() AS activated_teams FROM events",
  });
  let fetchCalled = false;

  const snapshot = await runScorecard({
    environment: {},
    fetchImpl: async () => {
      fetchCalled = true;
      throw new Error("must not run");
    },
    generatedAt: "2026-07-17T12:00:00.000Z",
    queryDirectory,
  });

  assert.equal(fetchCalled, false);
  assert.equal(snapshot.status, "unavailable");
  assert.equal(snapshot.queries[0].data_status, "unavailable");
  assert.deepEqual(snapshot.metrics, {});
  assert.doesNotMatch(JSON.stringify(snapshot), /phx_test_key/);
});

test("executeHogQlQuery sends the documented HogQLQuery request", async () => {
  let request;

  const payload = await executeHogQlQuery({
    config: {
      apiKey: "secret-do-not-print",
      projectId: "12345",
      host: "https://eu.posthog.com",
    },
    sql: "SELECT count() AS teams FROM events",
    fetchImpl: async (url, options) => {
      request = { url: url.href, options };
      return new Response(JSON.stringify({ columns: ["teams"], results: [[3]] }));
    },
  });

  assert.deepEqual(payload, { columns: ["teams"], results: [[3]] });
  assert.equal(request.url, "https://eu.posthog.com/api/projects/12345/query/");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(JSON.parse(request.options.body), {
    query: {
      kind: "HogQLQuery",
      query: "SELECT count() AS teams FROM events",
    },
  });
  assert.equal(request.options.headers.Authorization, "Bearer secret-do-not-print");
});

test("runScorecard emits only aggregate named metrics", async () => {
  const queryDirectory = await makeQueryDirectory({
    "activation.sql": "SELECT count() AS activated_teams FROM events",
  });

  const snapshot = await runScorecard({
    environment: VALID_ENVIRONMENT,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({ columns: ["activated_teams"], results: [[7]] }),
      ),
    generatedAt: "2026-07-17T12:00:00.000Z",
    queryDirectory,
  });

  assert.equal(snapshot.status, "ready");
  assert.deepEqual(snapshot.metrics, { activation: { activated_teams: 7 } });
  assert.equal(snapshot.queries[0].rowCount, 1);
});

test("runScorecard resolves the environment before sending HogQL", async () => {
  const queryDirectory = await makeQueryDirectory({
    "activation.sql":
      "SELECT count() AS activated_teams FROM events WHERE env = '{{environment}}'",
  });
  let submittedSql;

  const snapshot = await runScorecard({
    environment: {
      ...VALID_ENVIRONMENT,
      POSTHOG_DEPLOYMENT_ENVIRONMENT: "preview",
    },
    fetchImpl: async (_url, options) => {
      submittedSql = JSON.parse(options.body).query.query;
      return new Response(
        JSON.stringify({ columns: ["activated_teams"], results: [[2]] }),
      );
    },
    queryDirectory,
  });

  assert.equal(snapshot.status, "ready");
  assert.match(submittedSql, /env = 'preview'/);
  assert.doesNotMatch(submittedSql, /\{\{environment\}\}/);
});

test("runScorecard marks an expected API failure as broken", async () => {
  const queryDirectory = await makeQueryDirectory({
    "activation.sql": "SELECT count() AS activated_teams FROM events",
  });

  const snapshot = await runScorecard({
    environment: VALID_ENVIRONMENT,
    fetchImpl: async () => new Response("unavailable", { status: 503 }),
    queryDirectory,
  });

  assert.equal(snapshot.status, "broken");
  assert.equal(snapshot.queries[0].data_status, "broken");
  assert.equal(snapshot.queries[0].error.code, "posthog_unavailable");
});

test("normalizeAggregateResult rejects identifiers and PII-like values", () => {
  assert.throws(
    () => normalizeAggregateResult({ columns: ["team_id"], results: [["team-1"]] }),
    /raw or sensitive column/,
  );
  assert.throws(
    () => normalizeAggregateResult({ columns: ["source"], results: [["a@example.com"]] }),
    /may identify a person or raw event/,
  );
});

test("check mode probes API readiness without executing scorecard SQL", async () => {
  const requestBodies = [];

  const snapshot = await runScorecard({
    check: true,
    environment: VALID_ENVIRONMENT,
    fetchImpl: async (_url, options) => {
      requestBodies.push(JSON.parse(options.body));
      return new Response(JSON.stringify({ columns: ["ready"], results: [[1]] }));
    },
    queryDirectory: "/a/query/directory/that/does/not/exist",
  });

  assert.equal(snapshot.status, "ready");
  assert.equal(snapshot.mode, "check");
  assert.deepEqual(Object.keys(snapshot.metrics), ["readiness"]);
  assert.equal(requestBodies[0].query.query, "SELECT 1 AS ready");
  assert.doesNotMatch(requestBodies[0].query.query, /activated_teams/);
});

test("writeJsonAtomically creates the canonical JSON payload", async () => {
  const directory = await mkdtemp(join(tmpdir(), "skillsboard-gtm-output-"));
  const outputPath = join(directory, "scorecard.json");
  const snapshot = { schemaVersion: 1, status: "ready" };

  await writeJsonAtomically(outputPath, snapshot);

  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), snapshot);
});
