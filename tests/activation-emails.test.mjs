import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  ACTIVATION_FIRST_SKILL,
  ACTIVATION_RESEND_SKILL_SAVED,
  ACTIVATION_RESEND_TEAM_CREATED,
  ACTIVATION_WELCOME,
  daysSinceDate,
  firstNameFromUserName,
  parseIsoDate,
  planActivationBackfillSends,
  resolveActivationWelcomeVariant,
} = await loadTsModule(new URL("../lib/activation-emails.ts", import.meta.url))

const DAY = 24 * 60 * 60 * 1000
const TEAM_CREATED_AT = new Date("2026-09-01T09:00:00.000Z")

function at(offsetMilliseconds) {
  return new Date(TEAM_CREATED_AT.getTime() + offsetMilliseconds)
}

test("the welcome wording follows the library, then the team's age", () => {
  assert.equal(
    resolveActivationWelcomeVariant({ daysSinceTeamCreated: 0, skillCount: 0 }),
    "new",
  )
  assert.equal(
    resolveActivationWelcomeVariant({ daysSinceTeamCreated: 3, skillCount: 0 }),
    "backfill",
  )
  assert.equal(
    resolveActivationWelcomeVariant({ daysSinceTeamCreated: 0, skillCount: 1 }),
    "saved",
  )
  assert.equal(
    resolveActivationWelcomeVariant({ daysSinceTeamCreated: 20, skillCount: 4 }),
    "saved",
  )
})

test("days since a date never go negative", () => {
  assert.equal(daysSinceDate(at(4 * DAY), TEAM_CREATED_AT), 4)
  assert.equal(daysSinceDate(TEAM_CREATED_AT, at(DAY)), 0)
})

test("reads an ISO backfill cutoff strictly", () => {
  assert.deepEqual(parseIsoDate("2026-09-10"), new Date("2026-09-10T00:00:00.000Z"))
  assert.equal(parseIsoDate(""), null)
  assert.equal(parseIsoDate("not a date"), null)
  assert.equal(parseIsoDate(undefined), null)
})

test("takes the first word of a name and nothing else", () => {
  assert.equal(firstNameFromUserName("Sam Taylor"), "Sam")
  assert.equal(firstNameFromUserName("  "), null)
  assert.equal(firstNameFromUserName(null), null)
})

function backfillCandidate(overrides = {}) {
  return {
    emailVerified: true,
    hasActiveSuppression: false,
    organizationCreatedAt: TEAM_CREATED_AT,
    organizationId: "org_northwind",
    sends: [],
    skillCount: 0,
    userId: "user_creator",
    ...overrides,
  }
}

test("the backfill plans welcome and first-skill for an empty library", () => {
  const planned = planActivationBackfillSends({
    candidate: backfillCandidate(),
    now: at(20 * DAY),
  })
  assert.deepEqual(
    planned.map((plan) => plan.automationKey),
    [ACTIVATION_WELCOME, ACTIVATION_FIRST_SKILL],
  )
})

test("the backfill skips the first-skill reminder once the library has a skill", () => {
  const planned = planActivationBackfillSends({
    candidate: backfillCandidate({ skillCount: 1 }),
    now: at(20 * DAY),
  })
  assert.deepEqual(
    planned.map((plan) => plan.automationKey),
    [ACTIVATION_WELCOME],
  )
})

test("the backfill skips unverified and delivery-blocked creators", () => {
  assert.deepEqual(
    planActivationBackfillSends({
      candidate: backfillCandidate({ emailVerified: false }),
      now: at(20 * DAY),
    }),
    [],
  )
  assert.deepEqual(
    planActivationBackfillSends({
      candidate: backfillCandidate({ hasActiveSuppression: true }),
      now: at(20 * DAY),
    }),
    [],
  )
})

test("the backfill skips a message already recorded for that person", () => {
  const planned = planActivationBackfillSends({
    candidate: backfillCandidate({
      sends: [{ automationKey: ACTIVATION_WELCOME, sentAt: at(DAY) }],
    }),
    now: at(20 * DAY),
  })
  assert.deepEqual(
    planned.map((plan) => plan.automationKey),
    [ACTIVATION_FIRST_SKILL],
  )
})

test("the daily cron is gone and the backfill route is dry-run by default", async () => {
  const vercelConfig = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  )
  assert.equal(
    vercelConfig.crons.find((entry) => entry.path === "/api/cron/activation-emails"),
    undefined,
  )

  const route = await readFile(
    new URL("../app/api/activation-backfill/route.ts", import.meta.url),
    "utf8",
  )
  assert.ok(route.includes("hasValidCronAuthorization"), "the route stays behind CRON_SECRET")
  assert.ok(route.includes('url.searchParams.get("send") === "true"'))
  assert.ok(route.includes("runActivationBackfill"))
  assert.ok(route.includes("export const maxDuration = 60"))
})

