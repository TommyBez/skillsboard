import { CopilotSkillsPage } from "@/components/copilot-skills/copilot-skills-page"
import { copilotSkills } from "@/lib/seo/copilot-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/copilot-skills")

export default function Page() {
  return <CopilotSkillsPage entry={copilotSkills} />
}
