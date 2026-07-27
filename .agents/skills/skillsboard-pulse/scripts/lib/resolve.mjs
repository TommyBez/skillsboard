import {
  buildNodeClosure,
  measureKnownContext,
  resolveSelection,
  selectionEntries,
  selectionSkillIds,
} from "./closure.mjs";
import { EXECUTOR_RESULT_ENUMS, EXECUTOR_RESULT_REQUIRED_KEYS } from "./constants.mjs";
import { invariant } from "./errors.mjs";
import { compareAscii } from "./expect.mjs";

export function resolveGraph(graph, options = {}) {
  const runId = options.run;
  const routeId = options.route;
  const explicitNodes = options.nodes ?? [];
  invariant(Boolean(runId) !== Boolean(routeId), "resolve requires exactly one isolated selector: --run or --route");
  invariant(!(runId && routeId), "resolve isolates orchestration and execution: use either --run or --route, never both");
  invariant(!(runId && explicitNodes.length > 0), "run resolution does not accept --node; resolve policy work through a separate action route");
  if (runId) invariant(graph.run_types[runId], `unknown run type: ${runId}`);
  if (routeId) invariant(graph.routes[routeId], `unknown route: ${routeId}`);
  for (const id of explicitNodes) invariant(graph.nodes[id], `unknown explicit node: ${id}`);

  const route = routeId ? graph.routes[routeId] : null;
  if (route) {
    invariant(explicitNodes.length === 1, `route ${routeId} requires exactly one origin policy node via --node`);
    invariant(
      graph.nodes[explicitNodes[0]].kind === "policy" && !graph.mandatory_nodes.includes(explicitNodes[0]),
      `route ${routeId} requires a non-mandatory policy origin node`,
    );
  }
  if (route?.requires_origin_policy_node) {
    invariant(
      route.allowed_origin_policy_nodes.includes(explicitNodes[0]),
      `route ${routeId} does not allow origin policy node ${explicitNodes[0]}`,
    );
  } else if (route) {
    const routeClosure = buildNodeClosure(graph, [...graph.mandatory_nodes, ...selectionEntries(route)]);
    invariant(
      routeClosure.includes(explicitNodes[0]),
      `route ${routeId} origin policy node ${explicitNodes[0]} is outside its policy closure`,
    );
  }

  const selections = [runId ? graph.run_types[runId] : null, route].filter(Boolean);
  const combined = {
    entry_nodes: selections.flatMap(selectionEntries),
    operations: [...new Set(selections.flatMap((selection) => selection.operations))].sort(compareAscii),
    skills: [...new Set(selections.flatMap((selection) => selection.skills))].sort(compareAscii),
    state_views: [...new Set(selections.flatMap((selection) => selection.state_views))].sort(compareAscii),
    max_known_context_bytes: selections.length > 0
      ? selections[0].max_known_context_bytes
      : Number.MAX_SAFE_INTEGER,
  };
  const { orderedNodes } = resolveSelection(graph, combined, explicitNodes);

  const skillIds = selectionSkillIds(graph, combined);
  const measurement = measureKnownContext(graph, orderedNodes, skillIds);
  invariant(
    measurement.knownTotalBytes <= combined.max_known_context_bytes,
    `resolved context exceeds max_known_context_bytes (${measurement.knownTotalBytes} > ${combined.max_known_context_bytes})`,
  );
  const interferenceKeys = [...new Set(combined.operations.flatMap((id) => graph.operations[id].interference_keys))].sort(compareAscii);
  const stateViews = Object.fromEntries(combined.state_views.map((id) => [id, graph.state_views[id]]));

  return {
    graph_schema_version: graph.schema_version,
    state_schema_version: graph.state_schema_version,
    contract_version: graph.contract_version,
    root_sha256: graph.integrity.root_sha256,
    run_type: runId ?? null,
    route: routeId ?? null,
    origin_policy_node: routeId ? explicitNodes[0] : null,
    nodes: orderedNodes.map((id) => ({ id, reference: graph.nodes[id].reference })),
    references: orderedNodes.map((id) => graph.nodes[id].reference),
    skills: skillIds.map((id) => ({ id, ...graph.skills[id] })),
    operations: combined.operations,
    interference_keys: interferenceKeys,
    executor_result: {
      schema_version: graph.execution_limits.executor_result_schema_version,
      max_bytes: graph.execution_limits.max_executor_result_bytes,
      required_keys: EXECUTOR_RESULT_REQUIRED_KEYS,
      enums: EXECUTOR_RESULT_ENUMS,
    },
    policy_selectors: runId ? graph.policy_selectors : [],
    state_views: stateViews,
    context: {
      known_total_bytes: measurement.knownTotalBytes,
      orchestrator_bytes: measurement.orchestratorBytes,
      reference_bytes: measurement.referenceBytes,
      repository_skill_entrypoint_bytes: measurement.repositorySkillBytes,
      repository_skill_ids: measurement.repositorySkillIds,
      runtime_skills_unpriced: measurement.runtimeSkillIds,
      max_known_context_bytes: combined.max_known_context_bytes === Number.MAX_SAFE_INTEGER
        ? null
        : combined.max_known_context_bytes,
    },
  };
}

function summarizeContext(rows) {
  const values = rows.map((row) => row.known_total_bytes).sort((left, right) => left - right);
  const percentile = (fraction) => values[Math.min(values.length - 1, Math.floor((values.length - 1) * fraction))];
  return {
    count: values.length,
    min: values[0],
    median: percentile(0.5),
    p75: percentile(0.75),
    p90: percentile(0.9),
    max: values.at(-1),
    mean: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
  };
}

export function benchmarkGraph(graph) {
  const runs = Object.keys(graph.run_types).sort(compareAscii).map((id) => {
    const resolved = resolveGraph(graph, { run: id, nodes: [] });
    return {
      id,
      known_total_bytes: resolved.context.known_total_bytes,
      max_known_context_bytes: resolved.context.max_known_context_bytes,
      runtime_skills_unpriced: resolved.context.runtime_skills_unpriced,
    };
  });
  const routes = Object.keys(graph.routes).sort(compareAscii).map((id) => {
    const route = graph.routes[id];
    const origins = route.allowed_origin_policy_nodes ?? selectionEntries(route).filter(
      (node) => graph.nodes[node].kind === "policy" && !graph.mandatory_nodes.includes(node),
    );
    invariant(origins.length > 0, `route ${id} has no eligible origin policy node`);
    const variants = origins.map((origin) => resolveGraph(graph, {
      route: id,
      nodes: [origin],
    }));
    const worst = variants.reduce((left, right) => (
      left.context.known_total_bytes >= right.context.known_total_bytes ? left : right
    ));
    return {
      id,
      known_total_bytes: worst.context.known_total_bytes,
      max_known_context_bytes: worst.context.max_known_context_bytes,
      runtime_skills_unpriced: worst.context.runtime_skills_unpriced,
      worst_origin_policy_node: origins[variants.indexOf(worst)],
    };
  });
  return {
    measurement: "orchestrator + policy references + repository skill entrypoints; runtime skills and nested skill references are unpriced",
    runs,
    route_summary: summarizeContext(routes),
    routes,
  };
}
