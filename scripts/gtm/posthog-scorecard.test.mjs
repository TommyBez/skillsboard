import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  ANALYTICS_EVENT_MANIFEST,
  ANALYTICS_SCHEMA_VERSION,
  ANALYTICS_SYSTEM_PROPERTY_NAMES,
  DEFAULT_QUERY_DIRECTORY,
  QUERY_RESULT_NAMES,
  QUERY_RESULT_SCHEMAS,
  TRACKING_HEALTH_EVENT_NAMES,
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
const EXPECTED_QUERY_USAGE = Object.freeze({
  acquisition_v1: {
    events: [
      "$pageview",
      "landing_cta_clicked",
      "signup_form_submitted",
      "team_created",
      "user_signed_up",
    ],
    properties: [
      "$pathname",
      "analytics_schema_version",
      "creation_surface",
      "deployment_environment",
      "signup_context",
      "team_id",
      "visitor_state",
    ],
    eventPropertyBindings: [
      {
        property: "$pathname",
        pattern: /\bevent\s*=\s*'\$pageview'\s+AND\s+properties\.\$pathname\b/g,
        occurrences: 4,
      },
      {
        property: "visitor_state",
        pattern: /\bevent\s*=\s*'landing_cta_clicked'\s+AND\s+properties\.visitor_state\b/g,
        occurrences: 2,
      },
      {
        property: "signup_context",
        pattern: /\bevent\s*=\s*'(?:signup_form_submitted|user_signed_up)'\s+AND\s+properties\.signup_context\b/g,
        occurrences: 4,
      },
      {
        property: "creation_surface",
        pattern: /\bevent\s*=\s*'team_created'\s+AND\s+properties\.creation_surface\b/g,
        occurrences: 2,
      },
    ],
  },
  activation_v1: {
    events: [
      "invitation_accepted",
      "skill_downloaded",
      "skill_saved",
      "skill_usage_path_selected",
      "team_created",
      "team_member_invited",
    ],
    properties: [
      "actor_is_skill_creator",
      "analytics_schema_version",
      "deployment_environment",
      "team_id",
    ],
    eventPropertyBindings: [
      {
        property: "actor_is_skill_creator",
        pattern: /\bcandidate\.event\s+IN\s*\(\s*'skill_usage_path_selected'\s*,\s*'skill_downloaded'\s*\)\s+AND\s+candidate\.properties\.actor_is_skill_creator\b/g,
        occurrences: 1,
      },
    ],
  },
  retention_v1: { events: [], properties: [], eventPropertyBindings: [] },
  tracking_health_v1: {
    events: [...TRACKING_HEALTH_EVENT_NAMES].sort(),
    properties: [
      "analytics_schema_version",
      "deployment_environment",
      "team_id",
    ],
    eventPropertyBindings: [],
  },
});

async function makeQueryDirectory(files) {
  const directory = await mkdtemp(join(tmpdir(), "skillsboard-gtm-"));

  await Promise.all(
    Object.entries(files).map(([fileName, content]) =>
      writeFile(join(directory, fileName), content, "utf8"),
    ),
  );

  return directory;
}

function acquisitionResultPayload() {
  const contract = QUERY_RESULT_SCHEMAS.acquisition_v1;
  const timestamp = "2026-07-17T12:00:00.000Z";
  const values = {
    stage: "acquisition",
    decision_status: "unavailable",
    unavailable_reason:
      "qualified_visitor_and_source_attribution_not_instrumented",
    current_window_start: timestamp,
    current_window_end: timestamp,
    previous_window_start: timestamp,
    previous_window_end: timestamp,
    current_raw_signup_intent_rate: null,
    current_signup_completion_rate: null,
    current_team_start_rate: null,
  };

  return {
    columns: contract.columns,
    results: [
      contract.columns.map((column) =>
        Object.hasOwn(values, column) ? values[column] : 0,
      ),
    ],
  };
}

test("loadQueries uses -- name metadata and falls back to the basename", async () => {
  const queryDirectory = await makeQueryDirectory({
    "01-first.sql": "-- name: readiness\nSELECT count() AS ready FROM events",
    "retention_v1.sql": "SELECT count() AS aat_28 FROM events",
  });

  const queries = await loadQueries(queryDirectory);

  assert.deepEqual(
    queries.map(({ name }) => name),
    ["readiness", "retention_v1"],
  );
});

