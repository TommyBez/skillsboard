#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_GRAPH_PATH = resolve(dirname(SCRIPT_PATH), "..", "graph.json");
const GRAPH_SCHEMA_VERSION = 2;
const PRODUCT_MARKETING_REFERENCE = ".agents/product-marketing.md";
const PULSE_POLICY_REFERENCE_PATTERN = /^\.agents\/skills\/skillsboard-pulse\/references\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

const ID_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const REPOSITORY_SKILL_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SWITCH_PATTERN = /^PULSE_ENABLE_[A-Z0-9_]+$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const JSON_POINTER_PATTERN = /^(?:\/(?:[^~/]|~[01])*)+$/;

const EFFECTS = new Set([
  "read",
  "local_state",
  "repository_write",
  "external_write",
  "public_effect",
  "spend",
  "human_only",
]);
const AUTONOMY_STATES = new Set(["autonomous", "manual_only", "disabled"]);
const SKILL_SOURCES = new Set(["repository", "runtime"]);
const NODE_KINDS = new Set(["kernel", "mandatory", "policy"]);

const EXECUTOR_RESULT_REQUIRED_KEYS = Object.freeze([
  "ambiguity",
  "attempt_id",
  "attempted",
  "capacity_consumed",
  "containment",
  "definition_hash",
  "definition_match",
  "effect",
  "evidence_refs",
  "live_id",
  "outcome",
  "readback",
  "reason_code",
  "reason_detail",
  "resource_key",
  "route_id",
  "schema_version",
]);
const EXECUTOR_RESULT_ENUMS = Object.freeze({
  containment: ["cancelled", "corrected", "none", "paused", "quarantined", "rolled_back", "unavailable"],
  effect: ["external_write", "none", "public_effect", "read", "repository_write", "spend"],
  outcome: ["ambiguous", "completed", "contained", "failed", "no_action", "unavailable"],
  readback: ["ambiguous", "confirmed", "not_found", "not_required", "unavailable"],
  reason_code: [
    "cap_exceeded",
    "cap_unavailable",
    "consent_ineligible",
    "containment_applied",
    "definition_mismatch",
    "effect_ambiguous",
    "invalid_envelope",
    "invalid_result",
    "isolated_executor_unavailable",
    "manual_action_required",
    "measurement_failure",
    "operation_completed",
    "ownership_ambiguous",
    "policy_ineligible",
    "provider_error",
    "required_read_unavailable",
    "runtime_exhausted",
    "setup_required",
    "suppression_active",
    "switch_disabled",
    "verification_failed",
    "waiting_cooldown",
    "waiting_dependency",
    "waiting_maturity",
    "waiting_pr_approval",
  ],
});

const BASE_SAFETY = Object.freeze({
  read: ["truth", "data_safety"],
  local_state: ["truth", "data_safety", "state", "idempotency"],
  repository_write: [
    "truth",
    "authority",
    "checkout",
    "ownership",
    "idempotency",
    "verification",
    "rollback",
    "incident",
  ],
  external_write: [
    "truth",
    "authority",
    "ownership",
    "idempotency",
    "caps",
    "readback",
    "containment",
    "incident",
  ],
  public_effect: [
    "truth",
    "authority",
    "ownership",
    "idempotency",
    "caps",
    "readback",
    "containment",
    "incident",
    "eligibility",
  ],
  spend: [
    "truth",
    "authority",
    "ownership",
    "idempotency",
    "caps",
    "readback",
    "containment",
    "incident",
    "budget",
  ],
  human_only: ["truth", "authority", "handoff"],
});

