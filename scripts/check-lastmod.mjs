/**
 * Lists, for every page in the registry, the commits that touched its source
 * files after the `modifiedAt` it declares. The sitemap `<lastmod>`, the
 * JSON-LD `dateModified` and the Open Graph `modifiedTime` all read that date,
 * and a search engine only trusts `<lastmod>` while it stays accurate.
 *
 * Run it before merging a content change: `pnpm seo:lastmod`. A listed commit
 * is not necessarily a reason to move the date. Bump `modifiedAt` for a
 * change to what the page says (title, description, headings, body copy,
 * FAQs, structured data), and leave it for refactors, typo sweeps, analytics
 * tags and styling.
 *
 * Informational only: it always exits 0, and it prints a warning and stops
 * when the history is shallow or missing, since a shallow clone would make
 * every page look untouched.
 */
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { register } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  commitsAfter,
  gitLogArgs,
  parseGitLog,
  sourcesFor,
} from "./lastmod-sources.mjs"

const root = fileURLToPath(new URL("../", import.meta.url))

function git(args) {
  return spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, TZ: "UTC" },
    maxBuffer: 64 * 1024 * 1024,
  })
}

const shallow = git(["rev-parse", "--is-shallow-repository"])
if (shallow.status !== 0) {
  console.warn("check-lastmod: not a git checkout, nothing to compare. Skipping.")
  process.exit(0)
}
if (shallow.stdout.trim() === "true") {
  console.warn(
    "check-lastmod: the git history is shallow, so commit dates are incomplete. " +
      "Run `git fetch --unshallow` and try again. Skipping.",
  )
  process.exit(0)
}

register(new URL("../tests/helpers/app-alias-hooks.mjs", import.meta.url))
const { publicPages } = await import("../lib/site/pages.ts")

const exists = (relative) => existsSync(path.join(root, relative))

/** The files directly in a route folder, not the pages nested below it. */
function routeFiles(folder) {
  const full = path.join(root, folder)
  return readdirSync(full)
    .filter((name) => statSync(path.join(full, name)).isFile())
    .map((name) => `${folder}/${name}`)
}

let stale = 0
for (const page of publicPages) {
  const { route, content } = sourcesFor(page.path, exists)
  const specs = [...(route ? routeFiles(route) : []), ...content]
  if (specs.length === 0) {
    console.log(
      `${page.path}: no source files found, see scripts/lastmod-sources.mjs`,
    )
    continue
  }

  const pathspecs = specs.map((spec) => `:(literal)${spec}`)
  const log = git([...gitLogArgs, "--", ...pathspecs])
  if (log.status !== 0) {
    console.warn(
      `check-lastmod: git log failed for ${page.path}: ${log.stderr.trim()}`,
    )
    continue
  }

  const later = commitsAfter(parseGitLog(log.stdout), page.modifiedAt)
  if (later.length === 0) continue

  stale += 1
  console.log(`\n${page.path}  modifiedAt ${page.modifiedAt}`)
  for (const commit of later) {
    console.log(`  ${commit.date} ${commit.sha.slice(0, 7)} ${commit.subject}`)
    for (const file of commit.files) {
      if (specs.some((spec) => file === spec || file.startsWith(`${spec}/`))) {
        console.log(`      ${file}`)
      }
    }
  }
}

console.log(
  `\n${stale} of ${publicPages.length} pages have commits after their modifiedAt. ` +
    "Bump modifiedAt only where the change is to what the page says.",
)
