import { pathToFileURL } from "node:url"

// Checks that a pull request body has a `## Demo video` section that links a
// video. The body arrives through the PR_BODY environment variable so the
// workflow never interpolates untrusted text into a shell script.

const SECTION_HEADING = /^##[ \t]+demo video[ \t]*#*[ \t]*$/i
const NEXT_SECTION_HEADING = /^#{1,2}[ \t]/
const VIDEO_EXTENSION = /\.(mp4|webm|mov)$/i
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
  if (VIDEO_EXTENSION.test(url.pathname)) return true
  return (
    url.hostname === "github.com" &&
    /^\/user-attachments\/assets\/[^/]+/.test(url.pathname)
  )
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const result = checkDemoVideo(process.env.PR_BODY)
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
