import { readFile } from "node:fs/promises"

import { transform } from "esbuild"

/**
 * Type-strips a `lib/*.ts` module and returns it as an importable data URL.
 *
 * TypeScript 7 is a native binary and no longer ships `transpileModule` from
 * the `typescript` package entry, so the unit tests transpile with esbuild
 * instead. Type checking still happens in `pnpm typecheck`; this only needs to
 * erase types.
 *
 * @param {string} path Module path relative to this file.
 * @param {(source: string) => string} [rewriteSource] Optional source rewrite
 *   applied before transpiling, e.g. to drop a `server-only` import or to point
 *   an internal import at another already-transpiled module.
 */
export async function tsModuleUrl(path, rewriteSource) {
  const raw = await readFile(new URL(path, import.meta.url), "utf8")
  const source = rewriteSource ? rewriteSource(raw) : raw
  const { code } = await transform(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
  })

  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
}

/** Type-strips a `lib/*.ts` module and imports it as ESM. */
export async function loadTsModule(path, rewriteSource) {
  return import(await tsModuleUrl(path, rewriteSource))
}
