import { WhereToFindClaudeSkillsPage } from "@/components/where-to-find-claude-skills/where-to-find-claude-skills-page"
import { pageMetadata } from "@/lib/seo/page-metadata"
import { whereToFindClaudeSkills } from "@/lib/seo/where-to-find-claude-skills"

export const metadata = pageMetadata("/where-to-find-claude-skills")

export default function Page() {
  return <WhereToFindClaudeSkillsPage entry={whereToFindClaudeSkills} />
}
