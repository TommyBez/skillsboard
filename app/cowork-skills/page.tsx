import { CoworkSkillsPage } from "@/components/cowork-skills/cowork-skills-page"
import { coworkSkills } from "@/lib/seo/cowork-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/cowork-skills")

export default function Page() {
  return <CoworkSkillsPage entry={coworkSkills} />
}
