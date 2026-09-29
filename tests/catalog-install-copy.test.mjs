import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const dialog = await readText("../components/catalog-skill-details-dialog.tsx")
const events = await readText("../analytics/posthog/events.ts")
const results = await readText("../components/catalog-results.tsx")
const dossier = await readText("../components/skill-dossier.tsx")

async function readText(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

test("the catalog copy and exit events carry the public skill identifiers", () => {
  assert.match(
    events,
    /catalog_install_copied: \{\n\s+slug: string\n\s+source: string\n\s+surface: "card" \| "details"\n\s+\}/,
  )
  assert.match(
    events,
    /catalog_external_opened: \{\n\s+destination: "skills_sh"\n\s+slug: string\n\s+source: string\n\s+\}/,
  )
})

test("the install command copy in the details dialog reports the skill it copied", () => {
  assert.match(
    dialog,
    /event: "catalog_install_copied",\n\s+properties: \{\n\s+slug: item\.slug,\n\s+source: item\.source,\n\s+surface: "details",\n\s+\}/,
  )
})

test("the install command copy on the result card reports the same event", () => {
  assert.match(
    results,
    /commandAnalytics=\{\{\n\s+event: "catalog_install_copied",\n\s+properties: \{ slug: item\.slug, source: item\.source, surface: "card" \},\n\s+\}\}/,
  )
})

test("the card copy button receives the event the catalog hands it", () => {
  assert.match(
    dossier,
    /const copyAnalytics = getSkillUsageAnalytics\(tracking, "command"\) \?\? commandAnalytics/,
  )
  assert.match(dossier, /analytics=\{copyAnalytics\}/)
  assert.match(dossier, /commandAnalytics\?: ClientAnalyticsEvent/)
})

test("leaving for skills.sh is captured on the link itself", () => {
  assert.match(
    dialog,
    /event: "catalog_external_opened",\n\s+properties: \{\n\s+destination: "skills_sh",\n\s+slug: item\.slug,\n\s+source: item\.source,\n\s+\}/,
  )
  assert.match(dialog, /from "@\/lib\/analytics-client"/)
})

test("the dialog keeps its copy and its save outcome unchanged", () => {
  assert.match(dialog, /Open on skills\.sh/)
  assert.match(dialog, /Copy install command for \$\{name\}/)
  assert.match(dialog, /triggerLabel="Save to library"/)
})
