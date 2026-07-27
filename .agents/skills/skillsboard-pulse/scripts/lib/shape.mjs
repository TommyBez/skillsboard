import {
  AUTONOMY_STATES,
  EFFECTS,
  GRAPH_SCHEMA_VERSION,
  NODE_KINDS,
  PULSE_POLICY_REFERENCE_PATTERN,
  REPOSITORY_SKILL_PATTERN,
  SELECTION_RULE_KEYS,
  SKILL_SOURCES,
} from "./constants.mjs";
import { invariant } from "./errors.mjs";
import {
  expectBoolean,
  expectExactKeys,
  expectId,
  expectJsonPointer,
  expectPositiveInteger,
  expectRecord,
  expectRelativePath,
  expectSha,
  expectStringArray,
} from "./expect.mjs";

function validateSelectionRules(rules, label, { allowSelfOrigin = false } = {}) {
  expectRecord(rules, label);
  expectExactKeys(rules, SELECTION_RULE_KEYS, label);
  if (rules.must_include_nodes !== undefined) {
    expectStringArray(rules.must_include_nodes, `${label}.must_include_nodes`, { id: true });
  }
  if (rules.must_include_operations !== undefined) {
    expectStringArray(rules.must_include_operations, `${label}.must_include_operations`, { id: true });
  }
  if (rules.must_include_state_views !== undefined) {
    expectStringArray(rules.must_include_state_views, `${label}.must_include_state_views`, { id: true });
  }
  if (rules.effects_allowed !== undefined) {
    expectStringArray(rules.effects_allowed, `${label}.effects_allowed`);
    for (const effect of rules.effects_allowed) {
      invariant(EFFECTS.has(effect), `${label}.effects_allowed contains unknown effect ${effect}`);
    }
  }
  if (rules.forbid_effects !== undefined) {
    expectStringArray(rules.forbid_effects, `${label}.forbid_effects`);
    for (const effect of rules.forbid_effects) {
      invariant(EFFECTS.has(effect), `${label}.forbid_effects contains unknown effect ${effect}`);
    }
  }
  if (rules.forbid_nodes !== undefined) {
    expectStringArray(rules.forbid_nodes, `${label}.forbid_nodes`, { id: true });
  }
  if (rules.allow_nodes !== undefined) {
    expectStringArray(rules.allow_nodes, `${label}.allow_nodes`, { id: true });
  }
  if (rules.forbid_self_origin !== undefined) {
    invariant(allowSelfOrigin, `${label}.forbid_self_origin is only valid on route rules`);
    expectBoolean(rules.forbid_self_origin, `${label}.forbid_self_origin`);
  }
}

function validatePolicyInvariantsShape(policyInvariants, requireSorted) {
  expectRecord(policyInvariants, "graph.policy_invariants");
  expectExactKeys(
    policyInvariants,
    new Set([
      "mandatory_nodes_must_equal",
      "node_reference_must_equal",
      "run_types",
      "routes",
    ]),
    "graph.policy_invariants",
  );

  if (policyInvariants.mandatory_nodes_must_equal !== undefined) {
    expectStringArray(policyInvariants.mandatory_nodes_must_equal, "graph.policy_invariants.mandatory_nodes_must_equal", {
      sorted: requireSorted,
      id: true,
    });
  }

  if (policyInvariants.node_reference_must_equal !== undefined) {
    const refs = expectRecord(policyInvariants.node_reference_must_equal, "graph.policy_invariants.node_reference_must_equal");
    for (const [id, reference] of Object.entries(refs)) {
      expectId(id, `graph.policy_invariants.node_reference_must_equal key ${id}`);
      expectRelativePath(reference, `graph.policy_invariants.node_reference_must_equal.${id}`);
    }
  }

  for (const [groupName, allowSelfOrigin] of [["run_types", false], ["routes", true]]) {
    if (policyInvariants[groupName] === undefined) continue;
    const group = expectRecord(policyInvariants[groupName], `graph.policy_invariants.${groupName}`);
    for (const [id, rules] of Object.entries(group)) {
      invariant(id === "*" || ID_PATTERN_SAFE(id), `graph.policy_invariants.${groupName} key ${id} is invalid`);
      validateSelectionRules(rules, `graph.policy_invariants.${groupName}.${id}`, { allowSelfOrigin });
    }
  }
}

