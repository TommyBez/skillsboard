import {
  buildNodeClosure,
  measureKnownContext,
  resolveSelection,
  selectionEntries,
  selectionSkillIds,
} from "./closure.mjs";
import { invariant } from "./errors.mjs";
import { effectiveOriginPolicyNodes } from "./origins.mjs";
import {
  applyClosureSelectionPolicy,
  applyDeclaredSelectionPolicy,
  applyGraphPolicyInvariants,
} from "./policy.mjs";

export function validateCrossReferences(graph) {
  const nodeIds = new Set(Object.keys(graph.nodes));
  const skillIds = new Set(Object.keys(graph.skills));
  const interferenceIds = new Set(graph.interference_keys);
  const operationIds = new Set(Object.keys(graph.operations));
  const stateViewIds = new Set(Object.keys(graph.state_views));

  applyGraphPolicyInvariants(graph);

  for (const mandatory of graph.mandatory_nodes) {
    invariant(nodeIds.has(mandatory), `mandatory node does not exist: ${mandatory}`);
  }
  for (const [id, node] of Object.entries(graph.nodes)) {
    for (const dependency of node.requires) {
      invariant(nodeIds.has(dependency), `node ${id} requires unknown node ${dependency}`);
    }
    for (const conflict of node.conflicts_with) {
      invariant(nodeIds.has(conflict), `node ${id} conflicts with unknown node ${conflict}`);
      invariant(conflict !== id, `node ${id} conflicts with itself`);
    }
  }
  buildNodeClosure(graph, Object.keys(graph.nodes));

  for (const [id, operation] of Object.entries(graph.operations)) {
    for (const dependency of operation.requires) {
      invariant(nodeIds.has(dependency), `operation ${id} requires unknown node ${dependency}`);
    }
    for (const skill of operation.skills) {
      invariant(skillIds.has(skill), `operation ${id} references unknown skill ${skill}`);
    }
    for (const key of operation.interference_keys) {
      invariant(interferenceIds.has(key), `operation ${id} references unknown interference key ${key}`);
    }
    for (const conflict of operation.conflicts_with) {
      invariant(operationIds.has(conflict), `operation ${id} conflicts with unknown operation ${conflict}`);
      invariant(conflict !== id, `operation ${id} conflicts with itself`);
    }
    if (operation.effect === "human_only") {
      invariant(operation.autonomy === "manual_only", `human-only operation ${id} must be manual_only`);
    } else if (
      operation.autonomy === "autonomous"
      && ["external_write", "public_effect", "repository_write", "spend"].includes(operation.effect)
    ) {
      invariant(operation.interference_keys.length > 0, `autonomous write operation ${id} must declare an interference key`);
    }
  }

  const usedSkills = new Set();
  const usedInterference = new Set();
  const usedOperations = new Set();
  const usedStateViews = new Set();
  const reachableNodes = new Set(graph.mandatory_nodes);

  for (const operation of Object.values(graph.operations)) {
    operation.skills.forEach((item) => usedSkills.add(item));
    operation.interference_keys.forEach((item) => usedInterference.add(item));
  }

  for (const [groupName, selections] of [["run type", graph.run_types], ["route", graph.routes]]) {
    for (const [id, selection] of Object.entries(selections)) {
      for (const node of selectionEntries(selection)) {
        invariant(nodeIds.has(node), `${groupName} ${id} references unknown node ${node}`);
      }
      for (const operation of selection.operations) {
        invariant(operationIds.has(operation), `${groupName} ${id} references unknown operation ${operation}`);
        usedOperations.add(operation);
      }
      for (const skill of selection.skills) {
        invariant(skillIds.has(skill), `${groupName} ${id} references unknown skill ${skill}`);
        usedSkills.add(skill);
      }
      for (const stateView of selection.state_views) {
        invariant(stateViewIds.has(stateView), `${groupName} ${id} references unknown state view ${stateView}`);
        usedStateViews.add(stateView);
      }

      const originVariants = groupName === "route" && selection.requires_origin_policy_node
        ? effectiveOriginPolicyNodes(graph, selection)
        : selection.allowed_origin_policy_nodes ?? [null];
      if (selection.requires_origin_policy_node) {
        for (const origin of originVariants) {
          invariant(nodeIds.has(origin), `${groupName} ${id} allows unknown origin policy node ${origin}`);
          invariant(graph.nodes[origin].kind === "policy", `${groupName} ${id} origin ${origin} must be a policy node`);
          invariant(!graph.mandatory_nodes.includes(origin), `${groupName} ${id} origin ${origin} must not be mandatory`);
        }
      }

      applyDeclaredSelectionPolicy(graph, { groupName, id, selection });

      const { orderedNodes } = resolveSelection(graph, selection);
      orderedNodes.forEach((node) => reachableNodes.add(node));
      if (groupName === "route" && !selection.requires_origin_policy_node) {
        invariant(
          orderedNodes.some((node) => graph.nodes[node].kind === "policy" && !graph.mandatory_nodes.includes(node)),
          `route ${id} must contain at least one eligible origin policy node`,
        );
      }

      applyClosureSelectionPolicy(graph, { groupName, id, orderedNodes });

      const skillIdsForSelection = selectionSkillIds(graph, selection);
      const budgetOrigins = selection.requires_origin_policy_node ? originVariants : [null];
      for (const origin of budgetOrigins) {
        const variantNodes = origin ? buildNodeClosure(graph, [...orderedNodes, origin]) : orderedNodes;
        variantNodes.forEach((node) => reachableNodes.add(node));
        const measurement = measureKnownContext(graph, variantNodes, skillIdsForSelection);
        invariant(
          measurement.knownTotalBytes <= selection.max_known_context_bytes,
          `${groupName} ${id}${origin ? ` with origin ${origin}` : ""} exceeds max_known_context_bytes (${measurement.knownTotalBytes} > ${selection.max_known_context_bytes})`,
        );
      }
    }
  }

  for (const id of Object.keys(graph.operations)) {
    const operation = graph.operations[id];
    if (["external_write", "public_effect", "repository_write", "spend"].includes(operation.effect)) {
      invariant(usedOperations.has(id), `external write operation is unreachable from every route/run type: ${id}`);
    }
  }
  for (const id of Object.keys(graph.nodes)) {
    invariant(reachableNodes.has(id), `policy node is unreachable from every route/run type: ${id}`);
  }
  for (const id of skillIds) invariant(usedSkills.has(id), `declared skill is unused: ${id}`);
  for (const id of interferenceIds) invariant(usedInterference.has(id), `declared interference key is unused: ${id}`);
  for (const id of stateViewIds) invariant(usedStateViews.has(id), `declared state view is unused: ${id}`);

  for (const [id, skill] of Object.entries(graph.skills)) {
    if (skill.source === "repository") invariant(graph.__files.skills[id], `repository skill ${id} was not loaded`);
  }
}
