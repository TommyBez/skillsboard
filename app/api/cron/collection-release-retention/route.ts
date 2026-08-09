import { purgeExpiredCollectionReleases } from "@/lib/db/collection-release-retention"
import {
  collectionReleaseCleanupOutcome,
  hasValidCronAuthorization,
} from "@/lib/collection-release-retention-cron"

const RESPONSE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const

export const maxDuration = 60

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!hasValidCronAuthorization(request.headers.get("authorization"), cronSecret)) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: RESPONSE_HEADERS },
    )
  }

  const startedAt = Date.now()
  try {
    const result = await purgeExpiredCollectionReleases()
    const outcome = collectionReleaseCleanupOutcome(result.mayHaveMore)
    const summary = {
      ...result,
      cutoff: result.cutoff.toISOString(),
      durationMs: Date.now() - startedAt,
      event: "collection_release_retention_cleanup",
      ok: outcome.ok,
    }

    if (result.mayHaveMore) {
      console.error("Collection release retention cleanup reached its work limit", {
        ...summary,
        error: "Expired collection releases may remain",
      })
      // Vercel Cron does not retry failed invocations. The 503 makes the
      // bounded backlog visible in the Cron status and runtime logs.
      return Response.json(summary, {
        status: outcome.status,
        headers: RESPONSE_HEADERS,
      })
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