function ID_PATTERN_SAFE(id) {
  return typeof id === "string" && /^[a-z0-9][a-z0-9._:-]*$/.test(id);
}

function validateSelectionsShape(selections, label, allowOrigin, requireSorted) {
  expectRecord(selections, label);
  for (const [id, selection] of Object.entries(selections)) {
    expectId(id, `${label} key ${id}`);
    expectRecord(selection, `${label}.${id}`);
    const allowed = new Set([
      "entry_nodes",
      "run_nodes",
      "operations",
      "skills",
      "state_views",
      "max_known_context_bytes",
    ]);
    if (allowOrigin) {
      allowed.add("allowed_origin_policy_nodes");
      allowed.add("requires_origin_policy_node");
    }
    expectExactKeys(selection, allowed, `${label}.${id}`);
    invariant(
      (selection.entry_nodes === undefined) !== (selection.run_nodes === undefined),
      `${label}.${id} must declare exactly one of entry_nodes or run_nodes`,
    );
    const entries = selection.entry_nodes ?? selection.run_nodes;
    expectStringArray(entries, `${label}.${id}.${selection.entry_nodes === undefined ? "run_nodes" : "entry_nodes"}`, {
      sorted: requireSorted,
      id: true,
    });
    expectStringArray(selection.operations, `${label}.${id}.operations`, { sorted: requireSorted, id: true });
    expectStringArray(selection.skills, `${label}.${id}.skills`, { sorted: requireSorted, id: true });
    expectStringArray(selection.state_views, `${label}.${id}.state_views`, { sorted: requireSorted, id: true });
    expectPositiveInteger(selection.max_known_context_bytes, `${label}.${id}.max_known_context_bytes`);
    if (selection.requires_origin_policy_node !== undefined) {
      expectBoolean(selection.requires_origin_policy_node, `${label}.${id}.requires_origin_policy_node`);
    }
    if (selection.allowed_origin_policy_nodes !== undefined) {
      invariant(allowOrigin, `${label}.${id}.allowed_origin_policy_nodes is not allowed`);
      expectStringArray(selection.allowed_origin_policy_nodes, `${label}.${id}.allowed_origin_policy_nodes`, {
        sorted: requireSorted,
        id: true,
      });
      invariant(selection.requires_origin_policy_node === true, `${label}.${id}.allowed_origin_policy_nodes requires requires_origin_policy_node=true`);
      invariant(selection.allowed_origin_policy_nodes.length > 0, `${label}.${id}.allowed_origin_policy_nodes must not be empty`);
    }
    if (selection.requires_origin_policy_node === true) {
      invariant(
        Array.isArray(selection.allowed_origin_policy_nodes) && selection.allowed_origin_policy_nodes.length > 0,
        `${label}.${id} requires allowed_origin_policy_nodes`,
      );
    }
  }
}

