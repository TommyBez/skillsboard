import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider"
import { connection } from "next/server"

import { withAgentAuthMetadata } from "@/lib/agent-auth-metadata"
import { discoveryPreflight } from "@/lib/agent-discovery"
import { auth } from "@/lib/auth"

const getMetadata = oauthProviderAuthServerMetadata(auth)

/**
 * Origin-level RFC 8414 entry point. Better Auth's issuer is `<origin>/api/auth`,
 * so the spec-derived location is the nested route beside this one; an agent
 * scanning the site root has no way to guess that path, and this document hands
 * it the same metadata, `agent_auth` block included.
 */
export async function GET(request: Request) {
  await connection()
  return withAgentAuthMetadata(await getMetadata(request))
}

export function OPTIONS() {
  return discoveryPreflight()
}
