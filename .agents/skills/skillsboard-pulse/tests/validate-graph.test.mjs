import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  GraphValidationError,
  REQUIRED_OPERATION_SWITCHES,
  checkGraph,
  computeGraphRoot,
  lockGraph,
  readGraph,
  resolveGraph,
} from "../scripts/validate-graph.mjs";

const fixtureRoots = new Set();
const validatorPath = fileURLToPath(new URL("../scripts/validate-graph.mjs", import.meta.url));

after(() => {
  for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true });
});

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function allCapabilities() {
  return [
    "approval",
    "authority",
    "budget",
    "caps",
    "checkout",
    "containment",
    "data_safety",
    "eligibility",
    "handoff",
    "idempotency",
    "incident",
    "ownership",
    "product_truth",
    "readback",
    "rollback",
    "state",
    "truth",
    "verification",
  ];
}

function baseGraph() {
  return {
    schema_version: 2,
    state_schema_version: 4,
    contract_version: 3,
    context_limits: {
      max_node_bytes: 16_384,
      max_kernel_bytes: 32_768,
    },
    execution_limits: {
      executor_result_schema_version: 1,
      max_executor_result_bytes: 4_096,
    },
    mandatory_nodes: ["pulse.kernel"],
    skills: {
      fixture: { selector: "fixture-skill", source: "repository", content_sha256: "pending" },
    },
    switches: [...REQUIRED_OPERATION_SWITCHES],
    interference_keys: ["fixture.effect"],
    artifacts: {
      fixture: {
        file: "fixture-artifact.md",
        content_sha256: "pending",
      },
    },
    nodes: {
      "pulse.kernel": {
        kind: "kernel",
        reference: ".agents/skills/skillsboard-pulse/references/kernel.md",
        content_sha256: "pending",
        requires: [],
        conflicts_with: [],
        provides: allCapabilities(),
      },
      "work.policy": {
        kind: "policy",
        reference: ".agents/skills/skillsboard-pulse/references/work.md",
        content_sha256: "pending",
        requires: ["pulse.kernel"],
        conflicts_with: [],
        provides: [],
      },
    },
    operations: {
      "pulse.state.persist": {
        effect: "local_state",
        autonomy: "autonomous",
        requires: ["pulse.kernel"],
        required_capabilities: [],
        skills: [],
        switches_all: [],
        conflicts_with: [],
        interference_keys: [],
      },
      "fixture.write": {
        effect: "external_write",
        autonomy: "autonomous",
        requires: ["work.policy"],
        required_capabilities: [],
        skills: ["fixture"],
        switches_all: [...REQUIRED_OPERATION_SWITCHES],
        conflicts_with: [],
        interference_keys: ["fixture.effect"],
      },
    },
    state_views: {
      core: ["/contract", "/work_graph/index"],
    },
    policy_selectors: ["/work_graph/active_policy_nodes"],
    run_types: {
      operational: {
        entry_nodes: ["work.policy"],
        operations: ["pulse.state.persist"],
        skills: [],
        state_views: ["core"],
        max_known_context_bytes: 32_768,
      },
    },
    routes: {
      "fixture.write": {
        entry_nodes: ["work.policy"],
        operations: ["fixture.write"],
        skills: ["fixture"],
        state_views: ["core"],
        max_known_context_bytes: 32_768,
      },
    },
    integrity: {
      algorithm: "sha256-merkle-v1",
      root_sha256: "pending",
    },
  };
}

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "pulse-graph-"));
  fixtureRoots.add(root);
  mkdirSync(join(root, ".git"));
  const graphPath = join(root, ".agents", "skills", "skillsboard-pulse", "graph.json");
  write(join(root, ".agents", "skills", "skillsboard-pulse", "SKILL.md"), "---\nname: skillsboard-pulse\ndescription: Fixture orchestrator.\n---\n");
  write(join(root, ".agents", "skills", "skillsboard-pulse", "references", "kernel.md"), "# Kernel\n");
  write(join(root, ".agents", "skills", "skillsboard-pulse", "references", "work.md"), "# Work\n");
  write(join(root, ".agents", "skills", "fixture-skill", "SKILL.md"), "---\nname: fixture-skill\ndescription: Fixture.\n---\n");
  write(join(root, "fixture-artifact.md"), "# Artifact\n");
  write(graphPath, `${JSON.stringify(baseGraph(), null, 2)}\n`);
  return { root, graphPath };
}

