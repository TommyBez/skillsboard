import { buildRobotsTxt } from "@/lib/seo/robots"

/**
 * Replaces the `app/robots.ts` metadata file: that API has no way to emit a
 * `Content-Signal` line, and a robots.txt that declares crawl access without
 * declaring usage preferences leaves the second question unanswered.
 */
export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
