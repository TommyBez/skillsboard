import assert from "node:assert/strict"
import { readFile, stat } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const { siteConfig } = await loadTsModule(new URL("../lib/site.ts", import.meta.url))

const MCP_URL = `${siteConfig.url}/api/mcp`
const PLUGIN_NAME = "skills-board"
const PLUGIN_SOURCE = "./plugin"
const SKILL_NAME = "team-skill-library"

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** Agent Plugins 1.0.0 closes the manifest to this set of top-level fields. */
const portableManifestFields = new Set([
  "$schema",
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
  "extensions",
])

async function readJson(relative) {
  return JSON.parse(await readFile(new URL(relative, import.meta.url), "utf8"))
}

async function readText(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

const marketplace = await readJson("../.claude-plugin/marketplace.json")
const portableManifest = await readJson("../plugin/plugin.json")
const openPluginManifest = await readJson("../plugin/.plugin/plugin.json")
const claudeManifest = await readJson("../plugin/.claude-plugin/plugin.json")
const portableMcp = await readJson("../plugin/mcp.json")
const claudeMcp = await readJson("../plugin/.mcp.json")
const skillSource = await readText(`../plugin/skills/${SKILL_NAME}/SKILL.md`)
const mcpRoute = await readText("../app/api/[transport]/route.ts")

const manifests = [portableManifest, openPluginManifest, claudeManifest]

test("the marketplace lists the plugin from a path inside this repository", async () => {
  assert.equal(marketplace.name, PLUGIN_NAME)
  assert.equal(typeof marketplace.owner?.name, "string")
  assert.ok(marketplace.owner.name.length > 0)
  assert.equal(marketplace.plugins.length, 1)

  const [entry] = marketplace.plugins
  assert.equal(entry.name, PLUGIN_NAME)
  assert.equal(entry.source, PLUGIN_SOURCE)
  assert.ok(!entry.source.includes(".."))

  const pluginDirectory = new URL("../plugin/", import.meta.url)
  assert.ok((await stat(pluginDirectory)).isDirectory())
  assert.ok((await stat(new URL(".claude-plugin/plugin.json", pluginDirectory))).isFile())
  assert.ok((await stat(new URL(`skills/${SKILL_NAME}/SKILL.md`, pluginDirectory))).isFile())
})

test("every manifest agrees on the plugin name and version", () => {
  const [entry] = marketplace.plugins

  for (const manifest of manifests) {
    assert.equal(manifest.name, PLUGIN_NAME)
    assert.equal(manifest.version, entry.version)
    assert.equal(manifest.license, "MIT")
    assert.equal(manifest.repository, siteConfig.githubUrl)
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/)
  }
})

test("the portable manifest matches the Agent Plugins 1.0.0 contract", () => {
  assert.equal(
    portableManifest.$schema,
    "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  )

  for (const field of Object.keys(portableManifest)) {
    assert.ok(portableManifestFields.has(field), `unexpected portable field: ${field}`)
  }

  assert.match(portableManifest.name, /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/)
  assert.ok(portableManifest.name.length <= 64)
  assert.ok(!portableManifest.name.includes("--"))
  assert.ok(!portableManifest.name.includes(".."))
})

test("both MCP configurations point at the hosted endpoint over HTTPS", () => {
  assert.equal(portableMcp.$schema, "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json")
  assert.deepEqual(Object.keys(portableMcp), ["$schema", "mcpServers"])
  assert.deepEqual(Object.keys(portableMcp.mcpServers), [PLUGIN_NAME])
  assert.deepEqual(portableMcp.mcpServers[PLUGIN_NAME], {
    type: "streamable-http",
    url: MCP_URL,
  })

  assert.deepEqual(Object.keys(claudeMcp), ["mcpServers"])
  assert.deepEqual(claudeMcp.mcpServers[PLUGIN_NAME], { type: "http", url: MCP_URL })
})

test("the packaged skill declares the frontmatter its directory name requires", () => {
  const frontmatter = skillSource.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(frontmatter, "SKILL.md must open with YAML frontmatter")

  const name = frontmatter[1].match(/^name: (.+)$/m)?.[1]
  const description = frontmatter[1].match(/^description: (.+)$/m)?.[1]

  assert.equal(name, SKILL_NAME)
  assert.ok(description)
  assert.ok(description.length <= 1024)
  assert.ok(description.includes(MCP_URL))
})

test("the skill names only MCP tools the endpoint registers, and names them all", () => {
  const registered = new Set(
    [...mcpRoute.matchAll(/server\.registerTool\("([a-z_]+)"/g)].map((match) => match[1]),
  )
  assert.equal(registered.size, 13)

  const mentioned = new Set(
    [...skillSource.matchAll(/`([a-z][a-z0-9_]*)`/g)]
      .map((match) => match[1])
      .filter((value) => value.includes("_")),
  )

  for (const tool of mentioned) {
    assert.ok(registered.has(tool), `SKILL.md names an unregistered tool: ${tool}`)
  }
  for (const tool of registered) {
    assert.ok(mentioned.has(tool), `SKILL.md never mentions the ${tool} tool`)
  }
})

test("no plugin file uses an em dash or an en dash", async () => {
  const files = [
    "../.claude-plugin/marketplace.json",
    "../plugin/plugin.json",
    "../plugin/.plugin/plugin.json",
    "../plugin/.claude-plugin/plugin.json",
    "../plugin/mcp.json",
    "../plugin/.mcp.json",
    `../plugin/skills/${SKILL_NAME}/SKILL.md`,
  ]

  for (const file of files) {
    assert.doesNotMatch(await readText(file), dashPattern, `${file} contains a long dash`)
  }
})