function mutateGraph(graphPath, mutate) {
  const graph = JSON.parse(readFileSync(graphPath, "utf8"));
  mutate(graph);
  writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
}

function expectValidationError(callback, pattern) {
  assert.throws(callback, (error) => {
    assert.ok(error instanceof GraphValidationError);
    assert.match(error.message, pattern);
    return true;
  });
}

test("lock writes deterministic file and Merkle hashes, then check succeeds", () => {
  const { graphPath } = makeFixture();
  const first = lockGraph(graphPath);
  assert.equal(first.changed, true);
  assert.match(first.rootSha256, /^[a-f0-9]{64}$/);

  const bytesAfterFirstLock = readFileSync(graphPath, "utf8");
  const second = lockGraph(graphPath);
  assert.equal(second.changed, false);
  assert.equal(readFileSync(graphPath, "utf8"), bytesAfterFirstLock);

  const checked = checkGraph(graphPath);
  assert.equal(checked.rootSha256, first.rootSha256);
  assert.equal(checked.graph.integrity.root_sha256, first.rootSha256);
  assert.match(checked.graph.nodes["pulse.kernel"].content_sha256, /^[a-f0-9]{64}$/);
  assert.match(checked.graph.artifacts.fixture.content_sha256, /^[a-f0-9]{64}$/);
});

test("CLI exposes working lock, check, and resolve commands", () => {
  const { graphPath } = makeFixture();
  const run = (...args) => spawnSync(process.execPath, [validatorPath, ...args, "--graph", graphPath], {
    encoding: "utf8",
  });

  const locked = run("lock");
  assert.equal(locked.status, 0, locked.stderr);
  assert.equal(JSON.parse(locked.stdout).ok, true);

  const checked = run("check");
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(JSON.parse(checked.stdout).ok, true);

  const resolved = run("resolve", "--route", "fixture.write", "--node", "work.policy");
  assert.equal(resolved.status, 0, resolved.stderr);
  assert.deepEqual(JSON.parse(resolved.stdout).references, [
    ".agents/skills/skillsboard-pulse/references/kernel.md",
    ".agents/skills/skillsboard-pulse/references/work.md",
  ]);
});

test("Merkle root ignores object insertion order and set-array order", () => {
  const graph = baseGraph();
  const reordered = {
    ...graph,
    switches: [...graph.switches].reverse(),
    mandatory_nodes: [...graph.mandatory_nodes].reverse(),
    nodes: Object.fromEntries(Object.entries(graph.nodes).reverse()),
  };
  assert.equal(computeGraphRoot(graph), computeGraphRoot(reordered));
});

test("resolve returns dependency-first policy context without file contents", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  const result = resolveGraph(checked.graph, {
    route: "fixture.write",
    nodes: ["work.policy"],
  });
  assert.deepEqual(result.references, [
    ".agents/skills/skillsboard-pulse/references/kernel.md",
    ".agents/skills/skillsboard-pulse/references/work.md",
  ]);
  assert.equal(result.origin_policy_node, "work.policy");
  assert.deepEqual(result.skills.map(({ id, selector, source }) => ({ id, selector, source })), [
    { id: "fixture", selector: "fixture-skill", source: "repository" },
  ]);
  assert.match(result.skills[0].content_sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(result.state_views, {
    core: ["/contract", "/work_graph/index"],
  });
  const expectedKnownBytes = [
    join(checked.repositoryRoot, ".agents", "skills", "skillsboard-pulse", "SKILL.md"),
    join(checked.repositoryRoot, ".agents", "skills", "skillsboard-pulse", "references", "kernel.md"),
    join(checked.repositoryRoot, ".agents", "skills", "skillsboard-pulse", "references", "work.md"),
    join(checked.repositoryRoot, ".agents", "skills", "fixture-skill", "SKILL.md"),
  ].reduce((sum, path) => sum + readFileSync(path).length, 0);
  assert.equal(result.context.known_total_bytes, expectedKnownBytes);
  assert.deepEqual(result.context.runtime_skills_unpriced, []);
  assert.equal(result.executor_result.max_bytes, 4_096);
  assert.equal(result.executor_result.schema_version, 1);
  assert.ok(result.executor_result.required_keys.includes("reason_code"));
  assert.equal(result.executor_result.enums.reason_code.includes("switch_disabled"), false);
  assert.equal(JSON.stringify(result).includes("# Kernel"), false);
});

