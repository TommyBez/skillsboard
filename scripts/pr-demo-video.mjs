import { spawnSync } from "node:child_process"
import { copyFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { basename, join } from "node:path"

import {
  MEDIA_RELEASE_TAG,
  MEDIA_REPOSITORY,
  NEXT_SECTION_HEADING,
  SECTION_HEADING,
  VIDEO_EXTENSION,
  checkDemoVideo,
  isEntryPoint,
} from "./check-pr-demo-video.mjs"

// Usage: pnpm pr:video [--dry-run] <pr-number> <file>
//
// Uploads a local demo recording to the `pr-media` prerelease (a container for
// PR videos, never a real release) and links it from the PR description's
// `## Demo video` section. Every step goes through the authenticated `gh` CLI.
// --dry-run only reads: it prints the asset name and URL it would use and
// stops before creating, uploading or editing anything.
//
// Open the PR as a draft (the check skips drafts), run this, then mark the PR
// ready: ready_for_review runs the check against the linked video.

const RELEASE_NOTES = "Container for PR demo videos, not a release"
const PENDING_LINE = /^[ \t]*pending upload\b/i
const ASSET_BASENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const USAGE = "Usage: pnpm pr:video [--dry-run] <pr-number> <file>"

export function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run")
  const [prArgument, file, ...rest] = argv.filter((argument) => argument !== "--dry-run")
  if (!prArgument || !file || rest.length > 0) {
    throw new Error(USAGE)
  }
  if (!/^[1-9]\d*$/.test(prArgument)) {
    throw new Error(`PR number must be a positive integer, got "${prArgument}".`)
  }
  if (!VIDEO_EXTENSION.test(file)) {
    throw new Error(`The video must be a .mp4, .webm or .mov file, got "${file}".`)
  }
  return { pr: Number(prArgument), file, dryRun }
}

export function assetNameFor(pr, headSha, file) {
  const name = basename(file)
  // GitHub rewrites unusual characters in asset names, which would break the
  // predictable `pr-<n>-<shortsha>-<basename>` URL.
  if (!ASSET_BASENAME.test(name)) {
    throw new Error(
      `Rename the file so its name only uses letters, digits, ".", "_" and "-": "${name}".`,
    )
  }
  if (!/^[0-9a-f]{7,40}$/i.test(headSha)) {
    throw new Error(`Unexpected head commit SHA "${headSha}".`)
  }
  return `pr-${pr}-${headSha.slice(0, 7).toLowerCase()}-${name}`
}

export function assetUrlFor(assetName) {
  return `https://github.com/${MEDIA_REPOSITORY}/releases/download/${MEDIA_RELEASE_TAG}/${assetName}`
}

// Returns the body with the `## Demo video` section pointing at `url`. Only
// that section changes: its "Pending upload ..." line is replaced, otherwise
// the URL is added at the end of the section, and a missing section is
// appended to the end of the body. Line endings are preserved.
export function linkDemoVideo(body, url) {
  const original = String(body ?? "")
  if (original.includes(url)) return { body: original, action: "unchanged" }

  // Blank out HTML comments (keeping newlines) so headings and pending notes
  // inside them are ignored, while edits still apply to the original lines.
  const masked = original.replace(/<!--[\s\S]*?(-->|$)/g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  )
  const lines = original.split("\n")
  const maskedLines = masked.split("\n")
  const eol = original.includes("\r\n") ? "\r\n" : "\n"
  const cr = eol === "\r\n" ? "\r" : ""

  const start = maskedLines.findIndex((line) => SECTION_HEADING.test(line.trim()))
  if (start === -1) {
    const trimmed = original.replace(/\s+$/, "")
    const prefix = trimmed === "" ? "" : `${trimmed}${eol}${eol}`
    return {
      body: `${prefix}## Demo video${eol}${eol}${url}${eol}`,
      action: "appended-section",
    }
  }

  let end = maskedLines.length
  for (let index = start + 1; index < maskedLines.length; index++) {
    if (NEXT_SECTION_HEADING.test(maskedLines[index].trimStart())) {
      end = index
      break
    }
  }

  for (let index = start + 1; index < end; index++) {
    if (PENDING_LINE.test(maskedLines[index])) {
      const lineCr = lines[index].endsWith("\r") ? "\r" : ""
      lines[index] = `${url}${lineCr}`
      return { body: lines.join("\n"), action: "replaced-pending" }
    }
  }

  let last = start
  for (let index = start + 1; index < end; index++) {
    if (lines[index].trim() !== "") last = index
  }
  lines.splice(last + 1, 0, cr, `${url}${cr}`)
  return { body: lines.join("\n"), action: "added-link" }
}

function gh(args, { allowFailure = false } = {}) {
  const result = spawnSync("gh", args, { encoding: "utf8" })
  if (result.error) throw result.error
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`gh ${args.join(" ")} failed:\n${result.stderr.trim()}`)
  }
  return result
}

