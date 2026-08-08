import { getPublishedCollectionByShareId } from "@/lib/db/collection-distributions"
import { buildWellKnownManifest } from "@/lib/installable-collection-protocol"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
} as const

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await params
  const published = await getPublishedCollectionByShareId(shareId)

  if (!published) {
    return Response.json(
      { error: "Collection not found" },
      { status: 404, headers: RESPONSE_HEADERS },
    )
  }

  const manifest = buildWellKnownManifest(published.skills.map((entry) => ({
    artifactId: entry.artifactId,
    description: entry.description,
    digest: entry.artifactDigest,
    skillName: entry.skillName,
  })))

  return Response.json(manifest, { headers: RESPONSE_HEADERS })
}
