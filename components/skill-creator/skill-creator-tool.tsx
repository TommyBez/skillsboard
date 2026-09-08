import { SkillMdBuilder } from "@/components/skill-creator/skill-md-builder"
import type { SkillDraft } from "@/lib/skill-creator/skill-md"

/** The query key that names a GitHub URL to load into the form. */
export const SKILL_CREATOR_IMPORT_PARAM = "from"

export type SkillCreatorSearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * The builder, handed the page's `searchParams` promise.
 *
 * A server component that awaits the promise inside the Suspense boundary
 * the page wraps it in, the way the sign-up page reads its own query string:
 * the rest of the page stays in the prerendered static shell, only this hole
 * resolves at request time, and the client builder receives a plain string.
 */
export async function SkillCreatorTool({
  searchParams,
  ...props
}: {
  searchParams: SkillCreatorSearchParams
  exampleDraft: SkillDraft
  privacyNote: string
}) {
  const from = (await searchParams)[SKILL_CREATOR_IMPORT_PARAM]
  const importUrl = typeof from === "string" && from.trim() ? from.trim() : undefined
  return <SkillMdBuilder {...props} importUrl={importUrl} />
}
