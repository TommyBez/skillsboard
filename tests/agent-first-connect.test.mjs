import assert from "node:assert/strict"
import { access, readdir, readFile } from "node:fs/promises"
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
const inviteForm = await readText("../components/invite-member-form.tsx")
const firstSkillInviteStep = await readText("../components/first-skill-invite-step.tsx")
const organizationSettings = await readText("../app/(app)/settings/organization/page.tsx")
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
  // One frame, the public one. A signed-in reader gets the same page as
  // everyone else, which is what the founder asked for and what keeps a stale
  // session cookie from turning an acquisition page into a redirect to sign in.
  assert.match(connectLayout, /<ResourceShell location="connect_header">/)
  assert.doesNotMatch(connectLayout, /ProtectedAppShell/)
})

/**
 * The build failure this page shipped with was a runtime read during
 * prerendering: the layout chose its frame from the session cookie. A public
 * page cannot read per-request state at all, so the rule is asserted over every
 * file under `app/connect`, not just the two that had the problem.
 */
test("nothing under /connect reads a session, a cookie, or a header", async () => {
  const directory = new URL("../app/connect/", import.meta.url)
  const files = await readdir(directory)
  assert.ok(files.length > 0)

  for (const file of files) {
    const source = await readFile(new URL(file, directory), "utf8")
    assert.doesNotMatch(
      source,
      /getSessionCookie|getSession|requireSession|getAppContext|\bauth\(|cookies\(\)|headers\(\)/,
      `${file} reads per-request state on a page that has to prerender`,
    )
  }
  // The helper that resolved the viewer's team for this page is gone with it.
  assert.equal(await exists("../lib/connect-viewer.ts"), false)
  // The endpoint is the same string for every visitor, not the request host.
  assert.match(connectPage, /const mcpUrl = absoluteUrl\("\/api\/mcp"\)/)
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
  // The public page cannot name a team, so the property is optional rather
  // than gone, and the authenticated first run still sends the real one.
  assert.match(events, /mcp_config_copied: \{\n\s+client: [^\n]+\n\s+team_id\?: string\n\s+\}/)
  assert.match(
    nextSteps,
    /event: "mcp_config_copied",\n\s+properties: \{ client: "generic", team_id: teamId \},/,
  )
  assert.match(events, /surface: "first_skill_invite_step" \| "onboarding" \| "organization_settings"/)
  // The two steps that had no event of their own, and only those two.
  assert.match(events, /onboarding_steps_viewed: Record<never, never>/)
  assert.match(events, /step: "first_skill" \| "invite_team"/)
})

/**
 * The invitation is created on the server, so the surface has to travel with
 * the request: a client-side event on the form can describe the copied link,
 * but not the invitation that was actually sent.
 */
test("an invitation carries the surface it was sent from", () => {
  assert.match(events, /team_member_invited: \{\n\s+email_sent: boolean\n\s+role: "admin" \| "member"\n\s+surface: "first_skill_invite_step" \| "onboarding" \| "organization_settings"\n\s+\}/)

  // The form posts it, the action reads it, the event carries it.
  assert.match(inviteForm, /<input type="hidden" name="surface" value=\{surface\} \/>/)
  assert.match(organizationActions, /const surface = inviteSurfaceSchema\.parse\(formData\.get\("surface"\)\)/)
  assert.match(
    organizationActions,
    /event: "team_member_invited",\n\s+properties: \{\n\s+role: parsed\.data\.role,\n\s+email_sent: !emailError,\n\s+surface,\n\s+\},/,
  )

  // Every copy of the form names its own surface, and the first run names the
  // one the onboarding metric is counted on.
  assert.match(inviteStep, /surface="onboarding"/)
  assert.match(firstSkillInviteStep, /surface="first_skill_invite_step"/)
  assert.match(organizationSettings, /surface="organization_settings"/)
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