test("check rejects a stale node content hash", () => {
  const { root, graphPath } = makeFixture();
  lockGraph(graphPath);
  write(join(root, ".agents", "skills", "skillsboard-pulse", "references", "work.md"), "# Changed\n");
  expectValidationError(() => checkGraph(graphPath), /content_sha256 mismatch/);
});

test("check rejects unsupported graph schema versions", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.schema_version = 1;
  });
  expectValidationError(() => checkGraph(graphPath), /unsupported graph schema version: 1/);
});

test("check restricts non-product node references to the Pulse policy directory", () => {
  const { root, graphPath } = makeFixture();
  lockGraph(graphPath);
  write(join(root, "README.md"), "# Repository readme\n");
  mutateGraph(graphPath, (graph) => {
    graph.nodes["work.policy"].reference = "README.md";
  });
  expectValidationError(
    () => checkGraph(graphPath),
    /reference must stay inside \.agents\/skills\/skillsboard-pulse\/references\/\*\.md/,
  );
});

test("product truth is pinned to canonical marketing context and loaded selectively", () => {
  const { root, graphPath } = makeFixture();
  const productMarketingPath = join(root, ".agents", "product-marketing.md");
  write(productMarketingPath, "# Canonical product marketing context\n");
  mutateGraph(graphPath, (graph) => {
    graph.nodes["product.truth"] = {
      kind: "policy",
      reference: ".agents/product-marketing.md",
      content_sha256: "pending",
      requires: ["work.policy"],
      conflicts_with: [],
      provides: ["product_truth"],
    };
    graph.routes["truth.write"] = {
      entry_nodes: ["product.truth"],
      operations: ["fixture.write"],
      skills: ["fixture"],
      state_views: ["core"],
      max_known_context_bytes: 32_768,
    };
  });
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  const run = resolveGraph(checked.graph, { run: "operational", nodes: [] });
  assert.equal(run.references.includes(".agents/product-marketing.md"), false);
  const route = resolveGraph(checked.graph, { route: "truth.write", nodes: ["product.truth"] });
  assert.equal(route.references.includes(".agents/product-marketing.md"), true);

  write(productMarketingPath, "# Drifted product marketing context\n");
  expectValidationError(() => checkGraph(graphPath), /node product\.truth content_sha256 mismatch/);
});

test("product truth rejects any non-canonical repository path", () => {
  const { graphPath } = makeFixture();
  mutateGraph(graphPath, (graph) => {
    graph.nodes["product.truth"] = {
      kind: "policy",
      reference: ".agents/skills/skillsboard-pulse/references/work.md",
      content_sha256: "pending",
      requires: ["pulse.kernel"],
      conflicts_with: [],
      provides: ["product_truth"],
    };
  });
  expectValidationError(
    () => lockGraph(graphPath),
    /product\.truth must reference exactly \.agents\/product-marketing\.md/,
  );
});

test("check reports dependency cycles with the involved chain", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.nodes["pulse.kernel"].requires = ["work.policy"];
  });
  expectValidationError(() => checkGraph(graphPath), /dependency cycle: .*pulse\.kernel.*work\.policy/);
});

