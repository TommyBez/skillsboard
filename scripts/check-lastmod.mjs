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
 * The markup pages keep their title, description and dates in their entry in
 * `lib/site/page-index.ts`, so each page's own entry there is tracked too,
 * line range by line range, and an edit to one entry flags only that page.
 *
 * Informational: it exits 0 whatever it lists, and it prints a warning and
 * stops when the history is shallow or missing, since a shallow clone would
 * make every page look untouched. It exits 1 when `git log` fails for a page
 * in a full history, listing those pages instead of a summary that would
 * count them as checked.
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
  REGISTRY,
  registryEntryLines,
  registryLogArgs,
  sourcesFor,
  summarize,
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

/** `-L` ranges refer to the committed file, so read that rather than the disk. */
const registrySource = git(["show", `HEAD:${REGISTRY}`])

let stale = 0
const failures = []
for (const page of publicPages) {
  const { route, content } = sourcesFor(page.path, exists)
  const specs = [...(route ? routeFiles(route) : []), ...content]
  const entry =
    registrySource.status === 0
      ? registryEntryLines(registrySource.stdout, page.path)
      : undefined
  if (specs.length === 0 && !entry) {
    console.log(
      `${page.path}: no source files found, see scripts/lastmod-sources.mjs`,
    )
    continue
  }

  const commits = []
  let error
  if (specs.length > 0) {
    const pathspecs = specs.map((spec) => `:(literal)${spec}`)
    const log = git([...gitLogArgs, "--", ...pathspecs])
    if (log.status === 0) commits.push(...parseGitLog(log.stdout))
    else error = log.stderr.trim() || `git log exited ${log.status}`
  }
  if (entry && !error) {
    const log = git(registryLogArgs(entry))
    if (log.status === 0) {
      for (const commit of parseGitLog(log.stdout)) {
        const known = commits.find((other) => other.sha === commit.sha)
        if (known) known.files.push(REGISTRY)
        else commits.push({ ...commit, files: [REGISTRY] })
      }
    } else {
      error = log.stderr.trim() || `git log exited ${log.status}`
    }
  }
  if (error) {
    console.warn(`check-lastmod: git log failed for ${page.path}: ${error}`)
    failures.push({ path: page.path, error })
    continue
  }

  commits.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  const later = commitsAfter(commits, page.modifiedAt)
  if (later.length === 0) continue

  stale += 1
  console.log(`\n${page.path}  modifiedAt ${page.modifiedAt}`)
  for (const commit of later) {
    console.log(`  ${commit.date} ${commit.sha.slice(0, 7)} ${commit.subject}`)
    for (const file of commit.files) {
      const tracked =
        file === REGISTRY ||
        specs.some((spec) => file === spec || file.startsWith(`${spec}/`))
      if (tracked) {
        console.log(`      ${file}`)
      }
    }
  }
}

const summary = summarize({ stale, total: publicPages.length, failures })
for (const line of summary.lines) {
  if (summary.exitCode === 0) console.log(line)
  else console.error(line)
}
process.exitCode = summary.exitCode
