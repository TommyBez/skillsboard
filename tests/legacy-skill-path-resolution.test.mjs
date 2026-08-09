import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  decideLegacySkillPathPersistence,
  matchesRecoveredCanonicalName,
  resolveLegacySkillPaths,
} = await loadTsModule(
  new URL("../lib/legacy-skill-path-resolution.ts", import.meta.url),
)

const pdf = { name: "pdf", path: "skills/pdf" }
const docx = { name: "docx", path: "skills/docx" }

test("recovers a legacy path by exact canonical name in a multi-skill repository", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [pdf, docx],
    legacySkills: [{ id: "legacy-docx", skillName: "  DOCX " }],
  }), {
    ok: true,
    resolved: [{
      canonicalName: "docx",
      id: "legacy-docx",
      skillPath: "skills/docx",
    }],
  })
})

test("recovers distinct legacy skills from the same multi-skill repository", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [pdf, docx],
    legacySkills: [
      { id: "legacy-pdf", skillName: "pdf" },
      { id: "legacy-docx", skillName: "docx" },
    ],
  }), {
    ok: true,
    resolved: [
      { canonicalName: "pdf", id: "legacy-pdf", skillPath: "skills/pdf" },
      { canonicalName: "docx", id: "legacy-docx", skillPath: "skills/docx" },
    ],
  })
})

test("uses the sole valid candidate when an upstream skill was renamed", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [{ name: "current-name", path: "" }],
    legacySkills: [{ id: "legacy", skillName: "old-name" }],
  }), {
    ok: true,
    resolved: [{ canonicalName: "current-name", id: "legacy", skillPath: "" }],
  })
})

test("rejects a multi-skill repository without an exact saved-name match", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [pdf, docx],
    legacySkills: [{ id: "legacy", skillName: "slides" }],
  }), {
    ok: false,
    code: "ambiguous_candidates",
    skillId: "legacy",
    skillName: "slides",
  })
})

test("uses the only unclaimed candidate after accounting for verified skills", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [pdf, docx],
    claimedPaths: [docx.path],
    legacySkills: [{ id: "legacy-pdf", skillName: "old-pdf" }],
  }), {
    ok: true,
    resolved: [{
      canonicalName: "pdf",
      id: "legacy-pdf",
      skillPath: "skills/pdf",
    }],
  })
})

test("reserves exact legacy matches before assigning the only remaining candidate", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [pdf, docx],
    legacySkills: [
      { id: "legacy-docx", skillName: "docx" },
      { id: "legacy-pdf", skillName: "old-pdf" },
    ],
  }), {
    ok: true,
    resolved: [
      { canonicalName: "docx", id: "legacy-docx", skillPath: "skills/docx" },
      { canonicalName: "pdf", id: "legacy-pdf", skillPath: "skills/pdf" },
    ],
  })
})

test("does not infer paths when multiple legacy rows and candidates remain", () => {
  assert.equal(resolveLegacySkillPaths({
    candidates: [pdf, docx],
    legacySkills: [
      { id: "first", skillName: "old-first" },
      { id: "second", skillName: "old-second" },
    ],
  }).code, "ambiguous_candidates")
})

test("rejects repositories with no valid candidates", () => {
  assert.deepEqual(resolveLegacySkillPaths({
    candidates: [],
    legacySkills: [{ id: "legacy", skillName: "pdf" }],
  }), {
    ok: false,
    code: "no_candidates",
    skillId: "legacy",
    skillName: "pdf",
  })
})

test("rejects duplicate exact-name candidates instead of choosing by order", () => {
  const result = resolveLegacySkillPaths({
    candidates: [pdf, { name: "pdf", path: "other/pdf" }],
    legacySkills: [{ id: "legacy", skillName: "pdf" }],
  })

  assert.equal(result.ok, false)
  assert.equal(result.code, "ambiguous_candidates")
})

test("rejects duplicate candidate paths and paths already claimed by saved skills", () => {
  assert.equal(resolveLegacySkillPaths({
    candidates: [pdf, { name: "other", path: pdf.path }],
    legacySkills: [{ id: "legacy", skillName: "pdf" }],
  }).code, "path_collision")

  assert.equal(resolveLegacySkillPaths({
    candidates: [pdf],
    claimedPaths: [pdf.path],
    legacySkills: [{ id: "legacy", skillName: "pdf" }],
  }).code, "path_collision")

  assert.equal(resolveLegacySkillPaths({
    candidates: [pdf],
    claimedPaths: [docx.path, docx.path],
    legacySkills: [{ id: "legacy", skillName: "pdf" }],
  }).code, "path_collision")
})

test("does not assign one candidate to two legacy rows", () => {
  assert.equal(resolveLegacySkillPaths({
    candidates: [pdf],
    legacySkills: [
      { id: "first", skillName: "pdf" },
      { id: "second", skillName: "old-pdf" },
    ],
  }).code, "path_collision")
})

test("classifies persisted null, same, and different path states", () => {
  assert.equal(decideLegacySkillPathPersistence({
    currentPath: null,
    expectedPath: "skills/pdf",
    recoveredPath: "skills/pdf",
  }), "repair")
  assert.equal(decideLegacySkillPathPersistence({
    currentPath: "skills/pdf",
    expectedPath: "skills/pdf",
    recoveredPath: "skills/pdf",
  }), "unchanged")
  assert.equal(decideLegacySkillPathPersistence({
    currentPath: "skills/other",
    expectedPath: "skills/pdf",
    recoveredPath: "skills/pdf",
  }), "conflict")
  assert.equal(decideLegacySkillPathPersistence({
    currentPath: null,
    expectedPath: "skills/pdf",
    recoveredPath: null,
  }), "conflict")
})

test("detects canonical-name drift between discovery and packaging", () => {
  assert.equal(matchesRecoveredCanonicalName({
    actualName: "pdf",
    expectedName: "pdf",
  }), true)
  assert.equal(matchesRecoveredCanonicalName({
    actualName: "renamed-pdf",
    expectedName: "pdf",
  }), false)
  assert.equal(matchesRecoveredCanonicalName({
    actualName: "pdf",
    expectedName: null,
  }), true)
})
