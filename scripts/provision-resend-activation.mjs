#!/usr/bin/env node
/**
 * Create or update the Resend Account setup automation.
 *
 * Templates are the React Email trees in `emails/activation-*.tsx`, rendered
 * with Resend mustache placeholders. Idempotent. The automation stays disabled
 * unless you pass --enable.
 *
 *   pnpm email:provision-activation
 *   pnpm email:provision-activation -- --enable
 */

import { config } from "dotenv"
import { resolve } from "node:path"
import { Resend } from "resend"

import { loadTsxModule } from "./run-tsx.mjs"

config({ path: resolve(process.cwd(), ".env.local") })

const FROM = "Tommaso from Skills Board <tommaso@skillsboard.sh>"
const AUTOMATION_NAME = "Account setup"
const TEAM_CREATED = "team.created"
const SKILL_SAVED = "skill.saved"
const TEAM_NAME_PROPERTY = "team_name"

const enable = process.argv.includes("--enable")
const apiKey = process.env.RESEND_API_KEY?.trim()
if (!apiKey) {
  console.error("RESEND_API_KEY is not set. Add it to .env.local.")
  process.exit(1)
}

const resend = new Resend(apiKey)
const {
  ACTIVATION_RESEND_TEMPLATE_VARIABLES,
  renderActivationFirstSkillTemplate,
  renderActivationWelcomeTemplate,
} = await loadTsxModule("lib/email/activation-resend-templates.tsx")

function fail(label, error) {
  console.error(`${label}:`, error?.message ?? error)
  process.exit(1)
}

async function ensureEvent(name, schema) {
  const existing = await resend.events.get(name)
  if (existing.data) return existing.data
  const created = await resend.events.create({ name, schema })
  if (created.error) fail(`Create event ${name}`, created.error)
  return created.data
}

async function ensureTeamNameProperty() {
  const listed = await resend.contactProperties.list()
  if (listed.error) fail("List contact properties", listed.error)
  const found = listed.data?.data?.find((property) => property.key === TEAM_NAME_PROPERTY)
  if (found) return found
  const created = await resend.contactProperties.create({
    key: TEAM_NAME_PROPERTY,
    type: "string",
    fallbackValue: "your team",
  })
  if (created.error) fail("Create team_name property", created.error)
  return created.data
}

async function ensureTemplate(template) {
  const existing = await resend.templates.get(template.alias)
  if (existing.data) {
    const updated = await resend.templates.update(existing.data.id, {
      from: FROM,
      html: template.html,
      name: template.name,
      subject: template.subject,
      variables: ACTIVATION_RESEND_TEMPLATE_VARIABLES,
    })
    if (updated.error) fail(`Update template ${template.alias}`, updated.error)
    const published = await resend.templates.publish(existing.data.id)
    if (published.error) fail(`Publish template ${template.alias}`, published.error)
    return existing.data.id
  }

  const created = await resend.templates.create({
    alias: template.alias,
    from: FROM,
    html: template.html,
    name: template.name,
    subject: template.subject,
    variables: ACTIVATION_RESEND_TEMPLATE_VARIABLES,
  })
  if (created.error) fail(`Create template ${template.alias}`, created.error)
  const published = await resend.templates.publish(created.data.id)
  if (published.error) fail(`Publish template ${template.alias}`, published.error)
  return created.data.id
}

async function ensureAutomation({ welcomeId, firstSkillId }) {
  const listed = await resend.automations.list({ limit: 100 })
  if (listed.error) fail("List automations", listed.error)
  const found = listed.data?.data?.find((automation) => automation.name === AUTOMATION_NAME)
  const status = enable ? "enabled" : "disabled"
  const steps = [
    {
      key: "trigger_team_created",
      type: "trigger",
      config: { eventName: TEAM_CREATED },
    },
    {
      key: "send_welcome",
      type: "send_email",
      config: {
        from: FROM,
        template: {
          id: welcomeId,
          variables: { TEAM_NAME: { var: TEAM_NAME_PROPERTY } },
        },
      },
    },
    {
      key: "wait_for_first_skill",
      type: "wait_for_event",
      config: { eventName: SKILL_SAVED, timeout: "2 days" },
    },
    {
      key: "send_first_skill",
      type: "send_email",
      config: {
        from: FROM,
        template: {
          id: firstSkillId,
          variables: { TEAM_NAME: { var: TEAM_NAME_PROPERTY } },
        },
      },
    },
  ]
  const connections = [
    { from: "trigger_team_created", to: "send_welcome" },
    { from: "send_welcome", to: "wait_for_first_skill" },
    { from: "wait_for_first_skill", to: "send_first_skill", type: "timeout" },
  ]

  if (found) {
    const updated = await resend.automations.update(found.id, { connections, status, steps })
    if (updated.error) fail("Update automation", updated.error)
    return found.id
  }

  const created = await resend.automations.create({
    connections,
    name: AUTOMATION_NAME,
    status,
    steps,
  })
  if (created.error) fail("Create automation", created.error)
  return created.data.id
}

const welcome = await renderActivationWelcomeTemplate()
const firstSkill = await renderActivationFirstSkillTemplate()
const teamCreated = await ensureEvent(TEAM_CREATED, {
  organization_id: "string",
  team_name: "string",
})
const skillSaved = await ensureEvent(SKILL_SAVED, {
  organization_id: "string",
})
const teamNameProperty = await ensureTeamNameProperty()
const welcomeId = await ensureTemplate(welcome)
const firstSkillId = await ensureTemplate(firstSkill)
const automationId = await ensureAutomation({ firstSkillId, welcomeId })

console.log(JSON.stringify({
  automationId,
  enabled: enable,
  events: { skillSaved, teamCreated },
  templates: { firstSkillId, welcomeId },
  teamNameProperty,
}, null, 2))

if (!enable) {
  console.log("\nAutomation is disabled. Re-run with --enable after you authorize the first send.")
}
