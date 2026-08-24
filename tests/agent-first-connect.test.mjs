import assert from "node:assert/strict"
import { access, readFile, readdir } from "node:fs/promises"
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

async function readSourceTree(relative) {
  const directory = new URL(relative, import.meta.url)
  const entries = await readdir(directory, { withFileTypes: true })
  const sources = []

  for (const entry of entries) {
    const child = new URL(entry.name, `${directory.href}/`)
    if (entry.isDirectory()) {
      sources.push(...(await readSourceTree(child.href)))
    } else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
      sources.push(await readFile(child, "utf8"))
    }
  }

  return sources
}

function assertPatternsInOrder(source, patterns, message) {
  let cursor = 0

  for (const pattern of patterns) {
    const match = source.slice(cursor).match(pattern)
    assert.ok(match, `${message}: missing ${pattern}`)
    cursor += match.index + match[0].length
  }
}

const connectPage = await readText("../app/(app)/connect/page.tsx")
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
const mcpSetupGuide = await readText("../components/mcp-setup-guide.tsx")
const appLayout = await readText("../app/(app)/layout.tsx")
const rootLayout = await readText("../app/layout.tsx")
const protectedAppShell = await readText("../components/protected-app-shell.tsx")
const posthogIdentity = await readText("../components/posthog-identity.tsx")
const posthogClient = await readText("../lib/posthog-client.ts")
const instrumentationClient = await readText("../instrumentation-client.ts")
const analyticsClient = await readText("../lib/analytics-client.ts")
const createOrganizationForm = await readText("../components/create-organization-form.tsx")
const acceptInvitationForm = await readText("../components/accept-invitation-form.tsx")
const organizationSwitcher = await readText("../components/organization-switcher.tsx")
const consentPage = await readText("../app/consent/page.tsx")
const llms = await readText("../public/llms.txt")
const applicationSources = (
  await Promise.all(
    ["../analytics/", "../app/", "../components/", "../lib/"].map(readSourceTree),
  )
).flat()

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[–—]/

