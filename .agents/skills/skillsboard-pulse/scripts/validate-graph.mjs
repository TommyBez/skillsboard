#!/usr/bin/env node

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { GraphValidationError, invariant } from "./lib/errors.mjs";
import { checkGraph, DEFAULT_GRAPH_PATH, readGraph, validateGraph } from "./lib/load.mjs";
import { lockGraph } from "./lib/lock.mjs";
import { computeGraphRoot } from "./lib/merkle.mjs";
import { benchmarkGraph, resolveGraph } from "./lib/resolve.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

export {
  GraphValidationError,
  checkGraph,
  computeGraphRoot,
  lockGraph,
  readGraph,
  resolveGraph,
  validateGraph,
};

function parseCliArguments(argv) {
  const [command, ...args] = argv;
  invariant(
    ["benchmark", "check", "resolve", "lock"].includes(command),
    "usage: validate-graph.mjs <benchmark|check|resolve|lock> [options]",
  );
  const options = { command, graph: DEFAULT_GRAPH_PATH, nodes: [] };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--graph") {
      invariant(value, "--graph requires a path");
      options.graph = resolve(value);
      index += 1;
    } else if (argument === "--run") {
      invariant(value, "--run requires an id");
      options.run = value;
      index += 1;
    } else if (argument === "--route") {
      invariant(value, "--route requires an id");
      options.route = value;
      index += 1;
    } else if (argument === "--node") {
      invariant(value, "--node requires an id");
      options.nodes.push(value);
      index += 1;
    } else {
      throw new GraphValidationError(`unknown argument: ${argument}`);
    }
  }
  if (command !== "resolve") {
    invariant(!options.run && !options.route && options.nodes.length === 0, `${command} does not accept resolve selectors`);
  }
  return options;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function runCli() {
  const options = parseCliArguments(process.argv.slice(2));
  if (options.command === "lock") {
    const result = lockGraph(options.graph);
    printJson({ ok: true, changed: result.changed, root_sha256: result.rootSha256 });
    return;
  }

  const checked = checkGraph(options.graph);
  if (options.command === "check") {
    printJson({
      ok: true,
      graph_schema_version: checked.graph.schema_version,
      state_schema_version: checked.graph.state_schema_version,
      contract_version: checked.graph.contract_version,
      root_sha256: checked.rootSha256,
      nodes: Object.keys(checked.graph.nodes).length,
      routes: Object.keys(checked.graph.routes).length,
    });
    return;
  }
  if (options.command === "benchmark") {
    printJson({ ok: true, ...benchmarkGraph(checked.graph) });
    return;
  }
  printJson(resolveGraph(checked.graph, options));
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === SCRIPT_PATH) {
  try {
    runCli();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`pulse graph validation failed: ${message}\n`);
    process.exitCode = 1;
  }
}
