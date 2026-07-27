import { createHash } from "node:crypto";

import { invariant } from "./errors.mjs";
import { canonicalJson, compareAscii, deepSort } from "./expect.mjs";

function uint32(value) {
  invariant(Number.isSafeInteger(value) && value >= 0 && value <= 0xffffffff, "Merkle length exceeds uint32");
  const output = Buffer.allocUnsafe(4);
  output.writeUInt32BE(value);
  return output;
}

function merkleLeaf(label, payload) {
  const labelBytes = Buffer.from(label, "utf8");
  const payloadBytes = Buffer.from(canonicalJson(payload), "utf8");
  return createHash("sha256")
    .update(Buffer.concat([Buffer.from([0]), uint32(labelBytes.length), labelBytes, uint32(payloadBytes.length), payloadBytes]))
    .digest();
}

export function computeGraphRoot(graph) {
  const meta = {};
  for (const [key, value] of Object.entries(graph)) {
    if (!["artifacts", "integrity", "nodes", "operations", "routes", "run_types"].includes(key)) {
      meta[key] = value;
    }
  }

  const leaves = [["meta", deepSort(meta)]];
  for (const [id, artifact] of Object.entries(graph.artifacts ?? {})) leaves.push([`artifact/${id}`, deepSort(artifact)]);
  for (const [id, node] of Object.entries(graph.nodes)) leaves.push([`node/${id}`, deepSort(node)]);
  for (const [id, operation] of Object.entries(graph.operations)) leaves.push([`operation/${id}`, deepSort(operation)]);
  for (const [id, runType] of Object.entries(graph.run_types)) leaves.push([`run_type/${id}`, deepSort(runType)]);
  for (const [id, route] of Object.entries(graph.routes)) leaves.push([`route/${id}`, deepSort(route)]);
  leaves.sort(([left], [right]) => compareAscii(left, right));

  let level = leaves.map(([label, payload]) => merkleLeaf(label, payload));
  const leafCount = level.length;
  invariant(leafCount > 0, "graph must produce at least one Merkle leaf");
  while (level.length > 1) {
    const next = [];
    for (let index = 0; index < level.length; index += 2) {
      if (index + 1 === level.length) {
        next.push(level[index]);
      } else {
        next.push(
          createHash("sha256")
            .update(Buffer.concat([Buffer.from([1]), level[index], level[index + 1]]))
            .digest(),
        );
      }
    }
    level = next;
  }
  return createHash("sha256")
    .update(Buffer.concat([Buffer.from([2]), uint32(leafCount), level[0]]))
    .digest("hex");
}
