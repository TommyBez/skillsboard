import { connection } from "next/server"

import { DISCOVERY_CORS_HEADERS, discoveryPreflight } from "@/lib/agent-discovery"

/**
 * Liveness only, in the shape of draft-inadarei-api-health-check.
 *
 * A request reaching this handler proves the deployment is serving. It
 * deliberately does not touch Postgres, Better Auth, or skills.sh: a health
 * endpoint that reports on dependencies it did not check is worse than none,
 * and a probe that opens a database connection on every call is a cheap way to
 * exhaust the pool. The `status` link in `/.well-known/api-catalog` points here,
 * and its description says exactly this much.
 */
export async function GET() {
  await connection()

  return new Response(
    `${JSON.stringify({
      status: "pass",
      description: "HTTP liveness of the Skills Board deployment. Backing services are not probed.",
    })}\n`,
    {
      headers: {
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
