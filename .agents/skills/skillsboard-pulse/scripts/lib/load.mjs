import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildNodeClosure } from "./closure.mjs";
import { validateCrossReferences } from "./cross-refs.mjs";
import { GraphValidationError, invariant } from "./errors.mjs";
import { findRepositoryRoot, readContractFile, resolveSafeFile, sha256Bytes } from "./fs-safety.mjs";
import { computeGraphRoot } from "./merkle.mjs";
import { validateTopLevelShape } from "./shape.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_GRAPH_PATH = resolve(SCRIPT_DIR, "..", "..", "graph.json");

export function loadAndHashFiles(graph, graphPath, { verifyHashes }) {
  const skillRoot = dirname(graphPath);
  const repositoryRoot = findRepositoryRoot(skillRoot);
  const files = { nodes: {}, artifacts: {}, skills: {} };
  const seenPaths = new Map();

  const orchestratorPath = resolveSafeFile(skillRoot, "SKILL.md", "orchestrator skill");
  const orchestratorBytes = readContractFile(orchestratorPath, "orchestrator skill");
  files.orchestrator = {
    path: orchestratorPath,
    bytes: orchestratorBytes,
    hash: sha256Bytes(orchestratorBytes),
  };

  for (const [id, node] of Object.entries(graph.nodes)) {
    const path = resolveSafeFile(repositoryRoot, node.reference, `node ${id} reference`);
    invariant(path !== graphPath, `node ${id} must not hash graph.json itself`);
    invariant(!seenPaths.has(path), `node ${id} duplicates hashed file owned by ${seenPaths.get(path)}`);
    seenPaths.set(path, `node ${id}`);
    const bytes = readContractFile(path, `node ${id} reference`);
    const hash = sha256Bytes(bytes);
    if (verifyHashes) invariant(node.content_sha256 === hash, `node ${id} content_sha256 mismatch: expected ${hash}`);
    files.nodes[id] = { path, bytes, hash };
  }

  for (const [id, artifact] of Object.entries(graph.artifacts ?? {})) {
    const path = resolveSafeFile(repositoryRoot, artifact.file, `artifact ${id} file`);
    invariant(path !== graphPath, `artifact ${id} must not hash graph.json itself`);
    invariant(!seenPaths.has(path), `artifact ${id} duplicates hashed file owned by ${seenPaths.get(path)}`);
    seenPaths.set(path, `artifact ${id}`);
    const bytes = readContractFile(path, `artifact ${id} file`);
    const hash = sha256Bytes(bytes);
    if (verifyHashes) invariant(artifact.content_sha256 === hash, `artifact ${id} content_sha256 mismatch: expected ${hash}`);
    files.artifacts[id] = { path, bytes, hash };
  }

  for (const [id, skill] of Object.entries(graph.skills)) {
    if (skill.source !== "repository") continue;
    const path = resolveSafeFile(
      repositoryRoot,
      `.agents/skills/${skill.selector}/SKILL.md`,
      `repository skill ${id}`,
    );
    const bytes = readContractFile(path, `repository skill ${id}`);
    const hash = sha256Bytes(bytes);
    if (verifyHashes) invariant(skill.content_sha256 === hash, `repository skill ${id} content_sha256 mismatch: expected ${hash}`);
    files.skills[id] = { path, bytes, hash };
  }

  for (const [id, file] of Object.entries(files.nodes)) {
    invariant(file.bytes.length <= graph.context_limits.max_node_bytes, `node ${id} exceeds max_node_bytes`);
  }
  const mandatoryBytes = buildNodeClosure(graph, graph.mandatory_nodes).reduce(
    (sum, id) => sum + files.nodes[id].bytes.length,
    0,
  );
  const mandatoryLimit = graph.context_limits.max_mandatory_bytes ?? graph.context_limits.max_kernel_bytes;
  invariant(mandatoryBytes <= mandatoryLimit, `mandatory closure exceeds context limit (${mandatoryBytes} > ${mandatoryLimit})`);

  Object.defineProperty(graph, "__files", { configurable: true, enumerable: false, value: files });
  return { repositoryRoot, skillRoot, files };
}

export function validateGraph(graph, options = {}) {
  const graphPath = resolve(options.graphPath ?? DEFAULT_GRAPH_PATH);
  const allowStaleHashes = options.allowStaleHashes === true;
  const requireSorted = options.requireSorted !== false;
  validateTopLevelShape(graph, { allowStaleHashes, requireSorted });
  const { repositoryRoot, skillRoot, files } = loadAndHashFiles(graph, graphPath, {
    verifyHashes: !allowStaleHashes,
  });
  validateCrossReferences(graph);

  const rootSha256 = computeGraphRoot(graph);
  if (!allowStaleHashes) {
    invariant(graph.integrity.root_sha256 === rootSha256, `graph root_sha256 mismatch: expected ${rootSha256}`);
  }
  return {
    graph,
    graphPath,
    repositoryRoot,
    skillRoot,
    files,
    rootSha256,
  };
}

export function readGraph(graphPath = DEFAULT_GRAPH_PATH) {
  const resolvedPath = resolve(graphPath);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new GraphValidationError(`cannot parse ${resolvedPath}: ${error.message}`);
  }
  return { graph: parsed, graphPath: resolvedPath };
}

export function checkGraph(graphPath = DEFAULT_GRAPH_PATH) {
  const loaded = readGraph(graphPath);
  return validateGraph(loaded.graph, { graphPath: loaded.graphPath });
}
