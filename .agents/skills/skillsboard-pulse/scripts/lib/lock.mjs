import {
  basename,
  dirname,
  join,
} from "node:path";
import {
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";

import { deepSort } from "./expect.mjs";
import { loadAndHashFiles, readGraph, validateGraph } from "./load.mjs";
import { computeGraphRoot } from "./merkle.mjs";
import { validateTopLevelShape } from "./shape.mjs";

export function lockGraph(graphPath) {
  const loaded = readGraph(graphPath);
  const graph = deepSort(loaded.graph);
  validateTopLevelShape(graph, { allowStaleHashes: true, requireSorted: true });
  const { files } = loadAndHashFiles(graph, loaded.graphPath, { verifyHashes: false });
  for (const [id, file] of Object.entries(files.nodes)) graph.nodes[id].content_sha256 = file.hash;
  for (const [id, file] of Object.entries(files.artifacts)) graph.artifacts[id].content_sha256 = file.hash;
  for (const [id, file] of Object.entries(files.skills)) graph.skills[id].content_sha256 = file.hash;
  graph.integrity = { algorithm: "sha256-merkle-v1", root_sha256: computeGraphRoot(graph) };

  validateGraph(graph, { graphPath: loaded.graphPath });
  const serialized = `${JSON.stringify(deepSort(graph), null, 2)}\n`;
  const previous = readFileSync(loaded.graphPath, "utf8");
  const changed = previous !== serialized;
  if (changed) {
    const temporaryPath = join(dirname(loaded.graphPath), `.${basename(loaded.graphPath)}.${process.pid}.tmp`);
    try {
      writeFileSync(temporaryPath, serialized, { encoding: "utf8", mode: statSync(loaded.graphPath).mode });
      renameSync(temporaryPath, loaded.graphPath);
    } finally {
      rmSync(temporaryPath, { force: true });
    }
  }
  return { changed, rootSha256: graph.integrity.root_sha256, graph };
}
