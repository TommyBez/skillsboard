#!/usr/bin/env node
/**
 * Bundle a TSX entry with the esbuild remotion already depends on, then run it.
 * Used by ops scripts that have to import React Email components.
 */

import { createRequire } from "node:module"
import { rm } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const require = createRequire(import.meta.url)
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("remotion")] }))
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

export async function loadTsxModule(entry) {
  // Keep the bundle inside the repo so Node can resolve `packages: "external"`
  // from the project node_modules. A tmpdir file cannot see `react-email`.
  const outfile = join(repoRoot, "scripts", ".tsx-run.mjs")
  try {
    await esbuild.build({
      absWorkingDir: repoRoot,
      alias: { "@": repoRoot },
      banner: {
        js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
      },
      bundle: true,
      entryPoints: [resolve(repoRoot, entry)],
      format: "esm",
      jsx: "automatic",
      outfile,
      packages: "external",
      platform: "node",
      sourcemap: "inline",
      target: "node22",
    })
    return await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)
  } finally {
    await rm(outfile, { force: true })
  }
}

const entry = process.argv[2]
if (entry && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const loaded = await loadTsxModule(entry)
  if (typeof loaded.default === "function") {
    await loaded.default(process.argv.slice(3))
  }
}
