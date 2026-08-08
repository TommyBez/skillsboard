import { getPublishedCollectionByShareId } from "@/lib/db/collection-distributions"
import {
  buildWellKnownManifest,
  isValidInstallableCollectionShareId,
} from "@/lib/installable-collection-protocol"

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
  if (!isValidInstallableCollectionShareId(shareId)) {
    return Response.json(
      { error: "Collection not found" },
      { status: 404, headers: RESPONSE_HEADERS },
    )
  }

  const published = await getPublishedCollectionByShareId(shareId)

  if (!published) {
    return Response.json(
      { error: "Collection not found" },
      { status: 404, headers: RESPONSE_HEADERS },
    )
  }

  let manifest: ReturnType<typeof buildWellKnownManifest>
  try {
    manifest = buildWellKnownManifest(published.skills.map((entry) => ({
      artifactId: entry.artifactId,
      description: entry.description,
      digest: entry.artifactDigest,
      skillName: entry.skillName,
    })))
  } catch (error) {
    console.error("Published collection manifest failed validation", {
      collectionId: published.collectionId,
      releaseId: published.releaseId,
      error,
    })
    return Response.json(
      { error: "Collection unavailable" },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }

  return Response.json(manifest, { headers: RESPONSE_HEADERS })
}
