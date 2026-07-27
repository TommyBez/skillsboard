import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import { GraphValidationError, invariant } from "./errors.mjs";
import { expectRelativePath } from "./expect.mjs";

export function findRepositoryRoot(startPath) {
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

export function resolveSafeFile(rootPath, relativePath, label) {
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

export function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function readContractFile(path, label) {
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
