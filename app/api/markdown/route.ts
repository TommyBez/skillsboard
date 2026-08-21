import { buildNotFoundMarkdown } from "@/lib/agent-recovery"
import { estimateMarkdownTokens } from "@/lib/markdown/tokens"
import {
  contentPathForMarkdownRequest,
  markdownTwinPath,
  renderMarkdownTwin,
} from "@/lib/markdown/twins"
import { absoluteUrl } from "@/lib/site"

/**
 * Serves the Markdown twin of a data driven content page. Reached only through
 * the rewrites in next.config.ts: `<path>.md`, or `<path>` requested with
 * `Accept: text/markdown`. The public URL is always the `.md` one.
 *
 * The page being asked for comes from the request URL rather than from the
 * `?path=` the rewrite destination carries. A rewrite hands the handler the URL
 * the client asked for, and whether the destination's query survives depends on
 * where this runs: `next start` drops it. The path is in the URL either way,
 * and the query is still read first for a direct call to this route.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedPath =
    url.searchParams.get("path") ?? contentPathForMarkdownRequest(url.pathname)
  const markdown = renderMarkdownTwin(requestedPath)

  // A 404 with a body a client can act on. The status is the one that matters
  // — the path really does not exist — and the body says where to look instead,
  // in the format the client just asked for, so a wrong guess costs one request
  // rather than a series of them.
  if (!markdown) {
    const notFound = buildNotFoundMarkdown(requestedPath)

    return new Response(notFound, {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=60",
        "x-markdown-tokens": String(estimateMarkdownTokens(notFound)),
        "X-Content-Type-Options": "nosniff",
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
      Link: `<${absoluteUrl(requestedPath)}>; rel="canonical", <${absoluteUrl(markdownTwinPath(requestedPath))}>; rel="alternate"; type="text/markdown"`,
      // Lets a client budget the document before it reads it.
      "x-markdown-tokens": String(estimateMarkdownTokens(markdown)),
      Vary: "Accept",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
