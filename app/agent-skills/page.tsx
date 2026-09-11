import { AgentSkillsPage } from "@/components/agent-skills/agent-skills-page"
import { agentSkills } from "@/lib/seo/agent-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/agent-skills")

export default function Page() {
  return <AgentSkillsPage entry={agentSkills} />
}
