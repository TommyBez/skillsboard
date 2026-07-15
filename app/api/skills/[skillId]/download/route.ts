import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getUserSkill } from "@/lib/db/queries"
import { buildLatestSkillArchive, SkillArchiveError } from "@/lib/github-skill-archive"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  )
}

function contentDisposition(filename: string) {
  const asciiFilename = filename
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "-")
    .replace(/["\\]/g, "-")
  return `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ skillId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return errorResponse("Sign in to download this skill.", 401)

  const { skillId } = await params
  if (!UUID_PATTERN.test(skillId)) return errorResponse("Skill not found.", 404)

  const savedSkill = await getUserSkill(session.user.id, skillId)
  if (!savedSkill) return errorResponse("Skill not found.", 404)

  try {
    const archive = await buildLatestSkillArchive(savedSkill)
    const bytes = new Uint8Array(archive.bytes)

    return new Response(bytes, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": contentDisposition(archive.filename),
        "Content-Length": String(bytes.byteLength),
        "Content-Type": "application/zip",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    if (error instanceof SkillArchiveError) {
      return errorResponse(error.message, error.status)
    }

    console.error("Unable to build skill archive", error)
    return errorResponse("The skill could not be packaged right now. Try again.", 500)
  }
}