test("creating a team enrolls the creator; saving a skill notifies Resend", async () => {
  const create = await readFile(
    new URL("../app/actions/organizations.ts", import.meta.url),
    "utf8",
  )
  assert.ok(create.includes("enrollActivationSequence("))
  assert.ok(create.includes("event: \"team_created\""))
  assert.ok(
    create.indexOf("event: \"team_created\"") < create.indexOf("enrollActivationSequence("),
    "PostHog team_created still fires, then Resend is enrolled",
  )

  const saveSkill = await readFile(new URL("../lib/save-skill.ts", import.meta.url), "utf8")
  const insert = saveSkill.indexOf("tx.insert(skill)")
  const notify = saveSkill.indexOf("notifyActivationSkillSaved(input.organizationId)")
  assert.ok(insert > 0 && notify > insert, "the Resend event is sent after the insert commits")
})

test("a marketing opt-out does not block the welcome; an all suppression does", async () => {
  const send = await readFile(
    new URL("../lib/email/send-activation-email.tsx", import.meta.url),
    "utf8",
  )
  assert.ok(send.includes("assertTransactionalEmailAllowed"))
  assert.ok(!send.includes("activeSuppressionReasons.length > 0"))
  assert.ok(send.includes('preference.eligibilityReason === "email_unverified"'))

  const enroll = await readFile(
    new URL("../lib/email/resend-activation.ts", import.meta.url),
    "utf8",
  )
  assert.ok(enroll.includes(`event: ACTIVATION_RESEND_TEAM_CREATED`))
  assert.ok(enroll.includes(`event: ACTIVATION_RESEND_SKILL_SAVED`))
  assert.ok(enroll.includes("EmailPreferenceBlockedError"))

  const candidates = await readFile(
    new URL("../lib/db/activation-candidates.ts", import.meta.url),
    "utf8",
  )
  assert.ok(candidates.includes('eq(emailSuppression.scope, "all")'))
  assert.ok(!candidates.includes('inArray(emailSuppression.scope, ["all", "marketing"])'))
})

test("the provisioned automation waits for skill.saved before the reminder", async () => {
  const provision = await readFile(
    new URL("../scripts/provision-resend-activation.mjs", import.meta.url),
    "utf8",
  )
  assert.ok(provision.includes(`const TEAM_CREATED = "${ACTIVATION_RESEND_TEAM_CREATED}"`))
  assert.ok(provision.includes(`const SKILL_SAVED = "${ACTIVATION_RESEND_SKILL_SAVED}"`))
  assert.ok(provision.includes("eventName: TEAM_CREATED"))
  assert.ok(provision.includes("eventName: SKILL_SAVED"))
  assert.ok(provision.includes('type: "wait_for_event"'))
  assert.ok(provision.includes('type: "timeout"'))
  assert.ok(provision.includes("timeout: \"2 days\""))
  assert.ok(provision.includes("loadTsxModule(\"lib/email/activation-resend-templates.tsx\")"))
  assert.ok(provision.includes("renderActivationWelcomeTemplate"))
  assert.ok(provision.includes("renderActivationFirstSkillTemplate"))
  assert.ok(provision.includes("disabled"))
  assert.ok(provision.includes("--enable"))
})

test("Resend templates are the React Email trees with mustache placeholders", async () => {
  const { loadTsxModule } = await import(
    new URL("../scripts/run-tsx.mjs", import.meta.url)
  )
  const {
    renderActivationFirstSkillTemplate,
    renderActivationWelcomeTemplate,
  } = await loadTsxModule("lib/email/activation-resend-templates.tsx")

  const welcome = await renderActivationWelcomeTemplate()
  const firstSkill = await renderActivationFirstSkillTemplate()

  for (const template of [welcome, firstSkill]) {
    assert.ok(template.html.includes("{{{TEAM_NAME}}}"))
    assert.ok(template.html.includes("{{{FIRST_NAME|there}}}"))
    assert.ok(template.html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}"))
    assert.ok(template.html.includes("https://www.skillsboard.sh/email/logo-mark.png"))
    assert.ok(!template.html.includes("/static/logo-mark.png"))
    assert.ok(!template.html.includes("preview-token"))
    assert.ok(template.subject.includes("{{{TEAM_NAME}}}"))
  }
  assert.equal(welcome.alias, "activation-welcome")
  assert.equal(firstSkill.alias, "activation-first-skill")
  assert.match(welcome.html, /Thanks for creating/)
  assert.match(firstSkill.html, /does not have a skill/)
})

