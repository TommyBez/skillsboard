/**
 * Top-level route, for the same reason /agent-skills and /manage-ai-skills
 * are: the page answers the head query itself rather than a task-shaped
 * variation of it, so it does not sit under /guides. It is also not a guide:
 * the payload is a generator that runs in the browser, and the prose under it
 * exists to explain what the generator produced.
 *
 * The path does not end in `-skills`, so the shared Markdown content
 * negotiation rewrite does not reach it. That is deliberate. The Markdown
 * twins are built from the content registries and render a page as an
 * article; a text rendering of a form would be a worse answer than the guide
 * already published at /guides/how-to-write-a-skill-md, which is the page an
 * agent asking for Markdown should get.
 */
export const skillCreatorPath = "/skill-creator" as const

export type SkillCreatorPath = typeof skillCreatorPath

/**
 * CTA placements on this page, kept in sync with the landing_cta_clicked
 * union. The sticky shell CTA is skill_creator_header, following the naming
 * every other marketing chrome uses for its nav slot.
 *
 * There is no hero placement, unlike every article page. The action above the
 * fold here is the generator, and putting a sign-up button in front of it
 * would trade the reason the reader arrived for a click they did not come for.
 */
export type SkillCreatorCtaPlacement = `skill_creator_${"inline" | "closing"}`
