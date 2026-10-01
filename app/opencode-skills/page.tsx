import { OpencodeSkillsPage } from "@/components/opencode-skills/opencode-skills-page"
import { opencodeSkills } from "@/lib/seo/opencode-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/opencode-skills")

export default function Page() {
  return <OpencodeSkillsPage entry={opencodeSkills} />
}
