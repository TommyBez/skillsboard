import { connection } from "next/server"

import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopes } from "@/lib/oauth-scopes"

export async function GET() {
  await connection()
  // The canonical RFC 8707 identifier tokens are audience-bound to; a
  // request-derived origin could advertise a resource the authorization
  // server would reject with invalid_target.
  const resource = getMcpResource()
  const authOrigin = new URL(resource).origin
  return Response.json(
    {
      resource,
      authorization_servers: [`${authOrigin}/api/auth`],
      scopes_supported: [...oauthScopes],
      bearer_methods_supported: ["header"],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  )
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
