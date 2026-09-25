import { AgentSkillsSupportPage } from "@/components/agent-skills-support/agent-skills-support-page"
import { agentSkillsSupport } from "@/lib/seo/agent-skills-support"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/agent-skills-support")

export default function Page() {
  return <AgentSkillsSupportPage entry={agentSkillsSupport} />
}
