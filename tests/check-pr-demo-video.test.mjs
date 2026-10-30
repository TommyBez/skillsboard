import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

import {
  checkDemoVideo,
  isVideoUrl,
} from "../scripts/check-pr-demo-video.mjs"

const scriptPath = fileURLToPath(
  new URL("../scripts/check-pr-demo-video.mjs", import.meta.url),
)

function body(demoSection, after = "## Risk\n\nLow.") {
  return `## What\n\nA change.\n\n## Demo video\n\n${demoSection}\n\n${after}\n`
}

function runScript(prBody) {
  const env = { ...process.env }
  delete env.PR_BODY
  if (prBody !== undefined) env.PR_BODY = prBody
  return spawnSync(process.execPath, [scriptPath], { encoding: "utf8", env })
}

const validBodies = {
  "an mp4 link": body("https://example.com/demo.mp4"),
  "a webm link": body("https://cdn.example.com/videos/demo.webm"),
  "a mov link": body("https://example.com/demo.mov"),
  "an uppercase extension": body("https://example.com/DEMO.MP4"),
  "a query string": body(
    "https://bucket.example.com/demo.mp4?X-Amz-Signature=abc&expires=1",
  ),
  "a GitHub user attachment": body(
    "https://github.com/user-attachments/assets/0f3c2a1e-1111-2222-3333-444455556666",
  ),
  "a markdown link": body("[Watch the demo](https://example.com/demo.webm)"),
  "an html video tag": body('<video src="https://example.com/demo.mp4"></video>'),
  "trailing punctuation": body("Recording: https://example.com/demo.mp4."),
  "a level-3 heading inside the section": body(
    "### Desktop\n\nhttps://example.com/demo.mp4",
  ),
  "a lowercase heading": "## demo video\nhttps://example.com/demo.mp4",
  "CRLF line endings": body("https://example.com/demo.mp4").replaceAll(
    "\n",
    "\r\n",
  ),
  "a pr-media release asset": body(
    "https://github.com/TommyBez/skillsboard/releases/download/pr-media/pr-214-1a88034-demo.webm",
  ),
  "a pr-media release mov asset": body(
    "https://github.com/TommyBez/skillsboard/releases/download/pr-media/pr-7-abcdef0-demo.MOV",
  ),
  "the section at the end of the body":
    "## What\n\nx\n\n## Demo video\n\nhttps://example.com/demo.mp4",
}

const invalidBodies = {
  "an empty body": ["", "missing-section"],
  "no demo video section": [
    "## What\n\nhttps://example.com/demo.mp4\n",
    "missing-section",
  ],
  "a level-3 demo video heading": [
    "### Demo video\n\nhttps://example.com/demo.mp4\n",
    "missing-section",
  ],
  "an empty section": [body(""), "missing-link"],
  "a pending note": [
    body("Pending upload — file recorded at /Users/me/demo.webm"),
    "missing-link",
  ],
  "an http link": [body("http://example.com/demo.mp4"), "missing-link"],
  "a non-video link": [body("https://example.com/demo.html"), "missing-link"],
  "a video extension only in the query": [
    body("https://example.com/watch?file=demo.mp4"),
    "missing-link",
  ],
  "a lookalike GitHub host": [
    body("https://github.com.evil.example/user-attachments/assets/abc"),
    "missing-link",
  ],
  "a pr-media asset that is not a video": [
    body("https://github.com/TommyBez/skillsboard/releases/download/pr-media/notes.txt"),
    "missing-link",
  ],
  "another release tag": [
    body("https://github.com/TommyBez/skillsboard/releases/download/v1.0.0/demo.webm"),
    "missing-link",
  ],
  "a differently cased release tag": [
    body("https://github.com/TommyBez/skillsboard/releases/download/PR-MEDIA/demo.webm"),
    "missing-link",
  ],
  "another repository's pr-media release": [
    body("https://github.com/someone/skillsboard/releases/download/pr-media/demo.webm"),
    "missing-link",
  ],
  "a nested path under pr-media": [
    body("https://github.com/TommyBez/skillsboard/releases/download/pr-media/x/demo.webm"),
    "missing-link",
  ],
  "any other github.com video path": [
    body("https://github.com/TommyBez/skillsboard/raw/main/demo.mp4"),
    "missing-link",
  ],
  "a lookalike host for the pr-media release": [
    body(
      "https://github.com.evil.example/TommyBez/skillsboard/releases/download/pr-media/demo.webm",
    ),
    "missing-link",
  ],
  "a lookalike subdomain host": [
    body("https://www.github.com.evil.example/demo.mp4"),
    "missing-link",
  ],
  "a GitHub attachment without an id": [
    body("https://github.com/user-attachments/assets/"),
    "missing-link",
  ],
  "a link only inside an html comment": [
    body("<!-- e.g. https://example.com/demo.mp4 -->"),
    "missing-link",
  ],
  "a link after the next level-2 heading": [
    body("Coming soon.", "## Risk\n\nhttps://example.com/demo.mp4"),
    "missing-link",
  ],
  "a link before the section": [
    "https://example.com/demo.mp4\n\n## Demo video\n\nTBD\n",
    "missing-link",
  ],
  "a commented-out section heading": [
    "<!--\n## Demo video\nhttps://example.com/demo.mp4\n-->\n",
    "missing-section",
  ],
}

for (const [name, prBody] of Object.entries(validBodies)) {
  test(`passes with ${name}`, () => {
    const result = checkDemoVideo(prBody)
    assert.equal(result.ok, true, JSON.stringify(result))
    assert.ok(result.links.length > 0)
  })
}

for (const [name, [prBody, reason]] of Object.entries(invalidBodies)) {
  test(`fails with ${name}`, () => {
    const result = checkDemoVideo(prBody)
    assert.equal(result.ok, false)
    assert.equal(result.reason, reason)
  })
}

test("treats a null or undefined body as missing the section", () => {
  assert.equal(checkDemoVideo(null).reason, "missing-section")
  assert.equal(checkDemoVideo(undefined).reason, "missing-section")
})

test("isVideoUrl rejects strings that are not URLs", () => {
  assert.equal(isVideoUrl("not a url.mp4"), false)
})

test("the PR template fails the check until a video is added", async () => {
  const template = await readFile(
    new URL("../.github/pull_request_template.md", import.meta.url),
    "utf8",
  )
  for (const heading of ["What", "Why", "Verification", "Risk", "Demo video"]) {
    assert.match(template, new RegExp(`^## ${heading}$`, "m"))
  }
  assert.equal(checkDemoVideo(template).reason, "missing-link")
})

test("the script exits 1 with guidance when PR_BODY has no video", () => {
  const run = runScript(body("TBD"))
  assert.equal(run.status, 1)
  assert.match(run.stdout, /::error title=Demo video missing::/)
  assert.match(run.stdout, /user-attachments\/assets/)
})

test("the script exits 1 when PR_BODY is unset", () => {
  const run = runScript(undefined)
  assert.equal(run.status, 1)
  assert.match(run.stdout, /no `## Demo video` section/)
})

test("the script exits 0 when PR_BODY links a video", () => {
  const run = runScript(body("https://example.com/demo.mp4"))
  assert.equal(run.status, 0)
  assert.match(run.stdout, /Demo video found: https:\/\/example\.com\/demo\.mp4/)
})
