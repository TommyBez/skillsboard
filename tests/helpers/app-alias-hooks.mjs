import { readFile } from "node:fs/promises"
import { statSync } from "node:fs"
import { stripTypeScriptTypes } from "node:module"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const rootDir = fileURLToPath(new URL("../../", import.meta.url))

function firstExistingFile(candidates) {
  for (const candidate of candidates) {
    try {
      if (statSync(candidate).isFile()) return candidate
    } catch {
      // Try the next candidate.
    }
  }
  return undefined
}

/** Resolves the `@/` alias from tsconfig, so a test can import app modules. */
export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(rootDir, specifier.slice(2))
    const match = firstExistingFile([
      base,
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, "index.ts"),
    ])
    if (match) return nextResolve(pathToFileURL(match).href, context)
  }
  return nextResolve(specifier, context)
}

/** Strips types here rather than relying on the Node version doing it. */
export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const source = await readFile(fileURLToPath(url), "utf8")
    return {
      format: "module",
      shortCircuit: true,
      source: stripTypeScriptTypes(source, { mode: "transform", sourceUrl: url }),
    }
  }
  return nextLoad(url, context)
}
