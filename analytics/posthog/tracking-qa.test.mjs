import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import ts from "typescript"

async function importTypeScriptModule(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)
}

test("qualified visitor v1 is production-only and independent of conversion", async () => {
  const { qualifiedPublicVisitorDefinitionV1: definition } = await importTypeScriptModule(
    "./measurement-contract.ts",
  )

  assert.equal(definition.productionHost, "www.skillsboard.sh")
  assert.equal(definition.unit, "unique PostHog distinct_id")
  assert.equal(definition.attribution.applicationOwnedState, false)
  assert.equal(definition.attribution.outcomeUnit, "unique properties.team_id")
  assert.equal(definition.attribution.windowDays, 30)
  assert.match(definition.attribution.sourceProperties, /PostHog-native/)
  assert.equal(
    definition.attribution.touchpoint,
    "first qualified_public_visitor in the 30 days before team_created",
  )
  assert.deepEqual(definition.qualification.excludesConversionEvents, [
    "landing_cta_clicked",
    "signup_form_submitted",
    "team_created",
  ])
})

test("public surfaces are bounded", async () => {
  const { resolvePublicLandingSurface } = await importTypeScriptModule(
    "./measurement-contract.ts",
  )

  assert.equal(resolvePublicLandingSurface("/"), "home")
  assert.equal(resolvePublicLandingSurface("/guides/share-agent-skills-with-your-team"), "guide")
  assert.equal(resolvePublicLandingSurface("/resources"), "resources")
  assert.equal(resolvePublicLandingSurface("/library"), null)
})
