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

function resolveToFile(base, context, nextResolve) {
  const match = firstExistingFile([
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
  ])
  return match ? nextResolve(pathToFileURL(match).href, context) : undefined
}

/**
 * Resolves the `@/` alias from tsconfig, so a test can import app modules, and
 * the extensionless relative specifiers a TypeScript file is written with.
 *
 * Node's ESM resolver wants the extension. Bundlers, `tsc`, and the CommonJS
 * loader Next.js compiles `next.config.ts` through all supply it, and
 * `next.config.ts` reaches `lib/site/page-index` relatively rather than through
 * the alias, because a config resolves an aliased specifier against the project
 * root. This makes the test runner agree with all of them.
 */
export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = resolveToFile(
      path.join(rootDir, specifier.slice(2)),
      context,
      nextResolve,
    )
    if (resolved) return resolved
  }

  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const from = path.dirname(fileURLToPath(context.parentURL))
    const resolved = resolveToFile(
      path.resolve(from, specifier),
      context,
      nextResolve,
    )
    if (resolved) return resolved
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
