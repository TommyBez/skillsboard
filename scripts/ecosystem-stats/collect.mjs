#!/usr/bin/env node
/**
 * Collects the monthly ecosystem snapshot behind /agent-skills-by-the-numbers.
 *
 * Three groups of numbers, three sources, three different precisions:
 *
 * 1. GitHub repository search, one call per topic. `total_count` on the
 *    repository search endpoint is exact.
 * 2. GitHub code search for the install command in public READMEs, next to the
 *    npm download count of the same CLI. Code search counts matching files
 *    rather than repositories, and it quantizes `total_count` into buckets, so
 *    that figure is approximate and the snapshot records it.
 * 3. The npm downloads range endpoint for the `skills` package, aggregated by
 *    calendar month.
 *
 * Usage: GITHUB_TOKEN=... node scripts/ecosystem-stats/collect.mjs
 *
 * The token is read from the environment only. Code search is rate limited to
 * ten requests a minute, so the script spaces its GitHub calls out.
 *
 * Either GitHub search can come back with `incomplete_results: true`, which
 * means the query timed out and the total is a partial one. The script refuses
 * to write a snapshot in that case rather than publishing a low number.
 */

import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const dataDir = join(
  repoRoot,
  "lib",
  "seo",
  "agent-skills-by-the-numbers",
  "data",
)

const TOPICS = ["agent-skills", "claude-skills", "claude-code-skills"]
const CODE_SEARCH_QUERY = '"npx skills" filename:README.md'
const NPM_PACKAGE = "skills"
const RANGE_START = "2026-01-01"
const GITHUB_CALL_SPACING_MS = 7000

function requireToken() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not set. Export a token with public repository read access and run again.",
    )
  }
  return token
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`)
  }
  return response.json()
}

async function githubSearch(path, token) {
  return getJson(`https://api.github.com${path}`, {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "skillsboard-ecosystem-stats",
    "X-GitHub-Api-Version": "2022-11-28",
  })
}

/**
 * GitHub sets `incomplete_results` when the search timed out, and the
 * `total_count` beside it is then a partial figure that would understate the
 * ecosystem. A snapshot built on one of those is worse than no snapshot, so
 * this throws and the run ends before anything is written.
 */
export function assertCompleteSearch(result, label) {
  if (result.incomplete_results) {
    throw new Error(
      `GitHub returned incomplete_results for ${label}, so total_count is partial. No snapshot was written. Run the script again.`,
    )
  }
  return result
}

async function collectRepositoryTopics(token) {
  const topics = []
  for (const topic of TOPICS) {
    const result = await githubSearch(
      `/search/repositories?q=topic:${encodeURIComponent(topic)}&per_page=1`,
      token,
    )
    assertCompleteSearch(result, `topic:${topic} repository search`)
    topics.push({ topic, repositories: result.total_count })
    await sleep(GITHUB_CALL_SPACING_MS)
  }
  return topics
}

async function collectDeclaredUsage(token) {
  const code = await githubSearch(
    `/search/code?q=${encodeURIComponent(CODE_SEARCH_QUERY)}&per_page=1`,
    token,
  )
  assertCompleteSearch(code, `code search for ${CODE_SEARCH_QUERY}`)

  const point = await getJson(
    `https://api.npmjs.org/downloads/point/last-month/${NPM_PACKAGE}`,
  )

  return {
    query: CODE_SEARCH_QUERY,
    readmeMatches: code.total_count,
    readmeMatchPrecision: "bucketed",
    npmPackage: NPM_PACKAGE,
    npmDownloadsLastMonth: point.downloads,
    npmWindowStart: point.start,
    npmWindowEnd: point.end,
    downloadsPerMatchingReadme: Math.round(point.downloads / code.total_count),
  }
}

async function collectMonthlyDownloads(today) {
  const range = await getJson(
    `https://api.npmjs.org/downloads/range/${RANGE_START}:${today}/${NPM_PACKAGE}`,
  )

  const totals = new Map()
  for (const day of range.downloads) {
    const month = day.day.slice(0, 7)
    totals.set(month, (totals.get(month) ?? 0) + day.downloads)
  }

  const currentMonth = today.slice(0, 7)

  return {
    package: NPM_PACKAGE,
    rangeStart: range.start,
    rangeEnd: range.end,
    months: [...totals.entries()].map(([month, downloads]) => ({
      month,
      downloads,
      partial: month === currentMonth,
    })),
  }
}

export async function main() {
  const token = requireToken()
  const collectedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
  const today = collectedAt.slice(0, 10)
  const snapshot = today.slice(0, 7)

  const repositoryTopics = await collectRepositoryTopics(token)
  const declaredUsage = await collectDeclaredUsage(token)
  const monthlyDownloads = await collectMonthlyDownloads(today)

  const payload = {
    snapshot,
    collectedAt,
    repositoryTopics,
    declaredUsage,
    monthlyDownloads,
    notes: [
      "GitHub repository search reports an exact total_count, so the topic figures are counts rather than estimates.",
      "GitHub code search quantizes total_count into buckets of roughly four significant figures, so the README figure is approximate and the page says so.",
      "A README match is one public README file that prints the install command. Code search counts files, so a repository holding several matching READMEs is counted once for each of them, and the number of distinct projects is lower than or equal to the total.",
      "A README match is not a running installation, and a repository can print the command without anyone running it.",
      "npm counts every download of the package, including continuous integration jobs, mirrors, and bots, so a download is not a person.",
    ],
  }

  await mkdir(dataDir, { recursive: true })
  const file = join(dataDir, `${snapshot}.json`)
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`)

  process.stdout.write(`Wrote ${file}\n`)
  for (const topic of repositoryTopics) {
    process.stdout.write(`  topic:${topic.topic} ${topic.repositories}\n`)
  }
  process.stdout.write(
    `  READMEs with the install command ${declaredUsage.readmeMatches}, downloads last month ${declaredUsage.npmDownloadsLastMonth}\n`,
  )
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  await main()
}