// Keep the complete current switch set in executable validation so a graph
// change cannot silently drop a kill switch merely because no route references it.
export const REQUIRED_OPERATION_SWITCHES = Object.freeze([
  "PULSE_ENABLE_COMMUNITY_WRITES",
  "PULSE_ENABLE_DEMAND_RESPONSE_WRITES",
  "PULSE_ENABLE_DIRECTORY_WRITES",
  "PULSE_ENABLE_EARNED_MEDIA_OUTREACH",
  "PULSE_ENABLE_GITHUB_WRITES",
  "PULSE_ENABLE_INBOUND_PROCESSING",
  "PULSE_ENABLE_INBOUND_REPLIES",
  "PULSE_ENABLE_INCIDENT_EMAIL",
  "PULSE_ENABLE_METERED_RESEARCH",
  "PULSE_ENABLE_PARTNERSHIP_WRITES",
  "PULSE_ENABLE_POSTHOG_ASSET_WRITES",
  "PULSE_ENABLE_POSTHOG_EXPERIMENT_WRITES",
  "PULSE_ENABLE_POSTHOG_FLAG_WRITES",
  "PULSE_ENABLE_POSTHOG_SURVEY_WRITES",
  "PULSE_ENABLE_POSTHOG_WRITES",
  "PULSE_ENABLE_PRODUCT_EXPOSURE",
  "PULSE_ENABLE_PROACTIVE_EMAIL",
  "PULSE_ENABLE_RESEND_AUDIENCE_WRITES",
  "PULSE_ENABLE_RESEND_BROADCAST_DRAFTS",
  "PULSE_ENABLE_RESEND_DOMAIN_WRITES",
  "PULSE_ENABLE_RESEND_SUPPRESSION_LIFT",
  "PULSE_ENABLE_RESEND_TOPIC_WRITES",
  "PULSE_ENABLE_RESEND_WEBHOOK_WRITES",
  "PULSE_ENABLE_REVIEW_OUTREACH",
  "PULSE_ENABLE_REVIEW_RESPONSES",
  "PULSE_ENABLE_SOCIAL_PUBLISH",
  "PULSE_ENABLE_TYPEFULLY_DRAFTS",
]);

const EXACT_SWITCH_REQUIREMENTS = Object.freeze({
  "community.publish": ["PULSE_ENABLE_COMMUNITY_WRITES"],
  "dataforseo.research": ["PULSE_ENABLE_METERED_RESEARCH"],
  "demand.respond": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_DEMAND_RESPONSE_WRITES",
  ],
  "demand.email": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_DEMAND_RESPONSE_WRITES",
    "PULSE_ENABLE_PROACTIVE_EMAIL",
  ],
  "directory.publish": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_DIRECTORY_WRITES",
  ],
  "earned.outreach": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_EARNED_MEDIA_OUTREACH",
  ],
  "github.pr.write": ["PULSE_ENABLE_GITHUB_WRITES"],
  "github.pseo_pr.write": ["PULSE_ENABLE_GITHUB_WRITES"],
  "inbound.process": ["PULSE_ENABLE_INBOUND_PROCESSING"],
  "inbound.reply": [
    "PULSE_ENABLE_INBOUND_PROCESSING",
    "PULSE_ENABLE_INBOUND_REPLIES",
  ],
  "incident.email": ["PULSE_ENABLE_INCIDENT_EMAIL"],
  "partnership.outreach": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_PARTNERSHIP_WRITES",
  ],
  "posthog.asset.write": [
    "PULSE_ENABLE_POSTHOG_ASSET_WRITES",
    "PULSE_ENABLE_POSTHOG_WRITES",
  ],
  "posthog.experiment.write": [
    "PULSE_ENABLE_POSTHOG_EXPERIMENT_WRITES",
    "PULSE_ENABLE_POSTHOG_WRITES",
    "PULSE_ENABLE_PRODUCT_EXPOSURE",
  ],
  "posthog.flag.write": [
    "PULSE_ENABLE_POSTHOG_FLAG_WRITES",
    "PULSE_ENABLE_POSTHOG_WRITES",
    "PULSE_ENABLE_PRODUCT_EXPOSURE",
  ],
  "posthog.survey.write": [
    "PULSE_ENABLE_POSTHOG_SURVEY_WRITES",
    "PULSE_ENABLE_POSTHOG_WRITES",
    "PULSE_ENABLE_PRODUCT_EXPOSURE",
  ],
  "resend.audience.write": ["PULSE_ENABLE_RESEND_AUDIENCE_WRITES"],
  "resend.broadcast_draft.write": [
    "PULSE_ENABLE_RESEND_BROADCAST_DRAFTS",
  ],
  "resend.broadcast.send": [
    "PULSE_ENABLE_PROACTIVE_EMAIL",
    "PULSE_ENABLE_RESEND_BROADCAST_DRAFTS",
  ],
  "resend.domain.write": ["PULSE_ENABLE_RESEND_DOMAIN_WRITES"],
  "resend.proactive.send": ["PULSE_ENABLE_PROACTIVE_EMAIL"],
  "resend.suppression_lift": ["PULSE_ENABLE_RESEND_SUPPRESSION_LIFT"],
  "resend.topic.write": ["PULSE_ENABLE_RESEND_TOPIC_WRITES"],
  "resend.webhook.write": ["PULSE_ENABLE_RESEND_WEBHOOK_WRITES"],
  "review.outreach": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_PROACTIVE_EMAIL",
    "PULSE_ENABLE_REVIEW_OUTREACH",
  ],
  "review.respond": [
    "PULSE_ENABLE_COMMUNITY_WRITES",
    "PULSE_ENABLE_REVIEW_RESPONSES",
  ],
  "social.draft.write": ["PULSE_ENABLE_TYPEFULLY_DRAFTS"],
  "social.publish": [
    "PULSE_ENABLE_SOCIAL_PUBLISH",
    "PULSE_ENABLE_TYPEFULLY_DRAFTS",
  ],
});

