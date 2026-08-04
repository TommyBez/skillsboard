import * as esbuild from "esbuild"
import { readFile } from "node:fs/promises"

/**
 * Transpile a TypeScript source file for node:test without the TypeScript
 * JavaScript API, which is unavailable in TypeScript 7 (native `tsc` only).
 */
export async function transpileTsFile(
  fileUrl,
  { stripServerOnly = false, replaceImports = {} } = {},
) {
  let source = await readFile(fileUrl, "utf8")
  if (stripServerOnly) {
    source = source.replace(/import\s+["']server-only["'];?\r?\n?/g, "")
  }
  for (const [from, to] of Object.entries(replaceImports)) {
    source = source.replaceAll(from, to)
  }
  const { code } = await esbuild.transform(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
  })
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
}

export async function importTsFile(fileUrl, options) {
  return import(await transpileTsFile(fileUrl, options))
}
