import { createHash } from "node:crypto"

import { getPublishedCollectionArtifact } from "@/lib/db/collection-distributions"
import { buildInstallableCollectionArtifactFilename } from "@/lib/installable-collection-protocol"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
} as const

function notFoundResponse() {
  return Response.json(
    { error: "Artifact not found" },
    { status: 404, headers: RESPONSE_HEADERS },
  )
}

export async function GET(
  _request: Request,
  { params }: {
    params: Promise<{ artifactId: string; filename: string; shareId: string }>
  },
) {
  const { artifactId, filename, shareId } = await params
  if (!UUID_PATTERN.test(artifactId)) return notFoundResponse()

  const artifact = await getPublishedCollectionArtifact(shareId, artifactId)
  if (!artifact) return notFoundResponse()

  const expectedFilename = buildInstallableCollectionArtifactFilename(artifact.skillName)
  if (filename !== expectedFilename) return notFoundResponse()

  const bytes = Buffer.from(artifact.artifactBase64, "base64")
  const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`
  if (bytes.byteLength !== artifact.artifactBytes || digest !== artifact.artifactDigest) {
    console.error("Stored collection artifact failed its integrity check", { artifactId })
    return Response.json(
      { error: "Artifact unavailable" },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      ...RESPONSE_HEADERS,
      "Content-Disposition": `attachment; filename="${expectedFilename}"`,
      "Content-Length": String(bytes.byteLength),
      "Content-Type": "application/zip",
    },
  })
}