const SET_ARRAY_KEYS = new Set([
  "mandatory_nodes",
  "requires",
  "conflicts_with",
  "provides",
  "required_capabilities",
  "skills",
  "switches",
  "switches_all",
  "interference_keys",
  "entry_nodes",
  "run_nodes",
  "operations",
  "state_views",
  "policy_selectors",
]);

export class GraphValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "GraphValidationError";
  }
}

function invariant(condition, message) {
  if (!condition) throw new GraphValidationError(message);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectRecord(value, label) {
  invariant(isRecord(value), `${label} must be an object`);
  return value;
}

function expectExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  invariant(unknown.length === 0, `${label} has unknown field(s): ${unknown.join(", ")}`);
}

function expectId(value, label) {
  invariant(typeof value === "string" && ID_PATTERN.test(value), `${label} must be a lower-case graph id`);
  return value;
}

function compareAscii(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function expectStringArray(value, label, { sorted = true, id = false } = {}) {
  invariant(Array.isArray(value), `${label} must be an array`);
  for (const [index, item] of value.entries()) {
    invariant(typeof item === "string", `${label}[${index}] must be a string`);
    if (id) expectId(item, `${label}[${index}]`);
  }
  const duplicates = value.filter((item, index) => value.indexOf(item) !== index);
  invariant(duplicates.length === 0, `${label} contains duplicate value(s): ${[...new Set(duplicates)].join(", ")}`);
  if (sorted) {
    const canonical = [...value].sort(compareAscii);
    invariant(value.every((item, index) => item === canonical[index]), `${label} must be sorted in ASCII order`);
  }
  return value;
}

function expectPositiveInteger(value, label) {
  invariant(Number.isSafeInteger(value) && value > 0, `${label} must be a positive safe integer`);
  return value;
}

function expectSha(value, label, allowStaleHashes) {
  invariant(typeof value === "string", `${label} must be a string`);
  if (!allowStaleHashes) {
    invariant(SHA256_PATTERN.test(value), `${label} must be a lower-case SHA-256 hex digest`);
  }
}

function expectJsonPointer(value, label) {
  invariant(
    typeof value === "string" && JSON_POINTER_PATTERN.test(value),
    `${label} must be a non-root RFC 6901 JSON pointer`,
  );
}

function expectRelativePath(value, label) {
  invariant(typeof value === "string" && value.length > 0, `${label} must be a non-empty path`);
  invariant(!isAbsolute(value), `${label} must be relative`);
  invariant(!value.includes("\\"), `${label} must use POSIX separators`);
  const segments = value.split("/");
  invariant(
    segments.every((segment) => segment.length > 0 && segment !== "." && segment !== ".."),
    `${label} must not contain empty, dot, or parent segments`,
  );
  return value;
}

function findRepositoryRoot(startPath) {
  let current = resolve(startPath);
  while (true) {
    if (existsSync(join(current, ".git"))) return current;
    const parent = dirname(current);
    if (parent === current) {
      throw new GraphValidationError(`cannot find repository root above ${startPath}`);
    }
    current = parent;
  }
}

function isWithin(rootPath, candidatePath) {
  const pathFromRoot = relative(rootPath, candidatePath);
  return pathFromRoot === "" || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== ".." && !isAbsolute(pathFromRoot));
}

