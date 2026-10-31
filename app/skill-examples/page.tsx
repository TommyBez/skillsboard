import { SkillExamplesPage } from "@/components/skill-examples/skill-examples-page"
import { pageMetadata } from "@/lib/seo/page-metadata"
import { skillExamples } from "@/lib/seo/skill-examples"

export const metadata = pageMetadata("/skill-examples")

export default function Page() {
  return <SkillExamplesPage entry={skillExamples} />
}
