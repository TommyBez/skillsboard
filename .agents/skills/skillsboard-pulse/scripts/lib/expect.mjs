import { isAbsolute } from "node:path";

import { ID_PATTERN, JSON_POINTER_PATTERN, SET_ARRAY_KEYS, SHA256_PATTERN } from "./constants.mjs";
import { invariant } from "./errors.mjs";

export function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function expectRecord(value, label) {
  invariant(isRecord(value), `${label} must be an object`);
  return value;
}

export function expectExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  invariant(unknown.length === 0, `${label} has unknown field(s): ${unknown.join(", ")}`);
}

export function expectId(value, label) {
  invariant(typeof value === "string" && ID_PATTERN.test(value), `${label} must be a lower-case graph id`);
  return value;
}

export function compareAscii(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function expectStringArray(value, label, { sorted = true, id = false } = {}) {
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

export function expectPositiveInteger(value, label) {
  invariant(Number.isSafeInteger(value) && value > 0, `${label} must be a positive safe integer`);
  return value;
}

export function expectSha(value, label, allowStaleHashes) {
  invariant(typeof value === "string", `${label} must be a string`);
  if (!allowStaleHashes) {
    invariant(SHA256_PATTERN.test(value), `${label} must be a lower-case SHA-256 hex digest`);
  }
}

export function expectJsonPointer(value, label) {
  invariant(
    typeof value === "string" && JSON_POINTER_PATTERN.test(value),
    `${label} must be a non-root RFC 6901 JSON pointer`,
  );
}

export function expectRelativePath(value, label) {
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

export function expectBoolean(value, label) {
  invariant(typeof value === "boolean", `${label} must be boolean`);
  return value;
}

export function deepSort(value, parentKey = "") {
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

export function canonicalJson(value) {
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
