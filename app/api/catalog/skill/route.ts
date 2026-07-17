import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { getSkillDetail, isCatalogSkillId } from "@/lib/skills-sh"

const querySchema = z.object({
  id: z.string().trim().min(3).max(200).refine(isCatalogSkillId, "Invalid skill id"),
})

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({ id: url.searchParams.get("id") ?? "" })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid skill request" }, { status: 400 })
  }

  try {
    const detail = await getSkillDetail(parsed.data.id)
    return NextResponse.json(detail)
  } catch (error) {
    console.error("Unable to load skill detail", error)
    const message = error instanceof Error ? error.message : ""
    if (message === "Invalid skill id") {
      return NextResponse.json({ error: "Invalid skill request" }, { status: 400 })
    }
    return NextResponse.json({ error: "Skill details unavailable" }, { status: 502 })
  }
}
