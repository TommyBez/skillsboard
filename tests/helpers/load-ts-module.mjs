import { readFile } from "node:fs/promises"
import { stripTypeScriptTypes } from "node:module"

const repoRoot = new URL("../../", import.meta.url)

/**
 * A data URL cannot resolve the "@/" alias, so a module that imports another
 * source file has to carry that dependency inline. Every alias import is
 * loaded, transformed, and rewritten to the dependency's data URL, cached by
 * path so a module two importers share stays a single instance.
 */
const dataUrls = new Map()

const aliasImport = /from\s*"@\/([^"]+)"/g

async function resolveAlias(specifier) {
  for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
    const url = new URL(candidate, repoRoot)

    try {
      await readFile(url)
      return url
    } catch {
      // Not this candidate, try the next one.
    }
  }

  throw new Error(`Cannot resolve @/${specifier} to a .ts file`)
}

async function toDataUrl(url, pending) {
  const key = url.href
  const cached = dataUrls.get(key)

  if (cached) {
    return cached
  }

  if (pending.includes(key)) {
    throw new Error(`Import cycle through ${key} cannot be inlined`)
  }

  const source = await readFile(url, "utf8")
  let output = stripTypeScriptTypes(source, { mode: "transform" })

  for (const [match, specifier] of [...output.matchAll(aliasImport)]) {
    const dependency = await toDataUrl(await resolveAlias(specifier), [
      ...pending,
      key,
    ])

    output = output.replace(match, `from "${dependency}"`)
  }

  const dataUrl = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  dataUrls.set(key, dataUrl)

  return dataUrl
}

export async function loadTsModule(url) {
  return import(await toDataUrl(url, []))
}
