"use client"

import { use } from "react"

import { SkillMdBuilder } from "@/components/skill-creator/skill-md-builder"
import type { SkillDraft } from "@/lib/skill-creator/skill-md"

/** The query key that names a GitHub URL to load into the form. */
export const SKILL_CREATOR_IMPORT_PARAM = "from"

export type SkillCreatorSearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * The builder, handed the page's `searchParams` promise.
 *
 * The page passes the promise down instead of awaiting it, and this component
 * sits inside a Suspense boundary there: the rest of the page stays in the
 * prerendered static shell, and only the tool resolves the query string. That
 * is the pattern the App Router documents for Cache Components, and the one
 * the sign-up page already uses. The builder itself takes a plain string.
 */
export function SkillCreatorTool({
  searchParams,
  ...props
}: {
  searchParams: SkillCreatorSearchParams
  exampleDraft: SkillDraft
  privacyNote: string
}) {
  const from = use(searchParams)[SKILL_CREATOR_IMPORT_PARAM]
  const importUrl = typeof from === "string" && from.trim() ? from.trim() : undefined
  return <SkillMdBuilder {...props} importUrl={importUrl} />
}
