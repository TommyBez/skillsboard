import { CursorSkillsPage } from "@/components/cursor-skills/cursor-skills-page"
import { cursorSkills } from "@/lib/seo/cursor-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/cursor-skills")

export default function Page() {
  return <CursorSkillsPage entry={cursorSkills} />
}