test("check rejects environment operation switches", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.switches = ["PULSE_ENABLE_SOCIAL_PUBLISH"];
  });
  expectValidationError(() => checkGraph(graphPath), /must not declare environment operation switches/);
});

test("check rejects an operation-level environment switch", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.operations["fixture.write"].switches_all = ["PULSE_ENABLE_SOCIAL_PUBLISH"];
  });
  expectValidationError(() => checkGraph(graphPath), /operation fixture\.write must not declare environment switches/);
});

test("autonomous writes are valid without environment switches", () => {
  const { graphPath } = makeFixture();
  mutateGraph(graphPath, (graph) => {
    for (const operationId of ["github.pr.write", "github.pseo_pr.write"]) {
      graph.operations[operationId] = {
        ...graph.operations["fixture.write"],
        switches_all: [],
      };
      graph.routes[operationId] = {
        ...graph.routes["fixture.write"],
        operations: [operationId],
      };
    }
  });
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  assert.deepEqual(checked.graph.operations["github.pr.write"].switches_all, []);
  assert.deepEqual(checked.graph.operations["github.pseo_pr.write"].switches_all, []);
});

test("every fixture operation resolves with an empty switch closure", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  const resolved = resolveGraph(checked.graph, { route: "fixture.write", nodes: ["work.policy"] });
  assert.deepEqual(resolved.switches_all, []);
});

test("check rejects an external write operation unreachable from all routes", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.operations["orphan.write"] = {
      ...graph.operations["fixture.write"],
      switches_all: [],
    };
  });
  expectValidationError(() => checkGraph(graphPath), /external write operation is unreachable.*orphan\.write/);
});

test("survey routes must load the cross-channel attention owner and state view", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.state_views.attention = ["/communications/attention"];
    graph.operations["posthog.survey.write"] = {
      effect: "external_write",
      autonomy: "autonomous",
      requires: ["work.policy"],
      required_capabilities: [],
      skills: ["fixture"],
      switches_all: [],
      conflicts_with: [],
      interference_keys: ["fixture.effect"],
    };
    graph.routes["product.survey"] = {
      entry_nodes: ["work.policy"],
      operations: ["posthog.survey.write"],
      skills: ["fixture"],
      state_views: ["attention", "core"],
      max_known_context_bytes: 32_768,
    };
  });
  expectValidationError(() => checkGraph(graphPath), /cross-channel attention caps/);
});

test("referral-skilled routes must load the cross-channel attention owner and state view", () => {
  const { graphPath } = makeFixture();
  mutateGraph(graphPath, (graph) => {
    graph.skills.referrals = {
      selector: "fixture-skill",
      source: "repository",
      content_sha256: "pending",
    };
    graph.routes["product.referral"] = {
      ...graph.routes["fixture.write"],
      skills: ["referrals"],
    };
  });
  expectValidationError(() => lockGraph(graphPath), /cross-channel attention caps/);
});

test("resolve requires an explicit non-mandatory origin for repository routes", () => {
  const { graphPath } = makeFixture();
  mutateGraph(graphPath, (graph) => {
    graph.routes["fixture.write"].requires_origin_policy_node = true;
    graph.routes["fixture.write"].allowed_origin_policy_nodes = ["work.policy"];
  });
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  expectValidationError(
    () => resolveGraph(checked.graph, { route: "fixture.write", nodes: [] }),
    /requires exactly one origin policy node/,
  );
  const result = resolveGraph(checked.graph, { route: "fixture.write", nodes: ["work.policy"] });
  assert.equal(result.nodes.some((node) => node.id === "work.policy"), true);
});

