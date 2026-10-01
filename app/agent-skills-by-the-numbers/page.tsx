import { AgentSkillsByTheNumbersPage } from "@/components/agent-skills-by-the-numbers/agent-skills-by-the-numbers-page"
import { agentSkillsByTheNumbers } from "@/lib/seo/agent-skills-by-the-numbers"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/agent-skills-by-the-numbers")

export default function Page() {
  return <AgentSkillsByTheNumbersPage entry={agentSkillsByTheNumbers} />
}
