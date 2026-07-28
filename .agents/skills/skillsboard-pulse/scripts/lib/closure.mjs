import { BASE_SAFETY } from "./constants.mjs";
import { GraphValidationError, invariant } from "./errors.mjs";
import { compareAscii } from "./expect.mjs";

export function buildNodeClosure(graph, seedNodes) {
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];

  function visit(id, trail) {
    invariant(graph.nodes[id], `dangling node reference ${id} from ${trail}`);
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const cycleStart = trail.indexOf(id);
      const cycle = [...trail.slice(cycleStart), id];
      throw new GraphValidationError(`node dependency cycle: ${cycle.join(" -> ")}`);
    }
    visiting.add(id);
    for (const dependency of [...graph.nodes[id].requires].sort(compareAscii)) visit(dependency, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
    ordered.push(id);
  }

  for (const id of [...new Set(seedNodes)].sort(compareAscii)) visit(id, []);
  return ordered;
}

function hasCapability(capabilities, required) {
  return capabilities.has(required) || capabilities.has(`safety.${required}`);
}

export function validateClosureConflicts(graph, nodeIds, label) {
  const selected = new Set(nodeIds);
  for (const id of nodeIds) {
    for (const conflict of graph.nodes[id].conflicts_with) {
      invariant(!selected.has(conflict), `${label} selects conflicting nodes ${id} and ${conflict}`);
    }
  }
}

export function validateOperationConflicts(graph, operationIds, label) {
  const selected = new Set(operationIds);
  for (const id of operationIds) {
    for (const conflict of graph.operations[id].conflicts_with) {
      invariant(!selected.has(conflict), `${label} selects conflicting operations ${id} and ${conflict}`);
    }
  }
}

export function selectionEntries(selection) {
  return selection.entry_nodes ?? selection.run_nodes;
}

export function selectionSkillIds(graph, selection) {
  const operationSkills = selection.operations.flatMap((id) => graph.operations[id]?.skills ?? []);
  return [...new Set([...selection.skills, ...operationSkills])].sort(compareAscii);
}

export function measureKnownContext(graph, orderedNodes, skillIds) {
  const referenceBytes = orderedNodes.reduce(
    (sum, id) => sum + graph.__files.nodes[id].bytes.length,
    0,
  );
  const repositorySkillIds = skillIds.filter((id) => graph.skills[id].source === "repository");
  const runtimeSkillIds = skillIds.filter((id) => graph.skills[id].source === "runtime");
  const repositorySkillBytes = repositorySkillIds.reduce(
    (sum, id) => sum + graph.__files.skills[id].bytes.length,
    0,
  );
  const orchestratorBytes = graph.__files.orchestrator.bytes.length;
  return {
    knownTotalBytes: orchestratorBytes + referenceBytes + repositorySkillBytes,
    orchestratorBytes,
    referenceBytes,
    repositorySkillBytes,
    repositorySkillIds,
    runtimeSkillIds,
  };
}

export function resolveSelection(graph, selection, explicitNodes = []) {
  const seeds = [...graph.mandatory_nodes, ...selectionEntries(selection), ...explicitNodes];
  const orderedNodes = buildNodeClosure(graph, seeds);
  const selectedNodes = new Set(orderedNodes);
  validateClosureConflicts(graph, orderedNodes, "selection");
  validateOperationConflicts(graph, selection.operations, "selection");

  const capabilities = new Set(orderedNodes.flatMap((id) => graph.nodes[id].provides));
  for (const operationId of selection.operations) {
    const operation = graph.operations[operationId];
    invariant(operation, `selection references unknown operation ${operationId}`);
    const missingNodes = operation.requires.filter((id) => !selectedNodes.has(id));
    invariant(
      missingNodes.length === 0,
      `operation ${operationId} is missing required context node(s): ${missingNodes.join(", ")}`,
    );
    const requiredCapabilities = [...BASE_SAFETY[operation.effect], ...operation.required_capabilities];
    const missingCapabilities = [...new Set(requiredCapabilities)].filter(
      (capability) => !hasCapability(capabilities, capability),
    );
    invariant(
      missingCapabilities.length === 0,
      `operation ${operationId} is missing safety capability coverage: ${missingCapabilities.join(", ")}`,
    );
  }

  return { orderedNodes, capabilities };
}