test("resolve rejects an origin outside the route allowlist", () => {
  const { root, graphPath } = makeFixture();
  write(join(root, ".agents", "skills", "skillsboard-pulse", "references", "other.md"), "# Other\n");
  mutateGraph(graphPath, (graph) => {
    graph.nodes["other.policy"] = {
      kind: "policy",
      reference: ".agents/skills/skillsboard-pulse/references/other.md",
      content_sha256: "pending",
      requires: ["pulse.kernel"],
      conflicts_with: [],
      provides: [],
    };
    graph.run_types.operational.entry_nodes.push("other.policy");
    graph.run_types.operational.entry_nodes.sort();
    graph.routes["fixture.write"].requires_origin_policy_node = true;
    graph.routes["fixture.write"].allowed_origin_policy_nodes = ["work.policy"];
  });
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  expectValidationError(
    () => resolveGraph(checked.graph, { route: "fixture.write", nodes: ["other.policy"] }),
    /does not allow origin policy node other\.policy/,
  );
});

test("check rejects known context budgets smaller than their resolved closure", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.routes["fixture.write"].max_known_context_bytes = 1;
  });
  expectValidationError(() => checkGraph(graphPath), /exceeds max_known_context_bytes/);
});

test("check budgets the worst allowed origin closure", () => {
  const { root, graphPath } = makeFixture();
  write(join(root, ".agents", "skills", "skillsboard-pulse", "references", "other.md"), `# Other\n${"x".repeat(4_096)}\n`);
  mutateGraph(graphPath, (graph) => {
    graph.nodes["other.policy"] = {
      kind: "policy",
      reference: ".agents/skills/skillsboard-pulse/references/other.md",
      content_sha256: "pending",
      requires: ["pulse.kernel"],
      conflicts_with: [],
      provides: [],
    };
    graph.routes["fixture.write"].requires_origin_policy_node = true;
    graph.routes["fixture.write"].allowed_origin_policy_nodes = ["other.policy"];
    graph.routes["fixture.write"].max_known_context_bytes = 1;
  });
  expectValidationError(() => lockGraph(graphPath), /with origin other\.policy exceeds max_known_context_bytes/);
});

test("resolve rejects combined run and route context", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  expectValidationError(
    () => resolveGraph(checked.graph, { run: "operational", route: "fixture.write", nodes: [] }),
    /exactly one isolated selector/,
  );
});

test("resolve rejects a bare node selector", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  expectValidationError(
    () => resolveGraph(checked.graph, { nodes: ["work.policy"] }),
    /exactly one isolated selector/,
  );
});

test("route and run effects stay isolated", () => {
  const routeFixture = makeFixture();
  lockGraph(routeFixture.graphPath);
  mutateGraph(routeFixture.graphPath, (graph) => {
    graph.routes["fixture.write"].operations = ["pulse.state.persist"];
  });
  expectValidationError(() => checkGraph(routeFixture.graphPath), /cannot execute local_state operation/);

  const runFixture = makeFixture();
  lockGraph(runFixture.graphPath);
  mutateGraph(runFixture.graphPath, (graph) => {
    graph.run_types.operational.operations = ["fixture.write", "pulse.state.persist"];
  });
  expectValidationError(() => checkGraph(runFixture.graphPath), /cannot execute external_write operation/);
});

test("run types must own shared-state persistence", () => {
  const { graphPath } = makeFixture();
  lockGraph(graphPath);
  mutateGraph(graphPath, (graph) => {
    graph.run_types.operational.operations = [];
  });
  expectValidationError(() => checkGraph(graphPath), /must own pulse\.state\.persist/);
});

test("operational runs resolve the continuous per-lane replan policy and state", () => {
  const checked = checkGraph();
  const run = resolveGraph(checked.graph, { run: "operational", nodes: [] });

  assert.equal(run.nodes.some(({ id }) => id === "learning.opportunities"), true);
  assert.equal(Object.hasOwn(run.state_views, "opportunities"), true);
  assert.deepEqual(run.switches_all, []);
});

