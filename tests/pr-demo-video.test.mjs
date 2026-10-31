import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { test } from "node:test"

import { checkDemoVideo, isEntryPoint } from "../scripts/check-pr-demo-video.mjs"
import {
  assetNameFor,
  assetUrlFor,
  linkDemoVideo,
  parseArgs,
} from "../scripts/pr-demo-video.mjs"

const url =
  "https://github.com/TommyBez/skillsboard/releases/download/pr-media/pr-214-1a88034-demo.webm"

// Everything outside the `## Demo video` section, to prove it is untouched.
function outsideDemoSection(body) {
  return body.replace(/## Demo video[\s\S]*?(?=\r?\n## |$)/, "## Demo video")
}

test("parseArgs accepts a PR number and a video file", () => {
  assert.deepEqual(parseArgs(["214", "out/demo.webm"]), {
    pr: 214,
    file: "out/demo.webm",
  })
})

test("parseArgs rejects bad arguments", () => {
  assert.throws(() => parseArgs([]), /Usage: pnpm pr:video/)
  assert.throws(() => parseArgs(["214"]), /Usage/)
  assert.throws(() => parseArgs(["214", "a.webm", "extra"]), /Usage/)
  assert.throws(() => parseArgs(["#214", "a.webm"]), /positive integer/)
  assert.throws(() => parseArgs(["0", "a.webm"]), /positive integer/)
  assert.throws(() => parseArgs(["214", "demo.gif"]), /\.mp4, \.webm or \.mov/)
})

test("asset names are pr-<n>-<shortsha>-<basename>", () => {
  assert.equal(
    assetNameFor(214, "1A88034ffeeddccbbaa99887766554433221100f", "/tmp/x/demo.webm"),
    "pr-214-1a88034-demo.webm",
  )
  assert.equal(
    assetUrlFor("pr-214-1a88034-demo.webm"),
    "https://github.com/TommyBez/skillsboard/releases/download/pr-media/pr-214-1a88034-demo.webm",
  )
})

test("asset names reject characters GitHub would rewrite", () => {
  assert.throws(() => assetNameFor(1, "1a88034", "my demo.webm"), /Rename the file/)
  assert.throws(() => assetNameFor(1, "1a88034", ".hidden.webm"), /Rename the file/)
  assert.throws(() => assetNameFor(1, "not-a-sha", "demo.webm"), /SHA/)
})

test("replaces the pending line and nothing else", () => {
  const before = [
    "## What",
    "",
    "Pending upload is mentioned here but this is not the demo section.",
    "",
    "## Demo video",
    "",
    "<!-- Required: a hosted video link. -->",
    "",
    "Pending upload — file recorded at /Users/me/demo.webm",
    "",
    "(18 s recording.)",
    "",
    "🤖 Generated with Claude Code",
    "",
  ].join("\n")
  const { body, action } = linkDemoVideo(before, url)
  assert.equal(action, "replaced-pending")
  assert.equal(body, before.replace("Pending upload — file recorded at /Users/me/demo.webm", url))
  assert.equal(checkDemoVideo(body).ok, true)
})

test("keeps CRLF line endings", () => {
  const before = "## What\r\n\r\nx\r\n\r\n## Demo video\r\n\r\nPending upload\r\n\r\n## Risk\r\n\r\nLow.\r\n"
  const { body } = linkDemoVideo(before, url)
  assert.equal(body, before.replace("Pending upload", url))
  assert.equal(outsideDemoSection(body), outsideDemoSection(before))
})

test("ignores a pending line inside an HTML comment", () => {
  const before = "## Demo video\n\n<!--\nPending upload\n-->\n\n## Risk\n\nLow.\n"
  const { body, action } = linkDemoVideo(before, url)
  assert.equal(action, "added-link")
  assert.equal(body, `## Demo video\n\n<!--\nPending upload\n-->\n\n${url}\n\n## Risk\n\nLow.\n`)
})

test("adds the link to a section without a pending line", () => {
  const before = "## What\n\nx\n\n## Demo video\n\n## Risk\n\nLow.\n"
  const { body, action } = linkDemoVideo(before, url)
  assert.equal(action, "added-link")
  assert.equal(body, `## What\n\nx\n\n## Demo video\n\n${url}\n\n## Risk\n\nLow.\n`)
  assert.equal(outsideDemoSection(body), outsideDemoSection(before))
})

test("appends the section when it is missing", () => {
  const before = "## What\n\nx\n\n## Risk\n\nLow.\n\n"
  const { body, action } = linkDemoVideo(before, url)
  assert.equal(action, "appended-section")
  assert.equal(body, `## What\n\nx\n\n## Risk\n\nLow.\n\n## Demo video\n\n${url}\n`)
  assert.equal(linkDemoVideo("", url).body, `## Demo video\n\n${url}\n`)
  assert.equal(linkDemoVideo(null, url).action, "appended-section")
})

test("a commented-out heading does not count as the section", () => {
  const before = "<!--\n## Demo video\n-->\n## What\n\nx\n"
  const { action } = linkDemoVideo(before, url)
  assert.equal(action, "appended-section")
})

test("is a no-op when the URL is already linked", () => {
  const before = `## Demo video\n\n${url}\n`
  assert.deepEqual(linkDemoVideo(before, url), { body: before, action: "unchanged" })
})

// On macOS /tmp is a symlink to /private/tmp. Running the scripts through a
// symlinked directory used to make the entry-point check fail, so they exited
// 0 without doing or printing anything.
test("the scripts run when started through a symlinked directory", () => {
  const scriptsDirectory = fileURLToPath(new URL("../scripts", import.meta.url))
  const temporary = mkdtempSync(join(tmpdir(), "pr-demo-video-symlink-"))
  try {
    const linked = join(temporary, "scripts")
    symlinkSync(scriptsDirectory, linked, "dir")
    const env = { ...process.env }
    delete env.PR_NUMBER

    const usage = spawnSync(process.execPath, [join(linked, "pr-demo-video.mjs")], {
      encoding: "utf8",
      env,
    })
    assert.equal(usage.status, 1)
    assert.match(usage.stderr, /Usage: pnpm pr:video <pr-number> <file>/)

    const check = spawnSync(process.execPath, [join(linked, "check-pr-demo-video.mjs")], {
      encoding: "utf8",
      env: { ...env, PR_BODY: "## Demo video\n\nhttps://example.com/demo.mp4\n" },
    })
    assert.equal(check.status, 0)
    assert.match(check.stdout, /Demo video found/)
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
})

test("isEntryPoint compares real paths", () => {
  const temporary = realpathSync(mkdtempSync(join(tmpdir(), "pr-demo-video-entry-")))
  try {
    const file = join(temporary, "script.mjs")
    writeFileSync(file, "")
    const link = join(temporary, "link")
    symlinkSync(temporary, link, "dir")
    const moduleUrl = pathToFileURL(file).href
    assert.equal(isEntryPoint(moduleUrl, join(link, "script.mjs")), true)
    assert.equal(isEntryPoint(moduleUrl, file), true)
    assert.equal(isEntryPoint(moduleUrl, join(temporary, "other.mjs")), false)
    assert.equal(isEntryPoint(moduleUrl, undefined), false)
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
})
