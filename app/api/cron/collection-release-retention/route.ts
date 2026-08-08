import { purgeExpiredCollectionReleases } from "@/lib/db/collection-release-retention"

const RESPONSE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const

export const maxDuration = 60

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (
    !cronSecret
    || request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: RESPONSE_HEADERS },
    )
  }

  const startedAt = Date.now()
  try {
    const result = await purgeExpiredCollectionReleases()
    const summary = {
      ...result,
      cutoff: result.cutoff.toISOString(),
      durationMs: Date.now() - startedAt,
      event: "collection_release_retention_cleanup",
      ok: true,
    }
    console.info("Collection release retention cleanup completed", summary)
    return Response.json(summary, { headers: RESPONSE_HEADERS })
  } catch (error) {
    console.error("Collection release retention cleanup failed", {
      durationMs: Date.now() - startedAt,
      error,
      event: "collection_release_retention_cleanup",
    })
    return Response.json(
      { error: "Collection release cleanup failed", ok: false },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}
