import { ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import { connection } from "next/server"

import { DISCOVERY_CORS_HEADERS, discoveryPreflight } from "@/lib/agent-discovery"
import { claimApiRequest, rateLimitHeaders } from "@/lib/api-rate-limit"
import { API_VERSION_HEADER, apiVersionHeaders, isSupportedApiVersion } from "@/lib/api-version"
import { problemResponse } from "@/lib/problem-json"

/**
 * Liveness only, in the shape of draft-inadarei-api-health-check.
 *
 * A request reaching this handler proves the deployment is serving. It
 * deliberately does not touch Postgres, Better Auth, or skills.sh: a health
 * endpoint that reports on dependencies it did not check is worse than none,
 * and a probe that opens a database connection on every call is a cheap way to
 * exhaust the pool. The `status` link in `/.well-known/api-catalog` points here,
 * and its description says exactly this much.
 *
 * It is also the endpoint an agent probes first, so it is where the conventions
 * the rest of the surface follows are demonstrated: the request budget in
 * `RateLimit` headers, the version in `Skills-Board-Api-Version`, and a refusal
 * as an RFC 9457 problem document rather than as prose.
 */
export async function GET() {
  await connection()

  const requestHeaders = await headers()

  if (!isSupportedApiVersion(requestHeaders.get(API_VERSION_HEADER))) {
    return problemResponse("unsupported_api_version", {
      instance: "/api/health",
      requested_version: requestHeaders.get(API_VERSION_HEADER),
      headers: { ...apiVersionHeaders, ...DISCOVERY_CORS_HEADERS },
    })
  }

  // A request with no client address is left unbucketed rather than refused:
  // an absent header is not a client, and turning it into one would let a
  // missing header take the endpoint down for everyone behind it.
  const budget = claimApiRequest(`health:${ipAddress(requestHeaders) || "unattributed"}`)
  const budgetHeaders = { ...rateLimitHeaders(budget), ...apiVersionHeaders }

  if (!budget.allowed) {
    return problemResponse("rate_limited", {
      instance: "/api/health",
      retry_after: budget.resetSeconds,
      headers: {
        ...budgetHeaders,
        ...DISCOVERY_CORS_HEADERS,
        "Retry-After": String(budget.resetSeconds),
      },
    })
  }

  return new Response(
    `${JSON.stringify({
      status: "pass",
      description: "HTTP liveness of the Skills Board deployment. Backing services are not probed.",
    })}\n`,
    {
      headers: {
        ...budgetHeaders,
        "Content-Type": "application/health+json; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": DISCOVERY_CORS_HEADERS["Access-Control-Allow-Origin"],
      },
    },
  )
}

export function OPTIONS() {
  return discoveryPreflight()
}
