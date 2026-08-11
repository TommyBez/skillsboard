import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

/**
 * A structural check, not behaviour: where the follow-up step lives is
 * invisible to a unit test and was wrong when the step first shipped.
 *
 * A save invalidates the library cache, and the refresh replaces the control
 * that started the save: the empty state becomes a results grid, a catalog
 * card becomes "In library". State held next to that control is discarded in
 * the same commit that sets it, so the step has to be owned by the app shell.
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
