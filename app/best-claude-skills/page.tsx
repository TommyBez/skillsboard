import { BestClaudeSkillsPage } from "@/components/best-claude-skills/best-claude-skills-page"
import { bestClaudeSkills } from "@/lib/seo/best-claude-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/best-claude-skills")

export default function Page() {
  return <BestClaudeSkillsPage entry={bestClaudeSkills} />
}