export function validateTopLevelShape(graph, options) {
  const { allowStaleHashes = false, requireSorted = true } = options;
  expectRecord(graph, "graph");
  expectExactKeys(
    graph,
    new Set([
      "$schema",
      "schema_version",
      "state_schema_version",
      "contract_version",
      "context_limits",
      "execution_limits",
      "mandatory_nodes",
      "skills",
      "interference_keys",
      "artifacts",
      "nodes",
      "operations",
      "state_views",
      "policy_selectors",
      "policy_invariants",
      "run_types",
      "routes",
      "integrity",
    ]),
    "graph",
  );
  if (graph.$schema !== undefined) invariant(typeof graph.$schema === "string", "graph.$schema must be a string");
  expectPositiveInteger(graph.schema_version, "graph.schema_version");
  invariant(graph.schema_version === GRAPH_SCHEMA_VERSION, `unsupported graph schema version: ${graph.schema_version}`);
  expectPositiveInteger(graph.state_schema_version, "graph.state_schema_version");
  expectPositiveInteger(graph.contract_version, "graph.contract_version");

  const executionLimits = expectRecord(graph.execution_limits, "graph.execution_limits");
  expectExactKeys(
    executionLimits,
    new Set(["executor_result_schema_version", "max_executor_result_bytes"]),
    "graph.execution_limits",
  );
  expectPositiveInteger(executionLimits.executor_result_schema_version, "graph.execution_limits.executor_result_schema_version");
  invariant(executionLimits.executor_result_schema_version === 1, "unsupported executor result schema version");
  expectPositiveInteger(executionLimits.max_executor_result_bytes, "graph.execution_limits.max_executor_result_bytes");
  invariant(
    executionLimits.max_executor_result_bytes <= 16_384,
    "graph.execution_limits.max_executor_result_bytes must be at most 16384",
  );

  const limits = expectRecord(graph.context_limits, "graph.context_limits");
  expectExactKeys(limits, new Set(["max_node_bytes", "max_kernel_bytes", "max_mandatory_bytes"]), "graph.context_limits");
  expectPositiveInteger(limits.max_node_bytes, "graph.context_limits.max_node_bytes");
  invariant(
    limits.max_kernel_bytes !== undefined || limits.max_mandatory_bytes !== undefined,
    "graph.context_limits requires max_kernel_bytes or max_mandatory_bytes",
  );
  invariant(
    !(limits.max_kernel_bytes !== undefined && limits.max_mandatory_bytes !== undefined),
    "graph.context_limits must not declare both max_kernel_bytes and max_mandatory_bytes",
  );
  if (limits.max_kernel_bytes !== undefined) expectPositiveInteger(limits.max_kernel_bytes, "graph.context_limits.max_kernel_bytes");
  if (limits.max_mandatory_bytes !== undefined) expectPositiveInteger(limits.max_mandatory_bytes, "graph.context_limits.max_mandatory_bytes");

  expectStringArray(graph.mandatory_nodes, "graph.mandatory_nodes", { sorted: requireSorted, id: true });
  invariant(graph.mandatory_nodes.length > 0, "graph.mandatory_nodes must not be empty");
  expectStringArray(graph.interference_keys, "graph.interference_keys", { sorted: requireSorted, id: true });

  const skills = expectRecord(graph.skills, "graph.skills");
  for (const [id, skill] of Object.entries(skills)) {
    expectId(id, `graph.skills key ${id}`);
    expectRecord(skill, `graph.skills.${id}`);
    expectExactKeys(skill, new Set(["selector", "source", "content_sha256"]), `graph.skills.${id}`);
    invariant(typeof skill.selector === "string" && skill.selector.length > 0, `graph.skills.${id}.selector must be a string`);
    invariant(SKILL_SOURCES.has(skill.source), `graph.skills.${id}.source is invalid`);
    if (skill.source === "repository") {
      invariant(REPOSITORY_SKILL_PATTERN.test(skill.selector), `graph.skills.${id}.selector is not a repository skill name`);
      expectSha(skill.content_sha256, `graph.skills.${id}.content_sha256`, allowStaleHashes);
    } else {
      invariant(skill.content_sha256 === undefined, `runtime skill ${id} cannot pin an installation-dependent content hash`);
    }
  }

  const artifacts = graph.artifacts === undefined ? {} : expectRecord(graph.artifacts, "graph.artifacts");
  for (const [id, artifact] of Object.entries(artifacts)) {
    expectId(id, `graph.artifacts key ${id}`);
    expectRecord(artifact, `graph.artifacts.${id}`);
    expectExactKeys(artifact, new Set(["file", "content_sha256"]), `graph.artifacts.${id}`);
    expectRelativePath(artifact.file, `graph.artifacts.${id}.file`);
    expectSha(artifact.content_sha256, `graph.artifacts.${id}.content_sha256`, allowStaleHashes);
  }

  const nodes = expectRecord(graph.nodes, "graph.nodes");
  invariant(Object.keys(nodes).length > 0, "graph.nodes must not be empty");
  for (const [id, node] of Object.entries(nodes)) {
    expectId(id, `graph.nodes key ${id}`);
    expectRecord(node, `graph.nodes.${id}`);
    expectExactKeys(
      node,
      new Set(["kind", "reference", "content_sha256", "requires", "conflicts_with", "provides"]),
      `graph.nodes.${id}`,
    );
    invariant(NODE_KINDS.has(node.kind), `graph.nodes.${id}.kind is invalid`);
    expectRelativePath(node.reference, `graph.nodes.${id}.reference`);
    const pinnedReference = graph.policy_invariants?.node_reference_must_equal?.[id];
    if (pinnedReference !== undefined) {
      invariant(
        node.reference === pinnedReference,
        `${id} must reference exactly ${pinnedReference}`,
      );
    } else {
      invariant(
        PULSE_POLICY_REFERENCE_PATTERN.test(node.reference),
        `node ${id} reference must stay inside .agents/skills/skillsboard-pulse/references/*.md`,
      );
    }
    expectSha(node.content_sha256, `graph.nodes.${id}.content_sha256`, allowStaleHashes);
    expectStringArray(node.requires, `graph.nodes.${id}.requires`, { sorted: requireSorted, id: true });
    expectStringArray(node.conflicts_with, `graph.nodes.${id}.conflicts_with`, { sorted: requireSorted, id: true });
    expectStringArray(node.provides, `graph.nodes.${id}.provides`, { sorted: requireSorted, id: true });
  }

  const operations = expectRecord(graph.operations, "graph.operations");
  for (const [id, operation] of Object.entries(operations)) {
    expectId(id, `graph.operations key ${id}`);
    expectRecord(operation, `graph.operations.${id}`);
    expectExactKeys(
      operation,
      new Set([
        "effect",
        "autonomy",
        "requires",
        "required_capabilities",
        "skills",
        "conflicts_with",
        "interference_keys",
      ]),
      `graph.operations.${id}`,
    );
    invariant(EFFECTS.has(operation.effect), `graph.operations.${id}.effect is invalid`);
    invariant(AUTONOMY_STATES.has(operation.autonomy), `graph.operations.${id}.autonomy is invalid`);
    expectStringArray(operation.requires, `graph.operations.${id}.requires`, { sorted: requireSorted, id: true });
    expectStringArray(operation.required_capabilities, `graph.operations.${id}.required_capabilities`, {
      sorted: requireSorted,
      id: true,
    });
    expectStringArray(operation.skills, `graph.operations.${id}.skills`, { sorted: requireSorted, id: true });
    expectStringArray(operation.conflicts_with, `graph.operations.${id}.conflicts_with`, { sorted: requireSorted, id: true });
    expectStringArray(operation.interference_keys, `graph.operations.${id}.interference_keys`, {
      sorted: requireSorted,
      id: true,
    });
  }

  const stateViews = expectRecord(graph.state_views, "graph.state_views");
  for (const [id, pointers] of Object.entries(stateViews)) {
    expectId(id, `graph.state_views key ${id}`);
    expectStringArray(pointers, `graph.state_views.${id}`, { sorted: requireSorted });
    invariant(pointers.length > 0, `graph.state_views.${id} must not be empty`);
    for (const [index, pointer] of pointers.entries()) expectJsonPointer(pointer, `graph.state_views.${id}[${index}]`);
  }
  expectStringArray(graph.policy_selectors, "graph.policy_selectors", { sorted: requireSorted });
  for (const [index, pointer] of graph.policy_selectors.entries()) {
    expectJsonPointer(pointer, `graph.policy_selectors[${index}]`);
  }

  if (graph.policy_invariants !== undefined) {
    validatePolicyInvariantsShape(graph.policy_invariants, requireSorted);
  }

  validateSelectionsShape(graph.run_types, "graph.run_types", false, requireSorted);
  validateSelectionsShape(graph.routes, "graph.routes", true, requireSorted);

  if (!allowStaleHashes || graph.integrity !== undefined) {
    const integrity = expectRecord(graph.integrity, "graph.integrity");
    expectExactKeys(integrity, new Set(["algorithm", "root_sha256"]), "graph.integrity");
    invariant(integrity.algorithm === "sha256-merkle-v1", "graph.integrity.algorithm must be sha256-merkle-v1");
    expectSha(integrity.root_sha256, "graph.integrity.root_sha256", allowStaleHashes);
  }
}
