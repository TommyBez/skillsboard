import { DISCOVERY_CORS_HEADERS } from "@/lib/agent-discovery"
import {
  API_VERSION_HEADER,
  API_VERSION_VARY,
  apiVersionHeaders,
  isSupportedApiVersion,
} from "@/lib/api-version"
import { problemResponse } from "@/lib/problem-json"

/**
 * Five minutes in a client, an hour at the edge. These documents change when a
 * deployment changes, and an agent that reads several of them in one session
 * should not pay for the origin more than once.
 */
export const DISCOVERY_CACHE_CONTROL = "public, max-age=300, s-maxage=3600"

/**
 * One machine-readable discovery document, served the way all of them are.
 *
 * Seven routes were repeating the same four headers and had begun to disagree
 * about them. Going through one place also makes the version contract real
 * rather than documented: a request that pins a version this deployment does
 * not serve is refused here, and `Vary` keeps a cache from answering that
 * request out of an unpinned client's hit.
 *
 * The body is pretty-printed on purpose. These documents are read by people
 * debugging an integration at least as often as by the clients that consume
 * them, and the bytes are cheap next to being able to read the thing.
 */
export function agentDocumentResponse({
  document,
  instance,
  requestHeaders,
  contentType = "application/json; charset=utf-8",
  cacheControl = DISCOVERY_CACHE_CONTROL,
}: {
  document: unknown
  /** Path of this document, named in a problem response so a refusal says which. */
  instance: string
  requestHeaders: Headers
  contentType?: string
  cacheControl?: string
}): Response {
  const requested = requestHeaders.get(API_VERSION_HEADER)

  if (!isSupportedApiVersion(requested)) {
    return problemResponse("unsupported_api_version", {
      instance,
      requested_version: requested,
      headers: { ...apiVersionHeaders, ...DISCOVERY_CORS_HEADERS, Vary: API_VERSION_VARY },
    })
  }

  return new Response(`${JSON.stringify(document, null, 2)}\n`, {
    headers: {
      ...apiVersionHeaders,
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      Vary: API_VERSION_VARY,
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
    },
  })
}
