#!/usr/bin/env node
// Reports per-route client JS (raw and gzip) from a completed `next build`
// by reading the script tags in each prerendered HTML document.
// Usage: node scripts/measure-bundles.mjs [--json]

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { gzipSync } from "node:zlib"

const distDir = join(process.cwd(), ".next")
const appDir = join(distDir, "server", "app")

function collectHtmlFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...collectHtmlFiles(path))
    else if (entry.name.endsWith(".html")) found.push(path)
  }
  return found
}

const sizeCache = new Map()
function chunkSizes(file) {
  let cached = sizeCache.get(file)
  if (!cached) {
    const path = join(distDir, file)
    let raw = 0
    let gzip = 0
    try {
      raw = statSync(path).size
      gzip = gzipSync(readFileSync(path), { level: 9 }).length
    } catch {
      // Chunk referenced but not on disk (e.g. external); count as zero.
    }
    cached = { raw, gzip }
    sizeCache.set(file, cached)
  }
  return cached
}

const SCRIPT_SRC = /<script[^>]+src="\/_next\/([^"]+\.js)[^"]*"/g

const routes = {}
for (const htmlPath of collectHtmlFiles(appDir)) {
  const route = `/${relative(appDir, htmlPath).split(sep).join("/").replace(/\.html$/, "")}`
  const html = readFileSync(htmlPath, "utf8")
  const files = new Set()
  for (const match of html.matchAll(SCRIPT_SRC)) files.add(match[1])

  let raw = 0
  let gzip = 0
  for (const file of files) {
    const sizes = chunkSizes(file)
    raw += sizes.raw
    gzip += sizes.gzip
  }
  routes[route] = { raw, gzip, chunks: files.size }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(routes, null, 2)}\n`)
} else {
  const entries = Object.entries(routes).sort((a, b) => b[1].gzip - a[1].gzip)
  const width = Math.max(...entries.map(([page]) => page.length)) + 2
  process.stdout.write(`${"Route".padEnd(width)}${"JS (raw)".padStart(12)}${"JS (gzip)".padStart(12)}${"Chunks".padStart(9)}\n`)
  for (const [page, { raw, gzip, chunks }] of entries) {
    process.stdout.write(`${page.padEnd(width)}${kb(raw).padStart(12)}${kb(gzip).padStart(12)}${String(chunks).padStart(9)}\n`)
  }
}
