import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after } from "node:test";
import { fileURLToPath } from "node:url";

import { GraphValidationError } from "../scripts/validate-graph.mjs";

const fixtureRoots = new Set();
export const validatorPath = fileURLToPath(new URL("../scripts/validate-graph.mjs", import.meta.url));

after(() => {
  for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true });
});

export function write(path, value) {
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

export function baseGraph() {
  return {
    schema_version: 3,
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
        conflicts_with: [],
        interference_keys: [],
      },
      "fixture.write": {
        effect: "external_write",
        autonomy: "autonomous",
        requires: ["work.policy"],
        required_capabilities: [],
        skills: ["fixture"],
        conflicts_with: [],
        interference_keys: ["fixture.effect"],
      },
    },
    state_views: {
      core: ["/contract", "/work_graph/index"],
    },
    policy_selectors: ["/work_graph/active_policy_nodes"],
    policy_invariants: {
      run_types: {
        "*": {
          must_include_operations: ["pulse.state.persist"],
          effects_allowed: ["local_state", "read"],
        },
      },
      routes: {
        "*": {
          forbid_effects: ["local_state"],
        },
      },
    },
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

export function makeFixture() {
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

export function mutateGraph(graphPath, mutate) {
  const graph = JSON.parse(readFileSync(graphPath, "utf8"));
  mutate(graph);
  writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
}

export function expectValidationError(callback, pattern) {
  assert.throws(callback, (error) => {
    assert.ok(error instanceof GraphValidationError);
    assert.match(error.message, pattern);
    return true;
  });
}
