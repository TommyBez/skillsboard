import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider"
import { connection } from "next/server"

import { auth } from "@/lib/auth"

const getMetadata = oauthProviderOpenIdConfigMetadata(auth)

export async function GET(request: Request) {
  await connection()
  return getMetadata(request)
}