test("connecting an agent is a page of its own, not a setting", async () => {
  assert.equal(await exists("../app/(app)/connect/page.tsx"), true)
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

/**
 * The founder asked for `/connect` as a private page: MCP setup moving out of
 * settings was the point, not making it a public acquisition surface. It now
 * lives in the same authenticated route group as every other signed-in page,
 * and it has to stay out of the surfaces that only list public URLs.
 */
test("/connect is private: out of the sitemap and out of llms.txt", () => {
  assert.ok(
    !sitemap().some((entry) => entry.url === `${siteConfig.url}/connect`),
    "an authenticated page must not be listed in the sitemap",
  )
  assert.doesNotMatch(llms, /\(https:\/\/www\.skillsboard\.sh\/connect\)/)
})

/**
 * `/connect` moved into the `(app)` route group instead of keeping its own
 * public layout: that group's layout is what redirects a signed-out visitor
 * to sign in and marks every route under it `noindex`, the same mechanism
 * `/start`, `/library`, and `/settings` already rely on.
 */
test("/connect is authenticated the same way as every other app page", async () => {
  assert.equal(await exists("../app/(app)/connect/page.tsx"), true)
  // No layout of its own: the shared `(app)` layout supplies the session
  // check, the protected shell, and the noindex metadata.
  assert.equal(await exists("../app/(app)/connect/layout.tsx"), false)
  assert.doesNotMatch(connectPage, /ResourceShell/)
})

test("/connect is gated at the edge the same way as /library", async () => {
  const proxy = await readText("../proxy.ts")
  const sanitizer = await readText("../lib/safe-return-to.ts")

  assert.match(proxy, /pathname === "\/connect"/)
  assert.match(proxy, /pathname === "\/start"/)
  assert.match(proxy, /"\/connect"/)
  assert.match(proxy, /"\/start"/)
  assert.match(
    proxy,
    /pathname === "\/library" \|\|\n\s+pathname === "\/connect" \|\|\n\s+pathname === "\/start" \|\|\n\s+pathname === "\/settings\/email"/,
  )
  assert.match(sanitizer, /"\/connect"/)
  assert.match(sanitizer, /"\/start"/)
  assert.match(sanitizer, /immediateSignedInDestinations = \["\/library", "\/connect", "\/start"\]/)
})

/**
 * The route group owns authentication and analytics identity. The setup page
 * itself contains no team-specific UI, so it must not wait on app context just
 * to label browser analytics.
 */
test("the connect guide renders without a page-local team fetch", () => {
  assert.doesNotMatch(connectPage, /getAppContext/)
  assert.doesNotMatch(connectPage, /async function ConnectGuide/)
  assert.doesNotMatch(connectPage, /ConnectGuideFallback/)
  // The endpoint is this deployment's MCP resource, from the same Vercel
  // system vars Better Auth uses, not a hardcoded production URL.
  assert.match(connectPage, /getMcpResource\(\)/)
  assert.doesNotMatch(connectPage, /headers\(\)/)
  assert.doesNotMatch(connectPage, /const mcpUrl = absoluteUrl\("\/api\/mcp"\)/)
  // The plugin install commands stay canonical: the same command for every
  // team, since the plugin is not team scoped.
  assert.match(connectPage, /<McpPluginInstall \/>/)
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

test("only the first-run content that needs app context waits for it", () => {
  // The start heading used to live outside a Suspense child that called
  // getAppContext, so a new account saw "Your team library is ready"
  // before the redirect to team creation. That heading still waits on the
  // team. /connect's heading and guide are generic, so neither waits on a
  // page-local analytics fetch. The MCP URL comes from env on both.
  assert.match(startPage, /async function StartHeading/)
  assert.match(startPage, /await getAppContext\(\)/)
  assert.match(startPage, /getMcpResource\(\)/)
  assert.doesNotMatch(startPage, /headers\(\)/)
  assert.match(connectPage, /export default function ConnectPage/)
  assert.doesNotMatch(connectPage, /getAppContext/)
  assert.match(connectPage, /getMcpResource\(\)/)
  assert.doesNotMatch(connectPage, /headers\(\)/)
})

test("OTP success identifies first, flushes the auth event, then reloads the destination", async () => {
  const authForm = await readText("../components/auth-form.tsx")
  assertPatternsInOrder(
    authForm,
    [
      /await syncPostHogIdentity\(\{ userId \}\)/,
      /captureAnalyticsEvent\(/,
      /window\.location\.assign\(destinationAfterOtp\(returnTo, mode\)\)/,
    ],
    "OTP success",
  )
  assert.equal((authForm.match(/send_instantly:\s*true/g) ?? []).length, 2)
  assert.match(authForm, /window\.location\.assign\(continueHref\)/)
  assert.doesNotMatch(authForm, /activeOrganizationId|authClient\.getSession\(/)
  assert.doesNotMatch(authForm, /router\.(?:push|refresh|replace)\(/)
})

test("a team created in onboarding lands on the first-run screen", async () => {
  const onboardingPage = await readText("../app/onboarding/page.tsx")
  assert.match(
    organizationActions,
    /const destination = creationSurface === "onboarding" \? "\/start" : "\/library"/,
  )
  assert.doesNotMatch(
    organizationActions,
    /redirect\(creationSurface === "onboarding" \? "\/start" : "\/library"\)/,
  )
  // After a reload, this page still sends an existing empty team to the
  // first-run screen. The create form owns the normal client navigation so it
  // can register the new team with PostHog first.
  assert.match(onboardingPage, /redirect\(skillCount === 0 \? "\/start" : "\/library"\)/)
})

test("route views stay native while real actions stay custom", async () => {
  for (const event of [
    "plugin_install_copied",
    "mcp_config_copied",
    "mcp_entry_clicked",
  ]) {
    assert.match(nextSteps, new RegExp(`event: "${event}"|${event}`))
    assert.match(events, new RegExp(`${event}: \\{`))
  }
  assert.match(inviteStep, /event: "team_invite_link_copied"/)
  assert.match(events, /mcp_config_copied: \{\n\s+client: [^\n]+\n\s+\}/)
  assert.match(
    nextSteps,
    /event: "mcp_config_copied",\n\s+properties: \{ client: "generic" \},/,
  )
  assert.match(mcpSetupGuide, /function configCopiedAnalytics\(client: McpClientAnalyticsId\)/)
  assert.match(mcpSetupGuide, /properties: \{ client \}/)
  assert.match(events, /surface: "first_skill_invite_step" \| "onboarding" \| "organization_settings"/)
  assert.match(events, /step: "first_skill" \| "invite_team"/)

  assert.doesNotMatch(events, /mcp_setup_viewed/)
  assert.doesNotMatch(events, /onboarding_steps_viewed/)
  assert.equal(await exists("../components/mcp-setup-analytics.tsx"), false)
  assert.equal(await exists("../components/onboarding-steps-analytics.tsx"), false)

  // Next.js starts PostHog once through its canonical client instrumentation
  // entry. PostHog then owns initial and history-change pageviews; the app only
  // keeps native user and team context current and never captures `$pageview`.
  assert.match(posthogClient, /capture_pageview: "history_change"/)
  assert.doesNotMatch(posthogClient, /capture_pageview: false/)
  assert.equal(await exists("../instrumentation-client.ts"), true)
  assert.match(
    instrumentationClient,
    /import \{ posthogReady \} from "@\/lib\/posthog-client"/,
  )
  assert.equal((instrumentationClient.match(/void posthogReady\(\)/g) ?? []).length, 2)
  assert.match(instrumentationClient, /window\.requestIdleCallback/)
  assert.match(instrumentationClient, /window\.setTimeout/)
  assert.doesNotMatch(appLayout, /getAppContext|PostHogRoute|Suspense/)
  assert.match(protectedAppShell, /const \{ session, organizations, activeId \} = await getAppContext\(\)/)
  assert.match(protectedAppShell, /<PostHogIdentity userId=\{session\.user\.id\} teamId=\{activeId\} \/>/)
  assert.match(posthogClient, /posthog\.identify\(userId\)/)
  assert.match(posthogClient, /posthog\.register\(\{ team_id: teamId \}\)/)
  assert.match(posthogClient, /posthog\.unregister\("team_id"\)/)
  assert.match(
    posthogIdentity,
    /syncPostHogIdentity\(\{\s*teamId,\s*userId,?\s*\}\)/,
  )
  assert.match(posthogIdentity, /userId:\s*string \| null/)
  assert.doesNotMatch(
    posthogIdentity,
    /PostHogBootstrap|posthogReady|useSelectedLayoutSegment|identityScoped/,
  )
  assert.doesNotMatch(rootLayout, /PostHogBootstrap/)
  for (const source of applicationSources) {
    assert.doesNotMatch(source, /\.capture\(\s*["'`]\$pageview["'`]/)
  }
  assert.match(analyticsClient, /posthogReady\(\)\.then\(\(posthog\) =>/)
  assert.doesNotMatch(analyticsClient, /queue|scope|team_id/)
  assert.equal(await exists("../components/posthog-analytics.tsx"), false)
  assert.equal(await exists("../lib/posthog-scope.ts"), false)
  assert.equal(await exists("../lib/posthog-scope-state.ts"), false)
  assert.equal(await exists("../lib/posthog-route-scope.ts"), false)

  // The global instrumentation entry starts native tracking for consent too;
  // the route component only resolves whether a user identity can be applied.
  assert.equal((consentPage.match(/<PostHogIdentity userId=\{null\} \/>/g) ?? []).length, 2)
  assert.equal(
    (consentPage.match(/<PostHogIdentity userId=\{session\.user\.id\} \/>/g) ?? []).length,
    1,
  )
})

test("team changes synchronize PostHog without delaying product updates", () => {
  assert.match(organizationActions, /teamId:\s*created\.id/)
  assert.match(
    organizationActions,
    /teamId:\s*accepted\.invitation\.organizationId/,
  )
  assert.doesNotMatch(organizationActions, /redirect\("\/library"\)/)

  assertPatternsInOrder(
    createOrganizationForm,
    [
      /await createOrganization\(/,
      /await authClient\.organization\.setActive\(/,
      /await syncPostHogTeam\(/,
      /router\.push\(/,
    ],
    "team creation",
  )
  assertPatternsInOrder(
    acceptInvitationForm,
    [/await acceptInvitation\(/, /await syncPostHogTeam\(/, /router\.push\(/],
    "invitation acceptance",
  )
  assertPatternsInOrder(
    organizationSwitcher,
    [
      /await (?:setActiveOrganization|authClient\.organization\.setActive)\(/,
      /router\.refresh\(/,
      /void syncPostHogTeam\(value\)\.catch\(/,
    ],
    "team switch",
  )
  assert.doesNotMatch(organizationSwitcher, /await syncPostHogTeam\(value\)/)
  assert.doesNotMatch(organizationSwitcher, /router\.(?:push|replace)\(/)
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
  for (const source of [connectPage, startPage, nextSteps, inviteStep]) {
    assert.doesNotMatch(source, dashPattern)
  }
})

test("the new copy keeps the product's own words", () => {
  for (const source of [connectPage, startPage, nextSteps, inviteStep]) {
    assert.doesNotMatch(source, /recommend/i)
    assert.doesNotMatch(source, /shared library/i)
  }
})