test("the backfill script is dry-run unless --send is passed", async () => {
  const script = await readFile(
    new URL("../scripts/backfill-activation-emails.mjs", import.meta.url),
    "utf8",
  )
  assert.ok(script.includes('process.argv.includes("--send")'))
  assert.ok(script.includes("/api/activation-backfill"))
  assert.ok(script.includes("Dry run"))

  const runner = await readFile(
    new URL("../lib/email/run-activation-backfill.ts", import.meta.url),
    "utf8",
  )
  assert.ok(runner.includes("planActivationBackfillSends"))
  assert.ok(runner.includes("plan.automationKey"))
  assert.ok(runner.includes("if (!input.send)"))
})

test("the activation copy keeps the rules the templates are written under", async () => {
  const files = [
    "../emails/activation-welcome.tsx",
    "../emails/activation-first-skill.tsx",
    "../emails/components/activation-footer.tsx",
    "../lib/email/activation-resend-templates.tsx",
    "../scripts/provision-resend-activation.mjs",
  ]
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8")
    assert.ok(!source.includes("—"), `${file} must not use an em dash`)
    assert.ok(!source.includes("–"), `${file} must not use an en dash`)
    assert.ok(!/shared library/i.test(source), `${file} must not call it a shared library`)
    assert.ok(!/recommend/i.test(source), `${file} must not recommend skills`)
    assert.ok(!/opted in/i.test(source), `${file} must not claim an opt-in that is not there`)
  }
  assert.equal(ACTIVATION_WELCOME, "activation_welcome")
  assert.equal(ACTIVATION_FIRST_SKILL, "activation_first_skill")
})

test("the candidate selection walks every page instead of a fixed first page", async () => {
  const source = await readFile(
    new URL("../lib/db/activation-candidates.ts", import.meta.url),
    "utf8",
  )
  assert.ok(
    source.includes("asc(organization.createdAt), asc(organization.id)"),
    "the walk is ordered oldest team first, with the id as a tiebreak",
  )
  assert.ok(!source.includes("desc(organization.createdAt)"), "no newest-first fixed page")
  assert.ok(source.includes("cursor"), "pages advance through a keyset cursor")
  assert.ok(source.includes("lt(organization.createdAt, before)"))
})

test("the welcome wording is resolved from the library at send time", async () => {
  const source = await readFile(
    new URL("../lib/email/send-activation-email.tsx", import.meta.url),
    "utf8",
  )
  const countIndex = source.indexOf("countOrganizationSkills(input.organizationId)")
  const firstSkillSkip = source.indexOf("ACTIVATION_FIRST_SKILL && skillCount > 0")
  const claimIndex = source.indexOf(".insert(emailAutomationSend)")
  assert.ok(countIndex > 0, "the send reads the current library size")
  assert.ok(firstSkillSkip > countIndex, "the first-skill reminder is dropped if the library filled")
  assert.ok(claimIndex > firstSkillSkip, "and both reads happen before the row is claimed")
})

test("the claimed send register row is released only on an answered refusal", async () => {
  const source = await readFile(
    new URL("../lib/email/send-activation-email.tsx", import.meta.url),
    "utf8",
  )
  const clientIndex = source.indexOf("const client = getResendClient()")
  const claimIndex = source.indexOf(".insert(emailAutomationSend)")
  assert.ok(clientIndex > 0 && clientIndex < claimIndex, "a missing key consumes no claim")

  const catchIndex = source.indexOf("} catch (thrown) {")
  const answeredIndex = source.indexOf("const { data, error } = sent")
  assert.ok(catchIndex > 0 && answeredIndex > catchIndex)
  const ambiguousBranch = source.slice(catchIndex, answeredIndex)
  assert.ok(
    !ambiguousBranch.includes("delete("),
    "a request that throws is ambiguous, so at most once wins and the claim stays",
  )
  assert.ok(
    source.slice(answeredIndex).includes(".delete(emailAutomationSend)"),
    "an answered refusal releases the claim for a later run",
  )
})

test("the send register outlives the team it was sent about", async () => {
  const schema = await readFile(new URL("../lib/db/schema.ts", import.meta.url), "utf8")
  const table = schema.slice(
    schema.indexOf("export const emailAutomationSend = pgTable"),
    schema.indexOf("export const jwks"),
  )
  assert.ok(
    table.includes('name: "emailAutomationSend_organizationId_fkey",\n  }).onDelete("set null")'),
    "deleting a team must not erase the backfill history of the person who created it",
  )
})
