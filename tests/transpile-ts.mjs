import { transformSync } from "esbuild"

/**
 * Strip TypeScript for Node's test runner. TypeScript 7 no longer ships a JS
 * transpile API, and Node's `stripTypeScriptTypes` is Node 22+ — CI still runs
 * Node 20 — so esbuild is the portable path that works on both.
 */
export function transpileTs(source) {
  return transformSync(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
  }).code
}

export function transpileTsToDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(transpileTs(source)).toString("base64")}`
}
