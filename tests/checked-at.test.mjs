import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { publicPages, requirePage } = await import("../lib/site/pages.ts")
const { renderMarkdownTwin } = await import("../lib/markdown/twins.ts")

/**
 * The pages whose `modifiedAt` moved for a copy change that re-checked no
 * claim. Their visible "Last checked" date must stay the day the claims were
 * actually checked, which is the `modifiedAt` they carried before.
 */
const checkedBeforeTheCopyChange = {
  "/cursor-skills": "2026-08-15",
  "/opencode-skills": "2026-08-21",
  "/claude-skills": "2026-08-16",
  "/vercel-skills": "2026-08-21",
  "/where-to-find-claude-skills": "2026-08-17",
  "/skill-creator": "2026-08-25",
  "/compare/claude-skills-vs-mcp": "2026-08-16",
  "/alternatives/smithery": "2026-08-09",
}

/** The date a "Last checked" label prints, read the way the pages read it. */
const visibleCheckedDate = (content) => content.checkedAt ?? content.modifiedAt

test("the visible check date stays on the day the claims were checked", () => {
  for (const [path, checked] of Object.entries(checkedBeforeTheCopyChange)) {
    const page = requirePage(path)
    assert.equal(visibleCheckedDate(page.content), checked, path)
    assert.ok(page.modifiedAt > checked, `${path} modifiedAt should be later`)
  }
})

test("checkedAt is a day no later than modifiedAt wherever it is set", () => {
  for (const page of publicPages) {
    const checkedAt = page.content?.checkedAt
    if (checkedAt === undefined) continue
    assert.match(checkedAt, /^\d{4}-\d{2}-\d{2}$/, page.path)
    assert.ok(checkedAt <= page.modifiedAt, `${page.path}: ${checkedAt}`)
  }
})

test("the check labels read checkedAt before modifiedAt", () => {
  const components = [
    "agent-skills",
    "agent-skills-support",
    "agents-md-vs-skill-md",
    "anthropic-skills",
    "best-claude-skills",
    "claude-code-for-teams",
    "claude-skills",
    "codex-skills",
    "copilot-skills",
    "cowork-skills",
    "cursor-skills",
    "manage-ai-skills",
    "opencode-skills",
    "skill-creator",
    "skill-examples",
    "vercel-skills",
    "where-to-find-claude-skills",
  ].map((slug) => `components/${slug}/${slug}-page.tsx`)
  components.push(
    "components/compare/comparison-page.tsx",
    "components/alternatives/alternative-page.tsx",
  )
  for (const file of components) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
    assert.match(source, /entry\.checkedAt \?\? entry\.modifiedAt/, file)
  }
})

test("the Markdown twin keeps modifiedAt and never prints checkedAt", () => {
  for (const path of Object.keys(checkedBeforeTheCopyChange)) {
    const markdown = renderMarkdownTwin(path)
    if (markdown === undefined) continue
    const page = requirePage(path)
    assert.ok(markdown.includes(`last_updated: ${page.modifiedAt}`), path)
    assert.ok(!markdown.includes("checkedAt"), path)
  }
})
