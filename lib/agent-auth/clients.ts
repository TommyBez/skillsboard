import { eq } from "drizzle-orm"

import { AgentAuthError } from "@/lib/agent-auth/errors"
import { db } from "@/lib/db"
import { oauthClient } from "@/lib/db/schema"

export interface AgentClient {
  clientId: string
  name: string | null
}

/**
 * Resolves the `client_id` an agent presents at `/agent/identity`.
 *
 * The identity endpoint takes no client credential — the ID-JAG is the
 * credential, and an agent provider's token is not something a client secret
 * would strengthen. What the client id is for is *binding*: the assertion this
 * flow mints names it, and the token endpoint later refuses to exchange that
 * assertion for any other client's token. So the id has to name a real
 * registered client, and a disabled one must not be a way back in.
 */
export async function requireAgentClient(clientId: unknown): Promise<AgentClient> {
  if (typeof clientId !== "string" || !clientId.trim()) {
    throw new AgentAuthError(
      "invalid_client",
      "client_id is required. Register the agent at the registration endpoint first.",
    )
  }

  const [row] = await db
    .select({
      clientId: oauthClient.clientId,
      name: oauthClient.name,
      disabled: oauthClient.disabled,
    })
    .from(oauthClient)
    .where(eq(oauthClient.clientId, clientId.trim()))
    .limit(1)

  if (!row || row.disabled) {
    throw new AgentAuthError("invalid_client", "This client is not registered with Skills Board.")
  }

  return { clientId: row.clientId, name: row.name }
}

/**
 * The display name to show a human during a first-link ceremony.
 *
 * `disabled` is filtered after the read rather than in SQL because the column
 * is nullable and `disabled = false` would drop the NULL rows —
 * `requireAgentClient` treats NULL as enabled, and the two must agree.
 */
export async function findClientName(clientId: string): Promise<string | null> {
  const [row] = await db
    .select({ name: oauthClient.name, disabled: oauthClient.disabled })
    .from(oauthClient)
    .where(eq(oauthClient.clientId, clientId))
    .limit(1)

  if (!row || row.disabled) return null
  return row.name
}
