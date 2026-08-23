import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { siteConfig } = await import("../lib/site.ts")
const { default: sitemap } = await import("../app/sitemap.ts")
const { default: nextConfig } = await import("../next.config.ts")

async function readText(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

const connectPage = await readText("../app/connect/page.tsx")
const connectLayout = await readText("../app/connect/layout.tsx")
const appHeader = await readText("../components/app-header.tsx")
const accountMenu = await readText("../components/account-menu.tsx")
const libraryPage = await readText("../app/(app)/library/page.tsx")
const startPage = await readText("../app/(app)/start/page.tsx")
const nextSteps = await readText("../components/onboarding-next-steps.tsx")
const inviteStep = await readText("../components/onboarding-invite-step.tsx")
const organizationActions = await readText("../app/actions/organizations.ts")
const events = await readText("../analytics/posthog/events.ts")
const llms = await readText("../public/llms.txt")

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[–—]/

test("connecting an agent is a page of its own, not a setting", async () => {
  assert.equal(await exists("../app/connect/page.tsx"), true)
  assert.equal(await exists("../app/(app)/settings/mcp/page.tsx"), false)
  assert.match(connectPage, /<McpPluginInstall \/>/)
  assert.match(connectPage, /<McpSetupGuide/)
  assert.match(connectPage, /Connect your agent/)
})

test("the old settings path still resolves, permanently, to the new one", async () => {
  const redirects = await nextConfig.redirects()
  const moved = redirects.filter((rule) => rule.source.startsWith("/settings/mcp"))

  assert.deepEqual(
    moved.map((rule) => rule.source),
    ["/settings/mcp", "/settings/mcp/"],
  )
  for (const rule of moved) {
    assert.equal(rule.destination, "/connect")
    assert.equal(rule.permanent, true)
  }
})

test("every entry point into the setup page names the new destination", () => {
  for (const source of [appHeader, accountMenu, libraryPage]) {
    assert.doesNotMatch(source, /"\/settings\/mcp"/)
    assert.match(source, /"\/connect"/)
  }
  // The event keeps its name and its old destination value, so the series
  // before the move and the series after it stay readable together.
  assert.match(events, /mcp_entry_clicked: \{/)
  assert.match(events, /destination: "#mcp" \| "\/connect" \| "\/settings\/mcp" \| "\/sign-up"/)
})

test("/connect is a public page, discoverable in the sitemap and llms.txt", () => {
  assert.ok(
    sitemap().some((entry) => entry.url === `${siteConfig.url}/connect`),
    "missing from the sitemap",
  )
  const listed = llms.match(/^- \[Connect your agent\]\(https:\/\/www\.skillsboard\.sh\/connect\):.+$/gm)
  assert.equal(listed?.length, 1)
  // A page in the sitemap cannot sit behind the session: the layout picks the
  // frame, it never requires one.
  assert.doesNotMatch(connectLayout, /requireSession|getAppContext/)
})

test("the first run offers the agent first, with the invitation beside it", () => {
  const connectStep = nextSteps.indexOf("Connect your agent")
  const firstSkillStep = nextSteps.indexOf("Add your first skill")
  const inviteTeamStep = nextSteps.indexOf("Invite your team")

  assert.ok(connectStep > -1 && firstSkillStep > -1 && inviteTeamStep > -1)
  assert.ok(connectStep < firstSkillStep, "the agent connection is not the first step")
  assert.ok(firstSkillStep < inviteTeamStep)
  // Not a placeholder: the step carries the real install commands, the real
  // endpoint, and the real invitation form.
  assert.match(nextSteps, /claudeCodeInstallSnippet/)
  assert.match(nextSteps, /code=\{mcpUrl\}/)
  assert.match(inviteStep, /<InviteMemberForm/)
  assert.match(startPage, /<OnboardingNextSteps/)
})

test("a team created in onboarding lands on the first-run screen", () => {
  assert.match(organizationActions, /redirect\(creationSurface === "onboarding" \? "\/start" : "\/library"\)/)
})

test("the first-run steps reuse the existing event names", () => {
  for (const event of [
    "plugin_install_copied",
    "mcp_config_copied",
    "mcp_entry_clicked",
  ]) {
    assert.match(nextSteps, new RegExp(`event: "${event}"|${event}`))
    assert.match(events, new RegExp(`${event}: \\{`))
  }
  assert.match(inviteStep, /event: "team_invite_link_copied"/)
  assert.match(events, /surface: "first_skill_invite_step" \| "onboarding" \| "organization_settings"/)
  // The two steps that had no event of their own, and only those two.
  assert.match(events, /onboarding_steps_viewed: Record<never, never>/)
  assert.match(events, /step: "first_skill" \| "invite_team"/)
})

test("no dash rule violations in the copy this change owns", () => {
  for (const source of [connectPage, connectLayout, startPage, nextSteps, inviteStep]) {
    assert.doesNotMatch(source, dashPattern)
  }
  const connectLine = llms.split("\n").find((line) => line.includes("/connect)"))
  assert.doesNotMatch(connectLine, dashPattern)
})

test("the new copy keeps the product's own words", () => {
  for (const source of [connectPage, startPage, nextSteps, inviteStep]) {
    assert.doesNotMatch(source, /recommend/i)
    assert.doesNotMatch(source, /shared library/i)
  }
})
