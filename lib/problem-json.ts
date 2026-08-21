import { discoveryUrl } from "@/lib/agent-discovery"

/** RFC 9457. The media type is what marks a body as a problem document. */
export const PROBLEM_JSON_MEDIA_TYPE = "application/problem+json; charset=utf-8"

/**
 * The registry of failures the public HTTP surface can report.
 *
 * One code per way a request can be refused, named here rather than spelled
 * out at each throw site, so the `type` URI an agent branches on is the same
 * string in the response, in the OpenAPI description, and in the developer
 * docs. Every code has a section under `/developers#errors` with the same
 * anchor.
 */
export const problemCodes = {
  rate_limited: {
    status: 429,
    title: "Too many requests",
    detail:
      "This client has spent its request budget for the current window. Wait for the window named in Retry-After, then retry.",
  },
  unsupported_api_version: {
    status: 400,
    title: "Unsupported API version",
    detail:
      "The Skills-Board-Api-Version header named a version this deployment does not serve. Omit the header to get the current version.",
  },
} as const

export type ProblemCode = keyof typeof problemCodes

export interface ProblemExtensions {
  /** Anything RFC 9457 allows beside the members below, such as `retry_after`. */
  [member: string]: unknown
}

/**
 * A problem document for one refusal.
 *
 * `type` is a URL that resolves to the paragraph describing this failure, which
 * is the whole point of the member: an agent that meets an unfamiliar code can
 * fetch the explanation instead of pattern matching on prose. `instance` names
 * the endpoint that refused, so a client hitting several endpoints can tell
 * which one produced the document.
 */
export function buildProblem(
  code: ProblemCode,
  { instance, ...extensions }: { instance: string } & ProblemExtensions,
) {
  const problem = problemCodes[code]

  return {
    type: discoveryUrl(`/developers#error-${code.replace(/_/g, "-")}`),
    title: problem.title,
    status: problem.status,
    detail: problem.detail,
    instance: discoveryUrl(instance),
    code,
    ...extensions,
  }
}

/** The problem document as the response it describes. */
export function problemResponse(
  code: ProblemCode,
  options: { instance: string; headers?: HeadersInit } & ProblemExtensions,
): Response {
  const { headers, ...body } = options

  return new Response(`${JSON.stringify(buildProblem(code, body as { instance: string }), null, 2)}\n`, {
    status: problemCodes[code].status,
    headers: {
      ...headers,
      "Content-Type": PROBLEM_JSON_MEDIA_TYPE,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
