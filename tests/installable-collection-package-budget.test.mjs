import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const { createCollectionArchiveBudget } = await loadTsModule(
  new URL("../lib/installable-collection-package-budget.ts", import.meta.url),
)

test("accepts collection archive totals exactly at both limits", () => {
  const budget = createCollectionArchiveBudget({ artifactBytes: 10, sourceBytes: 20 })

  assert.deepEqual(budget.add({ artifactBytes: 4, sourceBytes: 8 }), { ok: true })
  assert.deepEqual(budget.add({ artifactBytes: 6, sourceBytes: 12 }), { ok: true })
})

test("rejects the archive that first exceeds the artifact limit", () => {
  const budget = createCollectionArchiveBudget({ artifactBytes: 10, sourceBytes: 100 })

  assert.deepEqual(budget.add({ artifactBytes: 8, sourceBytes: 10 }), { ok: true })
  assert.deepEqual(
    budget.add({ artifactBytes: 3, sourceBytes: 10 }),
    { limit: "artifact", ok: false },
  )
})

test("counts repeated use of the same archive toward the collection total", () => {
  const budget = createCollectionArchiveBudget({ artifactBytes: 10, sourceBytes: 100 })
  const archive = { artifactBytes: 6, sourceBytes: 10 }

  assert.deepEqual(budget.add(archive), { ok: true })
  assert.deepEqual(budget.add(archive), { limit: "artifact", ok: false })
})

test("rejects the archive that first exceeds the source limit", () => {
  const budget = createCollectionArchiveBudget({ artifactBytes: 100, sourceBytes: 20 })

  assert.deepEqual(budget.add({ artifactBytes: 10, sourceBytes: 18 }), { ok: true })
  assert.deepEqual(
    budget.add({ artifactBytes: 10, sourceBytes: 3 }),
    { limit: "source", ok: false },
  )
})
