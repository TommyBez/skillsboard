import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

/**
 * Structural checks, in the same spirit as the first-skill invite flow suite:
 * these events fire from client components against a real browser store and a
 * dialog, so what is worth holding down is the shape of the instrumentation.
 *
 * The gap this covers: a view was recorded whether the library banner was open
 * or folded to its title, and nothing at all was recorded when the user closed
 * the first-skill dialog. A team could look like it had seen the ask five
 * times having read it once and refused it once.
 */
async function readSource(repoPath) {
  return readFile(new URL(`../${repoPath}`, import.meta.url), "utf8")
}

test("the answered event declares the four answers the two surfaces can give", async () => {
  const events = await readSource("analytics/posthog/events.ts")
  const declaration = events.slice(events.indexOf("team_invite_prompt_answered: {"))
  const body = declaration.slice(0, declaration.indexOf("}"))

  assert.notEqual(events.indexOf("team_invite_prompt_answered: {"), -1)
  assert.match(
    body,
    /answer: "collapsed" \| "dismissed" \| "expanded" \| "not_now"/,
  )
  assert.match(body, /actor_is_skill_creator: boolean/)
  assert.match(
    body,
    /surface: "first_skill_invite_step" \| "library_after_first_skill"/,
  )
})

test("the viewed event carries an optional state, so older events stay valid", async () => {
  const events = await readSource("analytics/posthog/events.ts")
  const declaration = events.slice(events.indexOf("team_invite_prompt_viewed: {"))
  const body = declaration.slice(0, declaration.indexOf("\n  }"))

  assert.match(body, /state\?: "collapsed" \| "expanded"/)
})

test("the library banner reports how the ask looked and what was done with it", async () => {
  const banner = await readSource("components/invite-teammate-prompt.tsx")
  const viewed = banner.indexOf('captureAnalyticsEvent("team_invite_prompt_viewed"')

  assert.notEqual(viewed, -1)
  assert.match(banner.slice(viewed, viewed + 400), /state: next,/)

  const persist = banner.indexOf("function persist(next: BannerState)")
  const persistBody = banner.slice(persist, banner.indexOf("\n  }", persist))

  assert.match(persistBody, /captureAnalyticsEvent\("team_invite_prompt_answered"/)
  assert.match(persistBody, /answer: next,/)
  assert.match(persistBody, /surface: "library_after_first_skill",/)
  assert.ok(
    persistBody.indexOf("writeInvitePromptState(teamId, next)") <
      persistBody.indexOf("team_invite_prompt_answered"),
    "the choice is persisted first, the report follows",
  )
})

test("the first-skill dialog records not_now only when no invitation was attempted", async () => {
  const step = await readSource("components/first-skill-invite-step.tsx")
  const viewed = step.indexOf('captureAnalyticsEvent("team_invite_prompt_viewed"')

  assert.match(step.slice(viewed, viewed + 400), /state: "expanded",/)

  const handler = step.indexOf("function handleOpenChange(nextOpen: boolean)")
  const handlerBody = step.slice(handler, step.indexOf("\n  }", handler))

  assert.match(handlerBody, /if \(!nextOpen\)/)
  assert.match(handlerBody, /if \(!invitationAttempted\.current\)/)
  assert.match(handlerBody, /answer: "not_now",/)
  assert.match(handlerBody, /surface: "first_skill_invite_step",/)
  assert.match(handlerBody, /actor_is_skill_creator: true,/)

  assert.match(step, /const invitationAttempted = useRef\(false\)/)
  assert.match(step, /invitationAttempted\.current = true/)
  assert.ok(
    step.indexOf("invitationAttempted.current = true") >
      step.indexOf('captureAnalyticsEvent("team_invite_prompt_clicked"') - 200,
    "the flag is set on the same submit that reports the click",
  )
})