test("loadQueries rejects a query without an explicit result schema", async () => {
  const queryDirectory = await makeQueryDirectory({
    "leaky.sql":
      "SELECT properties.team_id AS segment, count() AS total FROM events GROUP BY segment",
  });

  await assert.rejects(
    loadQueries(queryDirectory),
    /does not have an explicit result schema/,
  );
});

test("the versioned full-funnel PostHog query set is complete", async () => {
  const queries = await loadQueries(DEFAULT_QUERY_DIRECTORY);
  const queryNames = queries.map(({ name }) => name);

  assert.deepEqual(
    queryNames,
    ["acquisition_v1", "activation_v1", "retention_v1", "tracking_health_v1"],
  );
  assert.deepEqual(
    queryNames,
    QUERY_RESULT_NAMES.filter((queryName) => queryName !== "readiness"),
  );
  for (const query of queries) {
    const resolved = resolveQueryPlaceholders(query.sql, "production");
    assert.doesNotMatch(resolved, /\{\{[^{}]+\}\}/);
  }
});

test("tracking health SQL stays aligned with the canonical event manifest", async () => {
  const sql = await readFile(
    join(DEFAULT_QUERY_DIRECTORY, "tracking_health_v1.sql"),
    "utf8",
  );
  const expectedEventsBlock = sql.match(
    /WITH expected_events AS \(([\s\S]*?)\),\s*observed_events AS/,
  )?.[1];

  assert.ok(expectedEventsBlock, "expected_events CTE should be present");

  const expectedEvents = [
    ...expectedEventsBlock.matchAll(
      /(?:SELECT|UNION ALL SELECT)\s+'([^']+)'(?:\s+AS event_name)?\s*,\s*([01])/g,
    ),
  ].map((match) => ({
    eventName: match[1],
    teamScoped: match[2] === "1",
  }));

  assert.deepEqual(
    expectedEvents.map(({ eventName }) => eventName),
    [...TRACKING_HEALTH_EVENT_NAMES],
  );
  for (const { eventName, teamScoped } of expectedEvents) {
    assert.equal(
      teamScoped,
      ANALYTICS_EVENT_MANIFEST[eventName].teamScoped,
      `${eventName} team scope should match the manifest`,
    );
  }

  const observedEventsBlock = sql.match(
    /AND event IN \(([\s\S]*?)\)\s+AND \(/,
  )?.[1];
  assert.ok(observedEventsBlock, "observed event allowlist should be present");
  assert.deepEqual(
    [...observedEventsBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]),
    [...TRACKING_HEALTH_EVENT_NAMES],
  );

});

