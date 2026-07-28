import { invariant } from "./errors.mjs";

function mergeRules(wildcard, specific) {
  return {
    must_include_nodes: specific?.must_include_nodes ?? wildcard?.must_include_nodes,
    must_include_operations: specific?.must_include_operations ?? wildcard?.must_include_operations,
    must_include_state_views: specific?.must_include_state_views ?? wildcard?.must_include_state_views,
    effects_allowed: specific?.effects_allowed ?? wildcard?.effects_allowed,
    forbid_effects: specific?.forbid_effects ?? wildcard?.forbid_effects,
    forbid_nodes: specific?.forbid_nodes ?? wildcard?.forbid_nodes,
    allow_nodes: specific?.allow_nodes ?? wildcard?.allow_nodes,
    forbid_self_origin: specific?.forbid_self_origin ?? wildcard?.forbid_self_origin,
  };
}

function selectionRulesFor(graph, groupName, id) {
  const policy = graph.policy_invariants;
  if (!policy) return null;
  const groupKey = groupName === "run type" ? "run_types" : "routes";
  const group = policy[groupKey] ?? {};
  return mergeRules(group["*"], group[id]);
}

export function applyDeclaredSelectionPolicy(graph, { groupName, id, selection }) {
  const rules = selectionRulesFor(graph, groupName, id);
  if (!rules) return;

  if (rules.must_include_operations) {
    for (const operation of rules.must_include_operations) {
      invariant(
        selection.operations.includes(operation),
        `${groupName} ${id} must own ${operation}`,
      );
    }
  }

  if (rules.must_include_state_views) {
    for (const stateView of rules.must_include_state_views) {
      invariant(
        selection.state_views.includes(stateView),
        `${groupName} ${id} must load the ${stateView} state view`,
      );
    }
  }

  if (rules.effects_allowed) {
    const allowed = new Set(rules.effects_allowed);
    for (const operation of selection.operations) {
      invariant(
        allowed.has(graph.operations[operation].effect),
        `${groupName} ${id} cannot execute ${graph.operations[operation].effect} operation ${operation}; dispatch a route executor`,
      );
    }
  }

  if (rules.forbid_effects) {
    const forbidden = new Set(rules.forbid_effects);
    for (const operation of selection.operations) {
      invariant(
        !forbidden.has(graph.operations[operation].effect),
        `${groupName} ${id} cannot execute ${graph.operations[operation].effect} operation ${operation}; return the result to the orchestrator`,
      );
    }
  }

  if (rules.forbid_self_origin === true && selection.allowed_origin_policy_nodes) {
    invariant(
      !selection.allowed_origin_policy_nodes.includes(id),
      `route ${id} cannot self-authorize its origin policy scope`,
    );
  }
}

export function applyClosureSelectionPolicy(graph, { groupName, id, orderedNodes }) {
  const rules = selectionRulesFor(graph, groupName, id);
  if (!rules) return;

  if (rules.must_include_nodes) {
    for (const node of rules.must_include_nodes) {
      invariant(orderedNodes.includes(node), `${groupName} ${id} must load ${node}`);
    }
  }

  const forbidNodes = new Set(rules.forbid_nodes ?? []);
  for (const node of rules.allow_nodes ?? []) forbidNodes.delete(node);
  for (const node of forbidNodes) {
    invariant(
      !orderedNodes.includes(node),
      `${groupName} ${id} must not load parent-only ${node} state-writing context`,
    );
  }
}

export function applyGraphPolicyInvariants(graph) {
  const policy = graph.policy_invariants;
  if (!policy) return;

  if (policy.mandatory_nodes_must_equal) {
    invariant(
      graph.mandatory_nodes.length === policy.mandatory_nodes_must_equal.length
        && graph.mandatory_nodes.every((id, index) => id === policy.mandatory_nodes_must_equal[index]),
      `mandatory nodes must equal [${policy.mandatory_nodes_must_equal.join(", ")}]`,
    );
  }

  if (policy.node_reference_must_equal) {
    for (const [id, reference] of Object.entries(policy.node_reference_must_equal)) {
      invariant(graph.nodes[id], `policy invariant pins unknown node ${id}`);
      invariant(
        graph.nodes[id].reference === reference,
        `${id} must reference exactly ${reference}`,
      );
    }
  }
}
