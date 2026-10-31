import { realpathSync } from "node:fs"
import { fileURLToPath } from "node:url"

// Checks that a pull request body has a `## Demo video` section that links a
// video. In CI the body is read from the GitHub API at run time (PR_NUMBER);
// locally it comes from the PR_BODY environment variable. Either way the
// untrusted text never passes through a shell script.

export const SECTION_HEADING = /^##[ \t]+demo video[ \t]*#*[ \t]*$/i
export const NEXT_SECTION_HEADING = /^#{1,2}[ \t]/
export const VIDEO_EXTENSION = /\.(mp4|webm|mov)$/i
export const MEDIA_REPOSITORY = "TommyBez/skillsboard"
export const MEDIA_RELEASE_TAG = "pr-media"
// Only this repository's pr-media prerelease, see scripts/pr-demo-video.mjs.
// Tags are case-sensitive, so the path is matched exactly.
const MEDIA_RELEASE_PATH = new RegExp(
  `^/${MEDIA_REPOSITORY}/releases/download/${MEDIA_RELEASE_TAG}/[^/]+$`,
)
// Hosts such as github.com.evil.example that only pretend to be GitHub.
const GITHUB_LOOKALIKE_HOST = /(^|\.)github\.com\./i
const URL_CANDIDATE = /https:\/\/[^\s<>()[\]"'`]+/gi

export function findDemoVideoSection(body) {
  // HTML comments hold the template's guidance, so their contents never count.
  const lines = String(body ?? "")
    .replace(/<!--[\s\S]*?(-->|$)/g, "")
    .split(/\r?\n/)
  const start = lines.findIndex((line) => SECTION_HEADING.test(line.trim()))
  if (start === -1) return null

  const section = []
  for (const line of lines.slice(start + 1)) {
    if (NEXT_SECTION_HEADING.test(line.trimStart())) break
    section.push(line)
  }
  return section.join("\n")
}

export function isVideoUrl(candidate) {
  let url
  try {
    url = new URL(candidate)
  } catch {
    return false
  }
  if (url.protocol !== "https:") return false
  if (url.hostname === "github.com") {
    // On github.com only uploads and the pr-media prerelease count; other
    // releases, tags and repositories do not.
    return (
      /^\/user-attachments\/assets\/[^/]+/.test(url.pathname) ||
      (MEDIA_RELEASE_PATH.test(url.pathname) &&
        VIDEO_EXTENSION.test(url.pathname))
    )
  }
  if (GITHUB_LOOKALIKE_HOST.test(url.hostname)) return false
  return VIDEO_EXTENSION.test(url.pathname)
}

export function findDemoVideoLinks(section) {
  return (section.match(URL_CANDIDATE) ?? [])
    .map((candidate) => candidate.replace(/[.,;:!?]+$/, ""))
    .filter(isVideoUrl)
}

export function checkDemoVideo(body) {
  const section = findDemoVideoSection(body)
  if (section === null) {
    return { ok: false, reason: "missing-section", links: [] }
  }
  const links = findDemoVideoLinks(section)
  if (links.length === 0) {
    return { ok: false, reason: "missing-link", links }
  }
  return { ok: true, reason: null, links }
}

const HOW_TO_FIX = [
  "Add a hosted demo video link under the `## Demo video` heading of the PR description, before the next `## ` heading.",
  "Accepted links:",
  "  - an https URL ending in .mp4, .webm or .mov (a query string is fine)",
  "  - a GitHub upload: https://github.com/user-attachments/assets/...",
  "    (drag the video file into the PR description editor to get one)",
  `  - a pr-media asset: https://github.com/${MEDIA_REPOSITORY}/releases/download/${MEDIA_RELEASE_TAG}/<file>.webm`,
  "    (run `pnpm pr:video <pr-number> <file>` to upload and link one)",
  "Links inside <!-- HTML comments --> are ignored.",
].join("\n")

export function formatResult(result) {
  if (result.ok) {
    return `Demo video found: ${result.links.join(", ")}`
  }
  const problem =
    result.reason === "missing-section"
      ? "The PR description has no `## Demo video` section."
      : "The `## Demo video` section does not contain a video link."
  return `${problem}\n\n${HOW_TO_FIX}`
}

// True when the module at `moduleUrl` is the script node was started with.
// Both sides go through realpath: on macOS /tmp is a symlink to /private/tmp,
// so a plain URL comparison fails and the script would exit silently.
export function isEntryPoint(moduleUrl, scriptPath = process.argv[1]) {
  if (!scriptPath) return false
  try {
    return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(scriptPath)
  } catch {
    return false
  }
}

// The pull_request event payload is a snapshot taken when the event fired, so
// a run for a push made before the description was updated (or a re-run of
// that job) would keep checking the old text. With PR_NUMBER set, read the
// description as it is now.
export async function readPullRequestBody(env = process.env, fetchImpl = fetch) {
  if (!env.PR_NUMBER) return env.PR_BODY
  if (!/^[1-9]\d*$/.test(env.PR_NUMBER)) {
    throw new Error(`PR_NUMBER must be a positive integer, got "${env.PR_NUMBER}".`)
  }
  const repository = env.GITHUB_REPOSITORY ?? MEDIA_REPOSITORY
  if (!/^[\w-][\w.-]*\/[\w-][\w.-]*$/.test(repository)) {
    throw new Error(`Unexpected repository "${repository}".`)
  }
  const api = env.GITHUB_API_URL ?? "https://api.github.com"
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`
  const response = await fetchImpl(
    `${api}/repos/${repository}/pulls/${env.PR_NUMBER}`,
    { headers },
  )
  if (!response.ok) {
    throw new Error(
      `Could not read the description of PR #${env.PR_NUMBER}: HTTP ${response.status}.`,
    )
  }
  const pullRequest = await response.json()
  return pullRequest.body ?? ""
}

async function main() {
  let body
  try {
    body = await readPullRequestBody()
  } catch (error) {
    console.log(`::error title=Demo video check could not run::${error.message}`)
    process.exitCode = 1
    return
  }
  const result = checkDemoVideo(body)
  if (result.ok) {
    console.log(formatResult(result))
  } else {
    const [problem, ...rest] = formatResult(result).split("\n")
    // `::error::` makes GitHub show the problem as an annotation on the run.
    console.log(`::error title=Demo video missing::${problem}`)
    console.log(rest.join("\n"))
    process.exitCode = 1
  }
}

if (isEntryPoint(import.meta.url)) await main()
