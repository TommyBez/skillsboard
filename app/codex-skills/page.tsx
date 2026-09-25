import { CodexSkillsPage } from "@/components/codex-skills/codex-skills-page"
import { codexSkills } from "@/lib/seo/codex-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/codex-skills")

export default function Page() {
  return <CodexSkillsPage entry={codexSkills} />
}
