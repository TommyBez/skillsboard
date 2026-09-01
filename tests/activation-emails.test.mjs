import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  ACTIVATION_FIRST_SKILL,
  ACTIVATION_WELCOME,
  activationSelectionCutoff,
  decideActivationEmail,
  isActivationEmailsEnabled,
  parseActivationBackfillStartedAt,
  resolveActivationAnchor,
} = await loadTsModule(new URL("../lib/activation-emails.ts", import.meta.url))

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000
const TEAM_CREATED_AT = new Date("2026-09-01T09:00:00.000Z")

function candidate(overrides = {}) {
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

function decide({ now, backfillStartedAt = null, ...overrides }) {
  return decideActivationEmail({
    candidate: candidate(overrides),
    config: { backfillStartedAt },
    now,
  })
}

function at(offsetMilliseconds) {
  return new Date(TEAM_CREATED_AT.getTime() + offsetMilliseconds)
}

test("selects the welcome on the first run after the team was created", () => {
  const decision = decide({ now: at(4 * HOUR) })
  assert.deepEqual(decision, {
    automationKey: ACTIVATION_WELCOME,
    daysSinceTeamCreated: 0,
    send: true,
    variant: "new",
  })
})

test("selects the first skill reminder one day after the welcome", () => {
  const decision = decide({
    now: at(DAY + 4 * HOUR),
    sends: [{ automationKey: ACTIVATION_WELCOME, sentAt: at(4 * HOUR) }],
  })
  assert.equal(decision.send, true)
  assert.equal(decision.automationKey, ACTIVATION_FIRST_SKILL)
  assert.equal(decision.daysSinceTeamCreated, 1)
})

test("holds the first skill reminder until a day has passed, and drops it after two", () => {
  const sends = [{ automationKey: ACTIVATION_WELCOME, sentAt: at(0) }]
  assert.deepEqual(
    decide({ now: at(20 * HOUR), sends }),
    { reason: "sent_within_last_day", send: false },
  )
  assert.deepEqual(
    decide({ now: at(3 * DAY), sends }),
    { reason: "first_skill_window_passed", send: false },
  )
})

test("does not remind a team that already saved a skill", () => {
  const decision = decide({
    now: at(DAY + 4 * HOUR),
    sends: [{ automationKey: ACTIVATION_WELCOME, sentAt: at(4 * HOUR) }],
    skillCount: 1,
  })
  assert.deepEqual(decision, { reason: "skill_already_saved", send: false })
})

test("ends the sequence once both messages have been sent", () => {
  const decision = decide({
    now: at(5 * DAY),
    sends: [
      { automationKey: ACTIVATION_WELCOME, sentAt: at(0) },
      { automationKey: ACTIVATION_FIRST_SKILL, sentAt: at(DAY) },
    ],
  })
  assert.deepEqual(decision, { reason: "sequence_complete", send: false })
})

test("closes the window 14 days after the team was created", () => {
  assert.equal(decide({ now: at(13 * DAY) }).send, true)
  assert.deepEqual(
    decide({ now: at(14 * DAY) }),
    { reason: "window_closed", send: false },
  )
})

test("anchors the window of an older team to the backfill start", () => {
  const backfillStartedAt = new Date("2026-09-10T00:00:00.000Z")
  assert.deepEqual(
    resolveActivationAnchor({ backfillStartedAt, organizationCreatedAt: TEAM_CREATED_AT }),
    backfillStartedAt,
  )
  // A team created after the sequence was enabled keeps its own creation date.
  const laterTeam = new Date("2026-09-20T00:00:00.000Z")
  assert.deepEqual(
    resolveActivationAnchor({ backfillStartedAt, organizationCreatedAt: laterTeam }),
    laterTeam,
  )

  const decision = decide({
    backfillStartedAt,
    now: new Date(backfillStartedAt.getTime() + 3 * HOUR),
  })
  assert.equal(decision.send, true)
  assert.equal(decision.automationKey, ACTIVATION_WELCOME)
  // Nine days old: the first day wording would be false, so the honest variant wins.
  assert.equal(decision.variant, "backfill")
  assert.equal(decision.daysSinceTeamCreated, 8)

  assert.deepEqual(
    decide({
      backfillStartedAt,
      now: new Date(backfillStartedAt.getTime() + 14 * DAY),
    }),
    { reason: "window_closed", send: false },
  )
})

test("keeps an older team out of the sequence when no backfill start is configured", () => {
  assert.deepEqual(
    decide({ now: at(30 * DAY) }),
    { reason: "window_closed", send: false },
  )
})

test("waits for a backfill start that is still in the future", () => {
  const backfillStartedAt = new Date("2026-09-10T00:00:00.000Z")
  assert.deepEqual(
    decide({ backfillStartedAt, now: new Date("2026-09-09T00:00:00.000Z") }),
    { reason: "window_not_open", send: false },
  )
})

test("sends at most one email per person per day", () => {
  const decision = decide({
    now: at(DAY),
    sends: [{ automationKey: ACTIVATION_WELCOME, sentAt: at(6 * HOUR) }],
  })
  assert.deepEqual(decision, { reason: "sent_within_last_day", send: false })
})

test("stops for good at three proactive emails per person", () => {
  const decision = decide({
    now: at(6 * DAY),
    sends: [
      { automationKey: ACTIVATION_WELCOME, sentAt: at(0) },
      { automationKey: ACTIVATION_FIRST_SKILL, sentAt: at(DAY) },
      { automationKey: "activation_invite", sentAt: at(2 * DAY) },
    ],
  })
  assert.deepEqual(decision, { reason: "per_person_cap_reached", send: false })
})

test("an active suppression or an unverified address blocks the send", () => {
  assert.deepEqual(
    decide({ hasActiveSuppression: true, now: at(4 * HOUR) }),
    { reason: "suppressed", send: false },
  )
  assert.deepEqual(
    decide({ emailVerified: false, now: at(4 * HOUR) }),
    { reason: "email_unverified", send: false },
  )
})

test("the selection reads every team while the backfill window is open", () => {
  const backfillStartedAt = new Date("2026-09-10T00:00:00.000Z")
  assert.equal(
    activationSelectionCutoff({
      backfillStartedAt,
      now: new Date(backfillStartedAt.getTime() + 2 * DAY),
    }),
    null,
  )
  assert.deepEqual(
    activationSelectionCutoff({
      backfillStartedAt,
      now: new Date(backfillStartedAt.getTime() + 14 * DAY),
    }),
    new Date(backfillStartedAt.getTime()),
  )
  const now = new Date("2026-10-01T00:00:00.000Z")
  assert.deepEqual(
    activationSelectionCutoff({ backfillStartedAt: null, now }),
    new Date(now.getTime() - 14 * DAY),
  )
})

test("reads the enabling flag and the backfill date strictly", () => {
  assert.equal(isActivationEmailsEnabled("true"), true)
  assert.equal(isActivationEmailsEnabled(" true "), true)
  assert.equal(isActivationEmailsEnabled("TRUE"), false)
  assert.equal(isActivationEmailsEnabled("1"), false)
  assert.equal(isActivationEmailsEnabled(undefined), false)

  assert.deepEqual(
    parseActivationBackfillStartedAt("2026-09-10"),
    new Date("2026-09-10T00:00:00.000Z"),
  )
  assert.equal(parseActivationBackfillStartedAt(""), null)
  assert.equal(parseActivationBackfillStartedAt("not a date"), null)
  assert.equal(parseActivationBackfillStartedAt(undefined), null)
})

test("the cron answers with a dry run report before any send when the flag is off", async () => {
  const route = await readFile(
    new URL("../app/api/cron/activation-emails/route.ts", import.meta.url),
    "utf8",
  )
  const guardIndex = route.indexOf("if (!enabled) {")
  const dryRunIndex = route.indexOf("dryRun: true")
  const sendIndex = route.indexOf("await sendActivationEmail(")
  assert.ok(guardIndex > 0, "the route has to gate on the enabling flag")
  assert.ok(dryRunIndex > guardIndex, "the disabled branch reports a dry run")
  assert.ok(sendIndex > dryRunIndex, "no send can happen before the disabled branch returns")
  assert.ok(route.includes("hasValidCronAuthorization"), "the route stays behind CRON_SECRET")
  assert.ok(route.includes("export const maxDuration = 60"))
})

test("the daily cron entry is wired to the activation route", async () => {
  const vercelConfig = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  )
  assert.deepEqual(
    vercelConfig.crons.find((entry) => entry.path === "/api/cron/activation-emails"),
    { path: "/api/cron/activation-emails", schedule: "0 13 * * *" },
  )
})

test("the activation copy keeps the rules the templates are written under", async () => {
  const files = [
    "../emails/activation-welcome.tsx",
    "../emails/activation-first-skill.tsx",
    "../emails/components/activation-footer.tsx",
  ]
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8")
    assert.ok(!source.includes("—"), `${file} must not use an em dash`)
    assert.ok(!source.includes("–"), `${file} must not use an en dash`)
    assert.ok(!/shared library/i.test(source), `${file} must not call it a shared library`)
    assert.ok(!/recommend/i.test(source), `${file} must not recommend skills`)
    assert.ok(!/opted in/i.test(source), `${file} must not claim an opt-in that is not there`)
  }
})
