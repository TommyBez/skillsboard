"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { SkillMdBuilder } from "@/components/skill-creator/skill-md-builder"
import type { SkillDraft } from "@/lib/skill-creator/skill-md"

/** The query key that names a GitHub URL to load into the form. */
export const SKILL_CREATOR_IMPORT_PARAM = "from"

interface SkillCreatorToolProps {
  exampleDraft: SkillDraft
  privacyNote: string
}

function ToolWithImport(props: SkillCreatorToolProps) {
  const from = useSearchParams().get(SKILL_CREATOR_IMPORT_PARAM)?.trim()
  return <SkillMdBuilder {...props} importUrl={from || undefined} />
}

/**
 * The builder, with `?from=` read the way the App Router wants it read.
 *
 * `useSearchParams` makes the subtree that calls it render on the client, so
 * it sits inside its own Suspense boundary: the page stays static and
 * prerendered, and only this tool waits for the query string. The fallback is
 * the same builder without an import, so the prerendered HTML holds the form.
 */
export function SkillCreatorTool(props: SkillCreatorToolProps) {
  return (
    <Suspense fallback={<SkillMdBuilder {...props} />}>
      <ToolWithImport {...props} />
    </Suspense>
  )
}