function resolveSafeFile(rootPath, relativePath, label) {
  expectRelativePath(relativePath, label);
  const candidate = resolve(rootPath, ...relativePath.split("/"));
  invariant(isWithin(rootPath, candidate), `${label} escapes its allowed root`);
  invariant(existsSync(candidate), `${label} does not exist: ${relativePath}`);

  let cursor = rootPath;
  for (const segment of relativePath.split("/")) {
    cursor = join(cursor, segment);
    invariant(!lstatSync(cursor).isSymbolicLink(), `${label} must not traverse a symbolic link: ${relativePath}`);
  }

  const realRoot = realpathSync(rootPath);
  const realCandidate = realpathSync(candidate);
  invariant(isWithin(realRoot, realCandidate), `${label} resolves outside its allowed root`);
  invariant(statSync(realCandidate).isFile(), `${label} must resolve to a regular file`);
  return realCandidate;
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function readContractFile(path, label) {
  const bytes = readFileSync(path);
  invariant(bytes.length > 0, `${label} must not be empty`);
  invariant(!(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf), `${label} must not contain a UTF-8 BOM`);
  invariant(!bytes.includes(0), `${label} must not contain NUL bytes`);
  invariant(!bytes.includes(13), `${label} must use LF line endings`);
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new GraphValidationError(`${label} must contain valid UTF-8`);
  }
  return bytes;
}

function deepSort(value, parentKey = "") {
  if (Array.isArray(value)) {
    const items = value.map((item) => deepSort(item));
    return SET_ARRAY_KEYS.has(parentKey) && items.every((item) => typeof item === "string")
      ? items.sort(compareAscii)
      : items;
  }
  if (!isRecord(value)) return value;
  const output = {};
  for (const key of Object.keys(value).sort(compareAscii)) {
    output[key] = deepSort(value[key], key);
  }
  return output;
}

function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    invariant(Number.isSafeInteger(value), "canonical JSON accepts only safe integers");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  invariant(isRecord(value), "canonical JSON received an unsupported value");
  const entries = Object.keys(value)
    .sort(compareAscii)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
  return `{${entries.join(",")}}`;
}

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

function validateTopLevelShape(graph, options) {
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
      "switches",
      "interference_keys",
      "artifacts",
      "nodes",
      "operations",
      "state_views",
      "policy_selectors",
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
  expectStringArray(graph.switches, "graph.switches", { sorted: requireSorted });
  for (const item of graph.switches) invariant(SWITCH_PATTERN.test(item), `invalid operation switch: ${item}`);
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
    if (id === "product.truth") {
      invariant(
        node.reference === PRODUCT_MARKETING_REFERENCE,
        `product.truth must reference exactly ${PRODUCT_MARKETING_REFERENCE}`,
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
        "switches_all",
        "conflicts_with",
        "interference_keys",
      ]),
      `graph.operations.${id}`,
    );
    invariant(EFFECTS.has(operation.effect), `graph.operations.${id}.effect is invalid`);
    invariant(AUTONOMY_STATES.has(operation.autonomy), `graph.operations.${id}.autonomy is invalid`);
    expectStringArray(operation.requires, `graph.operations.${id}.requires`, { sorted: requireSorted, id: true });
    expectStringArray(operation.required_capabilities, `graph.operations.${id}.required_capabilities`, { sorted: requireSorted, id: true });
    expectStringArray(operation.skills, `graph.operations.${id}.skills`, { sorted: requireSorted, id: true });
    expectStringArray(operation.switches_all, `graph.operations.${id}.switches_all`, { sorted: requireSorted });
    expectStringArray(operation.conflicts_with, `graph.operations.${id}.conflicts_with`, { sorted: requireSorted, id: true });
    expectStringArray(operation.interference_keys, `graph.operations.${id}.interference_keys`, { sorted: requireSorted, id: true });
  }

  const stateViews = expectRecord(graph.state_views, "graph.state_views");
  for (const [id, pointers] of Object.entries(stateViews)) {
    expectId(id, `graph.state_views key ${id}`);
    expectStringArray(pointers, `graph.state_views.${id}`, { sorted: requireSorted });
    invariant(pointers.length > 0, `graph.state_views.${id} must not be empty`);
    for (const [index, pointer] of pointers.entries()) expectJsonPointer(pointer, `graph.state_views.${id}[${index}]`);
  }
  expectStringArray(graph.policy_selectors, "graph.policy_selectors", { sorted: requireSorted });
  for (const [index, pointer] of graph.policy_selectors.entries()) expectJsonPointer(pointer, `graph.policy_selectors[${index}]`);

  validateSelectionsShape(graph.run_types, "graph.run_types", false, requireSorted);
  validateSelectionsShape(graph.routes, "graph.routes", true, requireSorted);

  if (!allowStaleHashes || graph.integrity !== undefined) {
    const integrity = expectRecord(graph.integrity, "graph.integrity");
    expectExactKeys(integrity, new Set(["algorithm", "root_sha256"]), "graph.integrity");
    invariant(integrity.algorithm === "sha256-merkle-v1", "graph.integrity.algorithm must be sha256-merkle-v1");
    expectSha(integrity.root_sha256, "graph.integrity.root_sha256", allowStaleHashes);
  }
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
      invariant(typeof selection.requires_origin_policy_node === "boolean", `${label}.${id}.requires_origin_policy_node must be boolean`);
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