test("the mandatory kernel applies the global evidence-proportional default without weakening positive gates", () => {
  const checked = checkGraph();
  const kernel = readFileSync(new URL("../references/pulse-kernel.md", import.meta.url), "utf8");

  assert.deepEqual(checked.graph.mandatory_nodes, ["pulse.kernel"]);
  assert.match(kernel, /Across Pulse, the evidence-proportional default assumes ordinary non-defective state until contrary evidence/);
  assert.match(kernel, /Without evidence[^\n]*create no presumed problems, work items, blockers, monitoring, setup requirements, unavailable states, QA gates, or proof requests/);
  assert.match(kernel, /Evidence to the contrary: a reproducible observation, authoritative provider\/product signal, failed mandatory readback, or exact deterministic contract trigger/);
  assert.match(kernel, /Never fabricate positive authority\/safety/);
  assert.match(kernel, /For an effect\/decision, verify required identity, consent, suppressions, ownership, eligibility, destination, cap\/capacity, spend authority/);
  assert.match(kernel, /Missing proof narrows only that effect\/decision, creating no speculative remediation elsewhere/);
  assert.match(kernel, /Optional diagnostics\/generic possibilities cannot create or preserve `waiting_dependency`, `setup_required`, `unavailable`, `qa_required`, monitoring, repair, or synthetic work/);
  assert.match(kernel, /Waiting requires selected legitimate work plus an explicit mandatory dependency/);
});