function viewRelease() {
  const result = gh(
    [
      "release", "view", MEDIA_RELEASE_TAG,
      "--repo", MEDIA_REPOSITORY,
      "--json", "tagName,isPrerelease,assets",
    ],
    { allowFailure: true },
  )
  if (result.status === 0) return JSON.parse(result.stdout)
  if (/release not found/i.test(result.stderr)) return null
  throw new Error(`Could not read the ${MEDIA_RELEASE_TAG} release:\n${result.stderr.trim()}`)
}

function ensureRelease() {
  const existing = viewRelease()
  if (existing) {
    if (!existing.isPrerelease) {
      throw new Error(
        `The ${MEDIA_RELEASE_TAG} release exists but is not a prerelease; fix it by hand before uploading.`,
      )
    }
    return existing
  }
  console.log(`Creating the ${MEDIA_RELEASE_TAG} prerelease`)
  gh([
    "release", "create", MEDIA_RELEASE_TAG,
    "--repo", MEDIA_REPOSITORY,
    "--prerelease",
    "--latest=false",
    "--title", MEDIA_RELEASE_TAG,
    "--notes", RELEASE_NOTES,
  ])
  return viewRelease()
}

async function assertReachable(url) {
  let status
  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await fetch(url, { method: "HEAD", redirect: "manual" })
    status = response.status
    if (status === 200 || status === 302) return status
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
  }
  throw new Error(`${url} answered ${status}, expected 200 or 302.`)
}

async function main(argv) {
  const { pr, file, dryRun } = parseArgs(argv)
  if (!existsSync(file)) throw new Error(`File not found: ${file}`)

  const pullRequest = JSON.parse(
    gh([
      "pr", "view", String(pr),
      "--repo", MEDIA_REPOSITORY,
      "--json", "headRefOid,body,state,isDraft",
    ]).stdout,
  )
  // A merged or closed PR keeps moving its head ref as base merges land, so
  // a "new" asset name there is almost always a mistake. Only open PRs.
  if (pullRequest.state !== "OPEN") {
    throw new Error(`PR #${pr} is ${pullRequest.state.toLowerCase()}; demo videos are only added to open PRs.`)
  }
  const assetName = assetNameFor(pr, pullRequest.headRefOid, file)
  const url = assetUrlFor(assetName)

  if (dryRun) {
    const release = viewRelease()
    const taken = release?.assets.some((asset) => asset.name === assetName) ?? false
    console.log(`Dry run for PR #${pr} (head ${pullRequest.headRefOid.slice(0, 7)}):`)
    console.log(`  release: ${release ? `${MEDIA_RELEASE_TAG} exists` : `${MEDIA_RELEASE_TAG} would be created`}`)
    console.log(`  asset:   ${assetName}${taken ? " (already exists: a real run would refuse)" : ""}`)
    console.log(`  url:     ${url}`)
    console.log(`  description: ${linkDemoVideo(pullRequest.body, url).action}`)
    console.log(`  draft:   ${pullRequest.isDraft ? "yes" : "no"}`)
    console.log("Nothing was created, uploaded or edited.")
    if (taken) process.exitCode = 1
    return
  }

  const release = ensureRelease()
  if (release.assets.some((asset) => asset.name === assetName)) {
    throw new Error(
      `${assetName} already exists in the ${MEDIA_RELEASE_TAG} release. Assets are never overwritten; push a new commit or rename the file.`,
    )
  }

  // The asset takes its name from the uploaded file, so upload a renamed copy
  // and leave the original recording untouched. Without --clobber, gh refuses
  // to replace an asset that appeared in the meantime.
  const staging = mkdtempSync(join(tmpdir(), "pr-demo-video-"))
  try {
    const staged = join(staging, assetName)
    copyFileSync(file, staged)
    console.log(`Uploading ${assetName}`)
    gh(["release", "upload", MEDIA_RELEASE_TAG, staged, "--repo", MEDIA_REPOSITORY])
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }

  const status = await assertReachable(url)
  console.log(`Asset reachable (${status}): ${url}`)

  const { body, action } = linkDemoVideo(pullRequest.body, url)
  if (!checkDemoVideo(body).ok) {
    throw new Error("The updated description would still fail the demo video check.")
  }
  if (action !== "unchanged") {
    const bodyDirectory = mkdtempSync(join(tmpdir(), "pr-demo-video-body-"))
    try {
      const bodyFile = join(bodyDirectory, "body.md")
      writeFileSync(bodyFile, body)
      gh(["pr", "edit", String(pr), "--repo", MEDIA_REPOSITORY, "--body-file", bodyFile])
    } finally {
      rmSync(bodyDirectory, { recursive: true, force: true })
    }
  }
  console.log(`PR #${pr} description: ${action}`)
  console.log(url)
  if (pullRequest.isDraft) {
    console.log(`PR #${pr} is a draft: mark it ready (gh pr ready ${pr}) to run the Demo video check.`)
  }
}

if (isEntryPoint(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
