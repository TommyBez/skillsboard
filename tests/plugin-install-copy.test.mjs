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
const connectPage = await readText("../app/(app)/connect/page.tsx")
const events = await readText("../analytics/posthog/events.ts")
const setupGuide = await readText("../components/mcp-setup-guide.tsx")
const skill = await readText("../plugin/skills/team-skill-library/SKILL.md")
const llms = await readText("../public/llms.txt")
const landingFaq = await readText("../lib/seo/landing-faq.ts")
const packageJson = await readText("../package.json")
const readme = await readText("../README.md")

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
  assert.match(connectPage, /<McpPluginInstall \/>/)
  assert.match(connectPage, /from "@\/components\/mcp-plugin-install"/)
})

test("each copy control reports the surface it was copied from", () => {
  assert.match(events, /plugin_install_copied: \{\n\s+location: "landing" \| "mcp_settings" \| "onboarding"\n\s+\}/)
  assert.match(landingSection, /location: "landing"/)
  assert.match(settingsBlock, /location: "mcp_settings"/)
})

test("no plugin install copy uses an em dash or an en dash", () => {
  for (const source of [landingSection, settingsBlock]) {
    assert.doesNotMatch(source, dashPattern)
  }
})

test("the plugin copy does not present the plugin as a Claude Code exclusive", () => {
  assert.doesNotMatch(landingSection, /Add Skills Board to Claude Code/)
  assert.match(landingSection, /Agent Plugins\n?\s*standard/)
  assert.match(landingSection, /any client that supports it/)
  assert.doesNotMatch(readme, /## Claude Code plugin/)
})

test("the connection page offers the plugin as an alternative to the manual setup", () => {
  assert.match(settingsBlock, /Option 1: the plugin/)
  assert.match(settingsBlock, /replaces the manual setup in option 2/)
  assert.match(settingsBlock, /Do one or the other, not both\./)
  assert.match(setupGuide, /Option 2: manual MCP setup/)
  assert.match(setupGuide, /Skip this if you installed the plugin above/)
  assert.match(connectPage, /data-testid="mcp-setup-or-divider"/)
  assert.match(connectPage, /There are two ways to set this up/)
})

test("Skills Board is described as a web app, never as a shared library", () => {
  const productCopy = [landingSection, settingsBlock, skill, llms, landingFaq, packageJson]
  for (const source of productCopy) {
    assert.doesNotMatch(source, /Skills Board is (?:a|the) shared library/)
    assert.doesNotMatch(source, /A shared library for the AI skills/)
  }
  assert.match(landingSection, /Skills Board is a web app/)
  assert.match(skill, /Skills Board is a web app/)
  // The llms.txt summary now opens with the approved category phrase and
  // keeps the web app formula right behind it, so the rule still holds.
  assert.match(
    llms,
    /Skills Board is the agent-native skills registry for teams, the web app/,
  )
  assert.match(landingFaq, /Skills Board is a web app/)
})

test("no dash rule violations in the copy this page owns", () => {
  for (const source of [landingSection, settingsBlock, connectPage]) {
    assert.doesNotMatch(source, dashPattern)
  }
})
