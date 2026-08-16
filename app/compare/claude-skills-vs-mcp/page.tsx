import { ComparisonPage } from "@/components/compare/comparison-page"
import { comparePaths, getComparison } from "@/lib/seo/compare"
import { buildComparisonMetadata } from "@/lib/seo/compare-metadata"

const entry = getComparison(comparePaths.skillsVsMcp)

export const metadata = buildComparisonMetadata(entry)

export default function Page() {
  return <ComparisonPage entry={entry} />
}
