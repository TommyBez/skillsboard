import { AnthropicSkillsPage } from "@/components/anthropic-skills/anthropic-skills-page"
import { anthropicSkills } from "@/lib/seo/anthropic-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/anthropic-skills")

export default function Page() {
  return <AnthropicSkillsPage entry={anthropicSkills} />
}