test("scorecard SQL uses only events and properties declared by the analytics manifest", async () => {
  const queries = await loadQueries(DEFAULT_QUERY_DIRECTORY);
  const manifestEventNames = new Set(Object.keys(ANALYTICS_EVENT_MANIFEST));
  const manifestProperties = new Set(
    Object.values(ANALYTICS_EVENT_MANIFEST).flatMap((definition) =>
      Object.keys(definition.properties),
    ),
  );
  const declaredProperties = new Set([
    ...manifestProperties,
    ...ANALYTICS_SYSTEM_PROPERTY_NAMES,
  ]);

  for (const query of queries) {
    const expectedUsage = EXPECTED_QUERY_USAGE[query.name];
    assert.ok(expectedUsage, `${query.name} should have an explicit usage contract`);
    for (const eventName of expectedUsage.events) {
      assert.ok(
        manifestEventNames.has(eventName),
        `${query.name} expects undeclared event ${eventName}`,
      );
    }
    const propertiesForExpectedEvents = new Set(
      expectedUsage.events.flatMap((eventName) =>
        Object.keys(ANALYTICS_EVENT_MANIFEST[eventName].properties),
      ),
    );
    const propertiesAllowedByExpectedEvents = new Set([
      ...propertiesForExpectedEvents,
      ...ANALYTICS_SYSTEM_PROPERTY_NAMES,
    ]);

    const referencedEvents = new Set(
      [...query.sql.matchAll(/\bevent\s*=\s*'([^']+)'/gi)].map(
        (match) => match[1],
      ),
    );
    for (const eventListMatch of query.sql.matchAll(
      /\bevent\s+IN\s*\(([\s\S]*?)\)/gi,
    )) {
      for (const eventMatch of eventListMatch[1].matchAll(/'([^']+)'/g)) {
        referencedEvents.add(eventMatch[1]);
      }
    }

    for (const eventName of referencedEvents) {
      assert.ok(
        manifestEventNames.has(eventName),
        `${query.name} references undeclared event ${eventName}`,
      );
    }
    assert.deepEqual(
      [...referencedEvents].sort(),
      expectedUsage.events,
      `${query.name} should use its intended event set`,
    );

    const referencedSchemaVersions = [
      ...query.sql.matchAll(
        /\bproperties\.analytics_schema_version\s*=\s*(\d+)\b/g,
      ),
    ].map((match) => Number.parseInt(match[1], 10));
    if (query.name !== "retention_v1") {
      assert.ok(
        referencedSchemaVersions.length > 0,
        `${query.name} should filter or validate the analytics schema version`,
      );
    }
    for (const schemaVersion of referencedSchemaVersions) {
      assert.equal(
        schemaVersion,
        ANALYTICS_SCHEMA_VERSION,
        `${query.name} should use the manifest analytics schema version`,
      );
    }

    const referencedProperties = new Set(
      [...query.sql.matchAll(/\bproperties\.([A-Za-z_$][\w$]*)/g)].map(
        (match) => match[1],
      ),
    );

    for (const propertyName of referencedProperties) {
      assert.ok(
        declaredProperties.has(propertyName),
        `${query.name} references undeclared property ${propertyName}`,
      );
    }
    for (const propertyName of expectedUsage.properties) {
      assert.ok(
        declaredProperties.has(propertyName),
        `${query.name} allows undeclared property ${propertyName}`,
      );
      assert.ok(
        propertiesAllowedByExpectedEvents.has(propertyName),
        `${query.name} allows property ${propertyName} outside its expected events`,
      );
    }
    assert.deepEqual(
      [...referencedProperties].sort(),
      expectedUsage.properties,
      `${query.name} should use only its intended property set`,
    );
    for (const binding of expectedUsage.eventPropertyBindings) {
      const propertyPattern = new RegExp(
        `(?:\\b[a-z][a-z0-9_]*\\.)?properties\\.${binding.property.replaceAll("$", "\\$")}\\b`,
        "g",
      );
      assert.equal(
        [...query.sql.matchAll(propertyPattern)].length,
        binding.occurrences,
        `${query.name} should use ${binding.property} only in its intended event predicates`,
      );
      assert.equal(
        [...query.sql.matchAll(binding.pattern)].length,
        binding.occurrences,
        `${query.name} should bind ${binding.property} to the intended event`,
      );
    }
  }
});

test("retention fails closed without scanning partial event history", async () => {
  const sql = await readFile(
    join(DEFAULT_QUERY_DIRECTORY, "retention_v1.sql"),
    "utf8",
  );

  assert.match(sql, /'unavailable' AS measurement_status/);
  assert.match(
    sql,
    /'historical_activation_milestones_not_backfilled' AS unavailable_reason/,
  );
  assert.doesNotMatch(sql, /\b(FROM|JOIN)\b/i);
  assert.doesNotMatch(sql, /\bproperties\.team_id\b/i);

  for (const metric of [
    "aat_28",
    "previous_aat_28",
    "new_activated",
    "retained",
    "reactivated",
    "lost",
    "delta_aat",
    "period_1_mature_activated",
    "period_1_retained",
    "period_1_retention_rate",
  ]) {
    assert.match(sql, new RegExp(`NULL AS ${metric}\\b`));
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
    "readiness.sql": "SELECT count() AS ready FROM events",
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
    "readiness.sql": "SELECT count() AS ready FROM events",
  });

  const snapshot = await runScorecard({
    environment: VALID_ENVIRONMENT,
    fetchImpl: async () =>
      new Response(JSON.stringify({ columns: ["ready"], results: [[1]] })),
    generatedAt: "2026-07-17T12:00:00.000Z",
    queryDirectory,
  });

  assert.equal(snapshot.status, "ready");
  assert.deepEqual(snapshot.metrics, { readiness: { ready: 1 } });
  assert.equal(snapshot.queries[0].rowCount, 1);
});

