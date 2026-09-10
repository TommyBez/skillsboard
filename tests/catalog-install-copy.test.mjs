import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const dialog = await readText("../components/catalog-skill-details-dialog.tsx")
const events = await readText("../analytics/posthog/events.ts")

async function readText(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

test("the catalog copy and exit events carry the public skill identifiers", () => {
  assert.match(events, /catalog_install_copied: \{\n\s+slug: string\n\s+source: string\n\s+\}/)
  assert.match(
    events,
    /catalog_external_opened: \{\n\s+destination: "skills_sh"\n\s+slug: string\n\s+source: string\n\s+\}/,
  )
})

test("the install command copy in the details dialog reports the skill it copied", () => {
  assert.match(dialog, /event: "catalog_install_copied"/)
  assert.match(dialog, /properties: \{ slug: item\.slug, source: item\.source \}/)
})

test("leaving for skills.sh is captured on the link itself", () => {
  assert.match(dialog, /event: "catalog_external_opened"/)
  assert.match(dialog, /destination: "skills_sh"/)
  assert.match(dialog, /from "@\/lib\/analytics-client"/)
})

test("the dialog keeps its copy and its save outcome unchanged", () => {
  assert.match(dialog, /Open on skills\.sh/)
  assert.match(dialog, /Copy install command for \$\{name\}/)
  assert.match(dialog, /triggerLabel="Save to library"/)
})
