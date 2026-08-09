import { AlternativePage } from "@/components/alternatives/alternative-page"
import { alternativePaths, getAlternative } from "@/lib/seo/alternatives"
import { buildAlternativeMetadata } from "@/lib/seo/alternative-metadata"

const entry = getAlternative(alternativePaths.skillsSh)

export const metadata = buildAlternativeMetadata(entry)

export default function Page() {
  return <AlternativePage entry={entry} />
}
