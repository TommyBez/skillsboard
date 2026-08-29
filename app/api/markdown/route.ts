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
 * Both inputs are URLs, so both are resolved the same way. A rewrite hands the
 * handler the URL the client asked for, and whether the destination's `?path=`
 * survives depends on where this runs: `next start` drops it, Vercel keeps it.
 * The query is not a content path either: the negotiation rules match a slug
 * pattern that also accepts an extension, so `/compare/<slug>.md` asked for
 * with `Accept: text/markdown` arrives as `?path=/compare/<slug>.md`. That is
 * exactly the request `components/web-mcp.tsx` makes for every twin it reads.
 * Resolving the query through the same URL to content path step keeps the
 * answer identical in both environments; `renderMarkdownTwin` stays strict.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedPath = contentPathForMarkdownRequest(
    url.searchParams.get("path") ?? url.pathname,
  )
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
        // The same URL answers with the HTML 404 when Markdown was not asked
        // for, and a missing page is not something to index.
        Vary: "Accept",
        "X-Robots-Tag": "noindex",
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
