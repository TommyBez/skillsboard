import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const { pluginInstall, claudeCodeInstallSnippet } = await loadTsModule(
  new URL("../lib/plugin-install.ts", import.meta.url),
)
const { siteConfig } = await loadTsModule(new URL("../lib/site.ts", import.meta.url))

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

const landingSection = await readText("../components/landing/sections/plugin-section.tsx")
const settingsBlock = await readText("../components/mcp-plugin-install.tsx")
const landingPage = await readText("../app/(landing)/page.tsx")
const settingsPage = await readText("../app/(app)/settings/mcp/page.tsx")
const events = await readText("../analytics/posthog/events.ts")

async function readText(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

test("the install commands are the ones the marketplace in this repository serves", () => {
  assert.equal(pluginInstall.repositorySlug, "TommyBez/skillsboard")
  assert.equal(siteConfig.githubUrl, `https://github.com/${pluginInstall.repositorySlug}`)
  assert.deepEqual(pluginInstall.claudeCodeCommands, [
    "/plugin marketplace add TommyBez/skillsboard",
    "/plugin install skills-board@skills-board",
  ])
  assert.equal(pluginInstall.cliCommand, "npx plugins add TommyBez/skillsboard")
  assert.equal(
    claudeCodeInstallSnippet,
    "/plugin marketplace add TommyBez/skillsboard\n/plugin install skills-board@skills-board",
  )
})

test("both surfaces quote the shared commands instead of their own copies", () => {
  for (const source of [landingSection, settingsBlock]) {
    assert.match(source, /from "@\/lib\/plugin-install"/)
    assert.doesNotMatch(source, /\/plugin (?:marketplace add|install)/)
    assert.doesNotMatch(source, /npx plugins add/)
  }
})

test("the landing page and the connection page render the plugin blocks", () => {
  assert.match(landingPage, /<PluginSection \/>/)
  assert.match(landingPage, /from "@\/components\/landing\/sections\/plugin-section"/)
  assert.match(settingsPage, /<McpPluginInstall \/>/)
  assert.match(settingsPage, /from "@\/components\/mcp-plugin-install"/)
})

test("each copy control reports the surface it was copied from", () => {
  assert.match(events, /plugin_install_copied: \{\n\s+location: "landing" \| "mcp_settings"\n\s+\}/)
  assert.match(landingSection, /location: "landing"/)
  assert.match(settingsBlock, /location: "mcp_settings"/)
})

test("no plugin install copy uses an em dash or an en dash", () => {
  for (const source of [landingSection, settingsBlock]) {
    assert.doesNotMatch(source, dashPattern)
  }
})
