import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import {
  CATALOG_PAGE_SIZE,
  SEARCH_MAX_LIMIT,
  SEARCH_PAGE_SIZE,
} from "@/lib/catalog"
import { getLeaderboard, searchCatalog } from "@/lib/skills-sh"

const querySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("leaderboard"),
    view: z.enum(["trending", "hot", "all-time"]),
    page: z.coerce.number().int().min(0).default(0),
    perPage: z.coerce.number().int().min(1).max(100).default(CATALOG_PAGE_SIZE),
  }),
  z.object({
    mode: z.literal("search"),
    q: z.string().trim().min(2).max(100),
    limit: z.coerce.number().int().min(SEARCH_PAGE_SIZE).max(SEARCH_MAX_LIMIT).default(SEARCH_PAGE_SIZE),
  }),
])

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const mode = url.searchParams.get("q") ? "search" : "leaderboard"
  const parsed = querySchema.safeParse(
    mode === "search"
      ? {
          mode,
          q: url.searchParams.get("q") ?? "",
          limit: url.searchParams.get("limit") ?? SEARCH_PAGE_SIZE,
        }
      : {
          mode,
          view: url.searchParams.get("view") ?? "trending",
          page: url.searchParams.get("page") ?? 0,
          perPage: url.searchParams.get("perPage") ?? CATALOG_PAGE_SIZE,
        },
  )

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid catalog request" }, { status: 400 })
  }

  try {
    const page =
      parsed.data.mode === "search"
        ? await searchCatalog(parsed.data.q, { limit: parsed.data.limit })
        : await getLeaderboard(parsed.data.view, parsed.data.page, parsed.data.perPage)

    return NextResponse.json(page)
  } catch (error) {
    console.error("Unable to load catalog page", error)
    return NextResponse.json({ error: "Catalog unavailable" }, { status: 502 })
  }
}
