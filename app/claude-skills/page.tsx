import { ClaudeSkillsPage } from "@/components/claude-skills/claude-skills-page"
import { claudeSkills } from "@/lib/seo/claude-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/claude-skills")

export default function Page() {
  return <ClaudeSkillsPage entry={claudeSkills} />
}
