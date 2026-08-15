import { renderMarkdownTwin } from "@/lib/markdown/twins"
import { absoluteUrl } from "@/lib/site"

/**
 * Serves the Markdown twin of a data driven content page. Reached only through
 * the rewrites in next.config.ts: `<path>.md`, or `<path>` requested with
 * `Accept: text/markdown`. The public URL is always the `.md` one.
 */
export async function GET(request: Request) {
  const requestedPath = new URL(request.url).searchParams.get("path")
  const markdown = requestedPath ? renderMarkdownTwin(requestedPath) : undefined

  if (!requestedPath || !markdown) {
    return new Response("No Markdown version of this page.\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=60",
      },
    })
  }

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      // The HTML page is the canonical document, and the response body depends
      // on the Accept header when the page URL was requested directly.
      Link: `<${absoluteUrl(requestedPath)}>; rel="canonical"`,
      Vary: "Accept",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