test("runScorecard executes independent queries concurrently and preserves query order", async () => {
  const queryDirectory = await makeQueryDirectory({
    "01-readiness.sql":
      "-- name: readiness\nSELECT count() AS ready FROM events",
    "02-acquisition.sql":
      "-- name: acquisition_v1\nSELECT count() AS stage FROM events",
  });
  const pendingRequests = [];
  const completionOrder = [];
  let markAllStarted;
  const allStarted = new Promise((resolve) => {
    markAllStarted = resolve;
  });

  const snapshotPromise = runScorecard({
    environment: VALID_ENVIRONMENT,
    fetchImpl: (_url, options) => {
      const submittedSql = JSON.parse(options.body).query.query;
      const queryName = submittedSql.match(/--\s*name:\s*([^\s]+)/)?.[1];

      return new Promise((resolve) => {
        pendingRequests.push({ queryName, resolve });
        if (pendingRequests.length === 2) {
          markAllStarted();
        }
      }).then((response) => {
        completionOrder.push(queryName);
        return response;
      });
    },
    generatedAt: "2026-07-17T12:00:00.000Z",
    queryDirectory,
  });
  let concurrencyTimeout;

  try {
    await Promise.race([
      allStarted,
      new Promise((_, reject) => {
        concurrencyTimeout = setTimeout(
          () => reject(new Error("queries did not start concurrently")),
          1_000,
        );
      }),
    ]);
  } finally {
    clearTimeout(concurrencyTimeout);
  }

  for (const pendingRequest of [...pendingRequests].reverse()) {
    const payload =
      pendingRequest.queryName === "readiness"
        ? { columns: ["ready"], results: [[1]] }
        : acquisitionResultPayload();
    pendingRequest.resolve(new Response(JSON.stringify(payload)));
    await new Promise((resolve) => setImmediate(resolve));
  }

  const snapshot = await snapshotPromise;

  assert.deepEqual(completionOrder, ["acquisition_v1", "readiness"]);
  assert.deepEqual(
    snapshot.queries.map(({ name }) => name),
    ["readiness", "acquisition_v1"],
  );
  assert.deepEqual(Object.keys(snapshot.metrics), ["readiness", "acquisition_v1"]);
  assert.equal(snapshot.status, "ready");
});

test("runScorecard resolves the environment before sending HogQL", async () => {
  const queryDirectory = await makeQueryDirectory({
    "readiness.sql":
      "SELECT count() AS ready FROM events WHERE env = '{{environment}}'",
  });
  let submittedSql;

  const snapshot = await runScorecard({
    environment: {
      ...VALID_ENVIRONMENT,
      POSTHOG_DEPLOYMENT_ENVIRONMENT: "preview",
    },
    fetchImpl: async (_url, options) => {
      submittedSql = JSON.parse(options.body).query.query;
      return new Response(JSON.stringify({ columns: ["ready"], results: [[1]] }));
    },
    queryDirectory,
  });

  assert.equal(snapshot.status, "ready");
  assert.match(submittedSql, /env = 'preview'/);
  assert.doesNotMatch(submittedSql, /\{\{environment\}\}/);
});

test("runScorecard marks an expected API failure as broken", async () => {
  const queryDirectory = await makeQueryDirectory({
    "readiness.sql": "SELECT count() AS ready FROM events",
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
    () =>
      normalizeAggregateResult(
        { columns: ["team_id"], results: [["team-1"]] },
        "readiness",
      ),
    /raw or sensitive column/,
  );
  assert.throws(
    () =>
      normalizeAggregateResult(
        { columns: ["ready"], results: [["a@example.com"]] },
        "readiness",
      ),
    /may identify a person or raw event/,
  );
});

test("normalizeAggregateResult requires an explicit query name", () => {
  assert.throws(
    () =>
      normalizeAggregateResult({
        columns: ["ready"],
        results: [[1]],
      }),
    /requires an explicit query name/,
  );
});

test("runScorecard rejects a team identifier hidden behind an allowed alias", async () => {
  const queryDirectory = await makeQueryDirectory({
    "readiness.sql":
      "SELECT max(properties.team_id) AS ready FROM events",
  });

  const snapshot = await runScorecard({
    environment: VALID_ENVIRONMENT,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({ columns: ["ready"], results: [["team_123"]] }),
      ),
    generatedAt: "2026-07-17T12:00:00.000Z",
    queryDirectory,
  });

  assert.equal(snapshot.status, "broken");
  assert.equal(snapshot.queries[0].error.code, "unsafe_result_value");
  assert.deepEqual(snapshot.metrics, {});
  assert.doesNotMatch(JSON.stringify(snapshot), /team_123/);
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