function buildNodeClosure(graph, seedNodes) {
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

function validateClosureConflicts(graph, nodeIds, label) {
  const selected = new Set(nodeIds);
  for (const id of nodeIds) {
    for (const conflict of graph.nodes[id].conflicts_with) {
      invariant(!selected.has(conflict), `${label} selects conflicting nodes ${id} and ${conflict}`);
    }
  }
}

function validateOperationConflicts(graph, operationIds, label) {
  const selected = new Set(operationIds);
  for (const id of operationIds) {
    for (const conflict of graph.operations[id].conflicts_with) {
      invariant(!selected.has(conflict), `${label} selects conflicting operations ${id} and ${conflict}`);
    }
  }
}

function selectionEntries(selection) {
  return selection.entry_nodes ?? selection.run_nodes;
}

function selectionSkillIds(graph, selection) {
  const operationSkills = selection.operations.flatMap((id) => graph.operations[id]?.skills ?? []);
  return [...new Set([...selection.skills, ...operationSkills])].sort(compareAscii);
}

function measureKnownContext(graph, orderedNodes, skillIds) {
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

function resolveSelection(graph, selection, explicitNodes = []) {
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

function validateCrossReferences(graph, repositoryRoot) {
  const nodeIds = new Set(Object.keys(graph.nodes));
  const skillIds = new Set(Object.keys(graph.skills));
  const switchIds = new Set(graph.switches);
  const interferenceIds = new Set(graph.interference_keys);
  const operationIds = new Set(Object.keys(graph.operations));
  const stateViewIds = new Set(Object.keys(graph.state_views));

  for (const mandatory of graph.mandatory_nodes) invariant(nodeIds.has(mandatory), `mandatory node does not exist: ${mandatory}`);
  for (const [id, node] of Object.entries(graph.nodes)) {
    for (const dependency of node.requires) invariant(nodeIds.has(dependency), `node ${id} requires unknown node ${dependency}`);
    for (const conflict of node.conflicts_with) {
      invariant(nodeIds.has(conflict), `node ${id} conflicts with unknown node ${conflict}`);
      invariant(conflict !== id, `node ${id} conflicts with itself`);
    }
  }
  buildNodeClosure(graph, Object.keys(graph.nodes));

  for (const [id, operation] of Object.entries(graph.operations)) {
    for (const dependency of operation.requires) invariant(nodeIds.has(dependency), `operation ${id} requires unknown node ${dependency}`);
    for (const skill of operation.skills) invariant(skillIds.has(skill), `operation ${id} references unknown skill ${skill}`);
    for (const switchName of operation.switches_all) invariant(switchIds.has(switchName), `operation ${id} references undeclared switch ${switchName}`);
    for (const key of operation.interference_keys) invariant(interferenceIds.has(key), `operation ${id} references unknown interference key ${key}`);
    for (const conflict of operation.conflicts_with) {
      invariant(operationIds.has(conflict), `operation ${id} conflicts with unknown operation ${conflict}`);
      invariant(conflict !== id, `operation ${id} conflicts with itself`);
    }

    if (operation.effect === "read" || operation.effect === "local_state") {
      invariant(operation.switches_all.length === 0, `operation ${id} cannot gate a ${operation.effect} with write switches`);
    } else if (operation.effect === "human_only") {
      invariant(operation.autonomy === "manual_only", `human-only operation ${id} must be manual_only`);
      invariant(operation.switches_all.length === 0, `human-only operation ${id} must not declare autonomous switches`);
    } else if (operation.autonomy === "autonomous") {
      invariant(operation.switches_all.length > 0, `autonomous write operation ${id} must declare switches_all`);
      invariant(operation.interference_keys.length > 0, `autonomous write operation ${id} must declare an interference key`);
    }

    const exactSwitches = EXACT_SWITCH_REQUIREMENTS[id];
    if (exactSwitches) {
      const actual = [...operation.switches_all].sort(compareAscii);
      const expected = [...exactSwitches].sort(compareAscii);
      invariant(
        actual.length === expected.length && actual.every((item, index) => item === expected[index]),
        `operation ${id} must declare exact required switch closure: ${expected.join(", ")}`,
      );
    }
  }

  const missingRequiredSwitches = REQUIRED_OPERATION_SWITCHES.filter((item) => !switchIds.has(item));
  invariant(missingRequiredSwitches.length === 0, `graph.switches is missing required switch(es): ${missingRequiredSwitches.join(", ")}`);

  const usedSkills = new Set();
  const usedSwitches = new Set();
  const usedInterference = new Set();
  const usedOperations = new Set();
  const usedStateViews = new Set();
  const reachableNodes = new Set(graph.mandatory_nodes);

  if (graph.nodes["pulse.kernel"] && graph.nodes["pulse.scheduler"] && graph.nodes["analytics.control_plane"]) {
    invariant(
      graph.mandatory_nodes.length === 1 && graph.mandatory_nodes[0] === "pulse.kernel",
      "only pulse.kernel may be mandatory; scheduler and provider control planes belong to isolated selections",
    );
  }

  for (const operation of Object.values(graph.operations)) {
    operation.skills.forEach((item) => usedSkills.add(item));
    operation.switches_all.forEach((item) => usedSwitches.add(item));
    operation.interference_keys.forEach((item) => usedInterference.add(item));
  }

  for (const [groupName, selections] of [["run type", graph.run_types], ["route", graph.routes]]) {
    for (const [id, selection] of Object.entries(selections)) {
      for (const node of selectionEntries(selection)) invariant(nodeIds.has(node), `${groupName} ${id} references unknown node ${node}`);
      for (const operation of selection.operations) {
        invariant(operationIds.has(operation), `${groupName} ${id} references unknown operation ${operation}`);
        usedOperations.add(operation);
      }
      if (groupName === "run type") {
        if (graph.operations["pulse.state.persist"]) {
          invariant(selection.operations.includes("pulse.state.persist"), `run type ${id} must own pulse.state.persist`);
        }
        for (const operation of selection.operations) {
          invariant(
            ["read", "local_state"].includes(graph.operations[operation].effect),
            `run type ${id} cannot execute ${graph.operations[operation].effect} operation ${operation}; dispatch a route executor`,
          );
        }
      } else {
        for (const operation of selection.operations) {
          invariant(
            graph.operations[operation].effect !== "local_state",
            `route ${id} cannot execute local_state operation ${operation}; return the result to the orchestrator`,
          );
        }
      }
      for (const skill of selection.skills) {
        invariant(skillIds.has(skill), `${groupName} ${id} references unknown skill ${skill}`);
        usedSkills.add(skill);
      }
      for (const stateView of selection.state_views) {
        invariant(stateViewIds.has(stateView), `${groupName} ${id} references unknown state view ${stateView}`);
        usedStateViews.add(stateView);
      }

      if (selection.allowed_origin_policy_nodes) {
        for (const origin of selection.allowed_origin_policy_nodes) {
          invariant(nodeIds.has(origin), `${groupName} ${id} allows unknown origin policy node ${origin}`);
          invariant(graph.nodes[origin].kind === "policy", `${groupName} ${id} origin ${origin} must be a policy node`);
          invariant(!graph.mandatory_nodes.includes(origin), `${groupName} ${id} origin ${origin} must not be mandatory`);
        }
      }
      if (id === "delivery.repository" && selection.allowed_origin_policy_nodes) {
        invariant(
          !selection.allowed_origin_policy_nodes.includes("delivery.repository"),
          "route delivery.repository cannot self-authorize its origin policy scope",
        );
      }

      const { orderedNodes } = resolveSelection(graph, selection);
      orderedNodes.forEach((node) => reachableNodes.add(node));
      if (groupName === "route" && !selection.requires_origin_policy_node) {
        invariant(
          orderedNodes.some((node) => graph.nodes[node].kind === "policy" && !graph.mandatory_nodes.includes(node)),
          `route ${id} must contain at least one eligible origin policy node`,
        );
      }
      if (groupName === "run type" && graph.nodes["pulse.scheduler"] && graph.nodes["analytics.control_plane"]) {
        invariant(orderedNodes.includes("pulse.scheduler"), `run type ${id} must load pulse.scheduler`);
        invariant(orderedNodes.includes("analytics.control_plane"), `run type ${id} must load analytics.control_plane`);
      }
      if (groupName === "route" && graph.operations["pulse.state.persist"]) {
        if (id !== "contract.audit" && graph.nodes["pulse.scheduler"]) {
          invariant(!orderedNodes.includes("pulse.scheduler"), `route ${id} must not load pulse.scheduler in an isolated executor`);
        }
      }
      const skillIdsForSelection = selectionSkillIds(graph, selection);
      const originVariants = selection.allowed_origin_policy_nodes ?? [null];
      for (const origin of originVariants) {
        const variantNodes = origin ? buildNodeClosure(graph, [...orderedNodes, origin]) : orderedNodes;
        variantNodes.forEach((node) => reachableNodes.add(node));
        const measurement = measureKnownContext(graph, variantNodes, skillIdsForSelection);
        invariant(
          measurement.knownTotalBytes <= selection.max_known_context_bytes,
          `${groupName} ${id}${origin ? ` with origin ${origin}` : ""} exceeds max_known_context_bytes (${measurement.knownTotalBytes} > ${selection.max_known_context_bytes})`,
        );
      }

      if (selection.operations.includes("posthog.survey.write")) {
        invariant(
          orderedNodes.includes("communications.attention") && selection.state_views.includes("attention"),
          `${groupName} ${id} must load communications.attention and the attention state view for cross-channel attention caps`,
        );
      }
      if (selection.operations.some((operation) => operation.includes("referral"))) {
        invariant(
          orderedNodes.includes("communications.attention") && selection.state_views.includes("attention"),
          `${groupName} ${id} must load communications.attention and the attention state view for cross-channel attention caps`,
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
  for (const id of Object.keys(graph.nodes)) invariant(reachableNodes.has(id), `policy node is unreachable from every route/run type: ${id}`);
  for (const id of skillIds) invariant(usedSkills.has(id), `declared skill is unused: ${id}`);
  for (const id of switchIds) invariant(usedSwitches.has(id), `declared switch is unused: ${id}`);
  for (const id of interferenceIds) invariant(usedInterference.has(id), `declared interference key is unused: ${id}`);
  for (const id of stateViewIds) invariant(usedStateViews.has(id), `declared state view is unused: ${id}`);

  for (const [id, skill] of Object.entries(graph.skills)) {
    if (skill.source === "repository") invariant(graph.__files.skills[id], `repository skill ${id} was not loaded`);
  }
}

function loadAndHashFiles(graph, graphPath, { verifyHashes }) {
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
  validateCrossReferences(graph, repositoryRoot);

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

export function resolveGraph(graph, options = {}) {
  const runId = options.run;
  const routeId = options.route;
  const explicitNodes = options.nodes ?? [];
  invariant(Boolean(runId) !== Boolean(routeId), "resolve requires exactly one isolated selector: --run or --route");
  invariant(!(runId && routeId), "resolve isolates orchestration and execution: use either --run or --route, never both");
  invariant(!(runId && explicitNodes.length > 0), "run resolution does not accept --node; dispatch policy work through an isolated route executor");
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
  const switches = [...new Set(combined.operations.flatMap((id) => graph.operations[id].switches_all))].sort(compareAscii);
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
    switches_all: switches,
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

export function lockGraph(graphPath = DEFAULT_GRAPH_PATH) {
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

function parseCliArguments(argv) {
  const [command, ...args] = argv;
  invariant(["benchmark", "check", "resolve", "lock"].includes(command), "usage: validate-graph.mjs <benchmark|check|resolve|lock> [options]");
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