test("autonomy controls use bounded replacements instead of routine blockers", () => {
  const checked = checkGraph();
  const kernel = readFileSync(new URL("../references/pulse-kernel.md", import.meta.url), "utf8");
  const analytics = readFileSync(new URL("../references/analytics-control-plane.md", import.meta.url), "utf8");
  const scorecard = readFileSync(new URL("../references/analytics-scorecard.md", import.meta.url), "utf8");
  const learning = readFileSync(new URL("../references/learning-opportunities.md", import.meta.url), "utf8");
  const distribution = readFileSync(new URL("../references/channels-distribution.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");
  const delivery = readFileSync(new URL("../references/delivery-repository.md", import.meta.url), "utf8");
  const inbound = readFileSync(new URL("../references/email-inbound.md", import.meta.url), "utf8");
  const email = readFileSync(new URL("../references/email-outbound.md", import.meta.url), "utf8");
  const pseo = readFileSync(new URL("../references/growth-pseo.md", import.meta.url), "utf8");
  const product = readFileSync(new URL("../references/product-lifecycle.md", import.meta.url), "utf8");
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");
  const typefully = readFileSync(new URL("../../typefully/SKILL.md", import.meta.url), "utf8");

  assert.equal(checked.graph.contract_version, 9);
  assert.match(kernel, /private checkout at `\$CODEX_HOME\/automations\/skills-board-gtm-pulse\/checkout`/);
  assert.match(kernel, /per exact `provider \+ operation \+ resource \+ definition_hash` tuple/);
  assert.match(kernel, /Necessary authorized PII or private recipients may be delivered directly/);
  assert.match(kernel, /normal fixed-point work may begin in a later iteration of that same run/);
  assert.match(analytics, /A deterministic private measurement asset/);
  assert.match(analytics, /operation-specific gates.*advertised containment path/);
  assert.match(analytics, /root_cause_hash \+ definition_hash/);
  assert.match(analytics, /Discovery and SDK doctor are optional diagnostics/);
  assert.match(analytics, /cannot stop repository repair, provider-independent work/);
  assert.match(analytics, /fail closed only its dependent item/);
  assert.match(analytics, /Assume event capture is not duplicating until concrete contrary evidence exists/);
  assert.match(analytics, /missing custom key or preventive health check is not evidence/);
  assert.match(analytics, /reproducible repeated capture, a provider integrity alert, or an observed incompatible repeated business event/);
  assert.doesNotMatch(scorecard, /Verify event names[^\n]*duplicates/);
  assert.match(learning, /continuously replans each independent lane/);
  assert.match(learning, /deterministic low-risk non-experimental repair/);
  assert.match(scheduler, /general repository WIP has a hard budget of six units/);
  assert.match(scheduler, /Before claim it is a soft hold/);
  assert.match(scheduler, /at most three open pSEO PRs/);
  assert.match(distribution, /official account-visible rules returned by an advertised authenticated operation/);
  assert.match(social, /at most three autonomous X replies/);
  assert.match(delivery, /`qa_required` permits PR creation and review only/);
  assert.match(delivery, /exact canonical graph route ID/);
  assert.match(inbound, /as the primary ingress/);
  assert.match(inbound, /Never use a private API, Resend CLI, custom client/);
  assert.match(email, /bounded exact-record or frozen-target-set reads/);
  assert.match(email, /at most three total attempts.*one initial send plus at most two retries/);
  assert.match(pseo, /three new experimental pSEO PRs per rolling seven days/);
  assert.match(product, /at most one optional open-text question/);
  assert.match(product, /at most three materially distinct treatment versions per rolling 90 days/);
  assert.match(typefully, /full immutable transition envelope: exact account, required social set, resource key, contract root/);
});

test("runtime skills are reported as unpriced", () => {
  const { graphPath } = makeFixture();
  mutateGraph(graphPath, (graph) => {
    graph.skills.runtime_fixture = { selector: "runtime:fixture", source: "runtime" };
    graph.routes["fixture.write"].skills.push("runtime_fixture");
    graph.routes["fixture.write"].skills.sort();
  });
  lockGraph(graphPath);
  const checked = checkGraph(graphPath);
  const result = resolveGraph(checked.graph, { route: "fixture.write", nodes: ["work.policy"] });
  assert.deepEqual(result.context.runtime_skills_unpriced, ["runtime_fixture"]);
});

test("check rejects drift in a pinned repository skill", () => {
  const { root, graphPath } = makeFixture();
  lockGraph(graphPath);
  write(join(root, ".agents", "skills", "fixture-skill", "SKILL.md"), "---\nname: fixture-skill\ndescription: Changed.\n---\n");
  expectValidationError(() => checkGraph(graphPath), /repository skill fixture content_sha256 mismatch/);
});

test("production Resend routes pin the connector adapter instead of API-key or CLI management", () => {
  const checked = checkGraph();
  const connectorOperationIds = [
    "demand.email",
    "inbound.process",
    "inbound.reply",
    "incident.email",
    "resend.audience.write",
    "resend.broadcast.send",
    "resend.broadcast_draft.write",
    "resend.domain.write",
    "resend.proactive.send",
    "resend.suppression_lift",
    "resend.topic.write",
    "resend.webhook.write",
    "review.outreach",
  ];
  const connectorRouteIds = [
    "distribution.demand_email",
    "distribution.review_outreach",
    "email.broadcast_prepare",
    "email.broadcast_send",
    "email.inbound_process",
    "email.inbound_reply",
    "email.proactive_send",
    "email.reconcile",
    "email.resend_audience",
    "email.resend_domain",
    "email.resend_suppression",
    "email.resend_topic",
    "email.resend_webhook",
    "incident.notify",
  ];
  const actualConnectorOperationIds = Object.entries(checked.graph.operations)
    .filter(([, operation]) => operation.skills.includes("resend_connector"))
    .map(([id]) => id)
    .sort();
  const actualConnectorRouteIds = Object.entries(checked.graph.routes)
    .filter(([, route]) => route.skills.includes("resend_connector"))
    .map(([id]) => id)
    .sort();

  assert.deepEqual(actualConnectorOperationIds, connectorOperationIds);
  assert.deepEqual(actualConnectorRouteIds, connectorRouteIds);
  assert.deepEqual(checked.graph.skills.resend_connector, {
    selector: "resend-connector",
    source: "repository",
    content_sha256: checked.graph.skills.resend_connector.content_sha256,
  });
  assert.equal(checked.graph.skills.resend, undefined);
  assert.equal(checked.graph.skills.resend_cli, undefined);

  for (const id of connectorOperationIds) {
    const operation = checked.graph.operations[id];
    assert.ok(operation, `${id} must exist`);
    assert.equal(operation.skills.includes("resend_connector"), true, `${id} must use resend_connector`);
    assert.equal(operation.skills.includes("resend"), false, `${id} must not require resend`);
    assert.equal(operation.skills.includes("resend_cli"), false, `${id} must not require resend_cli`);
  }

  for (const id of connectorRouteIds) {
    const route = checked.graph.routes[id];
    assert.ok(route, `${id} must exist`);
    assert.equal(route.skills.includes("resend_connector"), true, `${id} must use resend_connector`);
    assert.equal(route.skills.includes("resend"), false, `${id} must not require resend`);
    assert.equal(route.skills.includes("resend_cli"), false, `${id} must not require resend_cli`);
  }
});

test("analytics database reconciliation resolves the official Neon connector read-only", () => {
  const checked = checkGraph();
  const operation = checked.graph.operations["neon.database.read"];
  const route = checked.graph.routes["analytics.database_reconcile"];

  assert.deepEqual(checked.graph.skills.neon_postgres, {
    selector: "neon-postgres:neon-postgres",
    source: "runtime",
  });
  assert.deepEqual(operation, {
    effect: "read",
    autonomy: "autonomous",
    requires: ["analytics.control_plane"],
    required_capabilities: [],
    skills: ["neon_postgres"],
    switches_all: [],
    conflicts_with: [],
    interference_keys: [],
  });
  assert.deepEqual(route, {
    entry_nodes: ["analytics.control_plane"],
    operations: ["neon.database.read"],
    skills: ["posthog"],
    state_views: ["analytics", "core", "scorecard"],
    max_known_context_bytes: 36_864,
    requires_origin_policy_node: true,
    allowed_origin_policy_nodes: ["analytics.control_plane"],
  });

  const resolved = resolveGraph(checked.graph, {
    route: "analytics.database_reconcile",
    nodes: ["analytics.control_plane"],
  });
  assert.deepEqual(resolved.operations, ["neon.database.read"]);
  assert.deepEqual(resolved.skills.map(({ id }) => id), ["neon_postgres", "posthog"]);
  assert.equal(resolved.origin_policy_node, "analytics.control_plane");
  assert.equal(resolved.operations.every((id) => checked.graph.operations[id].effect === "read"), true);

  for (const runId of ["operational", "strategic"]) {
    const run = resolveGraph(checked.graph, { run: runId, nodes: [] });
    assert.equal(run.operations.includes("neon.database.read"), true, `${runId} must advertise the Neon read`);
    assert.equal(run.skills.some(({ id }) => id === "neon_postgres"), true, `${runId} must resolve the Neon skill`);
  }
});

test("delivery repository cannot self-authorize its origin", () => {
  const { root, graphPath } = makeFixture();
  write(join(root, ".agents", "skills", "skillsboard-pulse", "references", "delivery.md"), "# Delivery\n");
  mutateGraph(graphPath, (graph) => {
    graph.nodes["delivery.repository"] = {
      kind: "policy",
      reference: ".agents/skills/skillsboard-pulse/references/delivery.md",
      content_sha256: "pending",
      requires: ["pulse.kernel"],
      conflicts_with: [],
      provides: [],
    };
    graph.routes["delivery.repository"] = {
      ...graph.routes["fixture.write"],
      entry_nodes: ["delivery.repository"],
      requires_origin_policy_node: true,
      allowed_origin_policy_nodes: ["delivery.repository"],
    };
    delete graph.routes["fixture.write"];
  });
  expectValidationError(() => lockGraph(graphPath), /cannot self-authorize/);
});

test("check rejects reference symlinks even when they stay inside the repository root", () => {
  const { root, graphPath } = makeFixture();
  lockGraph(graphPath);
  const references = join(root, ".agents", "skills", "skillsboard-pulse", "references");
  symlinkSync("work.md", join(references, "work-link.md"));
  mutateGraph(graphPath, (graph) => {
    graph.nodes["work.policy"].reference = ".agents/skills/skillsboard-pulse/references/work-link.md";
  });
  expectValidationError(() => checkGraph(graphPath), /must not traverse a symbolic link/);
});
