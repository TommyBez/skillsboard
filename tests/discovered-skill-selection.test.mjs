import assert from "node:assert/strict"
import { test } from "node:test"

import { importTsFile } from "./helpers/load-ts.mjs"

const { pickDiscoveredSkill } = await importTsFile(
  new URL("../lib/discovered-skill-selection.ts", import.meta.url),
)

function skill(name, path = name) {
  return { name, path, description: `${name} description` }
}

test("picks the requested catalog skill out of a multi-skill repository", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx"), skill("xlsx", "skills/xlsx")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: null, requestedName: "docx" })?.path,
    "skills/docx",
  )
})

test("matches the requested name regardless of casing and padding", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: null, requestedName: "  DOCX  " })?.path,
    "skills/docx",
  )
})

test("prefers the requested name over the linked path", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: "skills/pdf", requestedName: "docx" })?.path,
    "skills/docx",
  )
})

test("falls back to the linked path when the catalog slug is absent", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: "skills/pdf", requestedName: "renamed" })?.path,
    "skills/pdf",
  )
})

test("falls back to the only skill a repository publishes", () => {
  const skills = [skill("renamed-upstream", "")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: null, requestedName: "old-slug" })?.path,
    "",
  )
})

test("returns null when a multi-skill repository no longer publishes the requested skill", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: null, requestedName: "gone" }),
    null,
  )
})

test("returns null for an unnamed request against a multi-skill repository", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx")]

  assert.equal(pickDiscoveredSkill({ skills, linkedSkillPath: null }), null)
})

test("returns null when the linked path is missing from the discovered skills", () => {
  const skills = [skill("pdf", "skills/pdf"), skill("docx", "skills/docx")]

  assert.equal(
    pickDiscoveredSkill({ skills, linkedSkillPath: "skills/vanished" }),
    null,
  )
})
