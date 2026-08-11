import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

/**
 * Structural checks, not behaviour: the two properties held down here are
 * invisible to a unit test and were both wrong when the step first shipped.
 *
 * One is where the follow-up step lives. A save invalidates the library cache,
 * and the refresh replaces the control that started the save: the empty state
 * becomes a results grid, a catalog card becomes "In library". State held next
 * to that control is discarded in the same commit that sets it, so the step
 * has to be owned by the app shell.
 *
 * The other is the first-save read. Reproducing that race needs two concurrent
 * connections to a real database, which this suite does not have, so what is
 * asserted is the one arrangement that makes the read trustworthy: insert and
 * count in a single transaction, behind a lock keyed to the organization.
 */
async function readSource(repoPath) {
  return readFile(new URL(`../${repoPath}`, import.meta.url), "utf8")
}

test("the app shell owns the invite step, so a list refresh cannot discard it", async () => {
  const shell = await readSource("components/protected-app-shell.tsx")

  assert.match(shell, /<FirstSkillInviteProvider>/)
  assert.ok(
    shell.indexOf("<FirstSkillInviteProvider>") < shell.indexOf("{children}"),
    "every save surface has to render inside the provider",
  )
  assert.ok(
    shell.indexOf("{children}") < shell.indexOf("</FirstSkillInviteProvider>"),
  )
})

test("the save dialog asks the shell to open the step instead of hosting it", async () => {
  const dialog = await readSource("components/add-skill-dialog.tsx")

  assert.equal(dialog.includes("FirstSkillInviteStep"), false)
  assert.match(dialog, /openFirstSkillInvite\?\.\(result\.inviteTeammateStep\.teamId\)/)
})

test("a team that dismissed the ask is not asked again on the next first save", async () => {
  const provider = await readSource("components/first-skill-invite-provider.tsx")
  const guard = provider.indexOf('readInvitePromptState(nextTeamId) === "dismissed"')

  assert.notEqual(guard, -1)
  assert.ok(
    guard < provider.indexOf("setTeamId(nextTeamId)"),
    "the persisted record is read before the step opens and reports a view",
  )
})

test("the first-save read is serialized per organization", async () => {
  const saveSkill = await readSource("lib/save-skill.ts")

  const transaction = saveSkill.indexOf("await db.transaction(")
  const lock = saveSkill.indexOf(
    "pg_advisory_xact_lock(hashtextextended(${input.organizationId}, 0))",
  )
  const insert = saveSkill.indexOf("tx.insert(skill)")
  const countInTransaction = saveSkill.indexOf(
    "countOrganizationSkills(input.organizationId, tx)",
  )

  assert.notEqual(transaction, -1)
  assert.ok(transaction < lock, "the lock is taken inside the transaction")
  assert.ok(lock < insert, "the lock is taken before the insert")
  assert.ok(insert < countInTransaction, "the count reads the transaction's own insert")
  assert.equal(
    saveSkill.includes("countOrganizationSkills(input.organizationId)"),
    false,
    "no count outside the locked transaction",
  )
})
