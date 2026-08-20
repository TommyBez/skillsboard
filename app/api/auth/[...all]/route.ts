import { eq } from "drizzle-orm"
import { toNextJsHandler } from "better-auth/next-js"
import { connection } from "next/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { oauthClient } from "@/lib/db/schema"
import {
  isCursorDcrRequest,
  prepareCursorDcrRegistration,
} from "@/lib/oauth-cursor-dcr"

const handler = toNextJsHandler(auth.handler)

export async function GET(request: Request) {
  await connection()
  return handler.GET(request)
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  if (!url.pathname.endsWith("/oauth2/register")) {
    return handler.POST(request)
  }

  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return handler.POST(request)
  }

  const raw = await request.text()
  let body: unknown
  try {
    body = raw ? JSON.parse(raw) : {}
  } catch {
    return forwardPost(request, raw)
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return forwardPost(request, raw)
  }

  const registration = body as Record<string, unknown>
  if (!isCursorDcrRequest(registration)) {
    return forwardPost(request, raw)
  }

  const { registrationBody, storedRedirectUris } = prepareCursorDcrRegistration(registration)
  const response = await forwardPost(request, JSON.stringify(registrationBody))
  if (!response.ok) return response

  let created: { client_id?: string; redirect_uris?: string[] }
  try {
    created = (await response.json()) as { client_id?: string; redirect_uris?: string[] }
  } catch {
    return response
  }

  if (typeof created.client_id === "string") {
    try {
      await persistCursorRedirectUris(created.client_id, storedRedirectUris)
      created = { ...created, redirect_uris: storedRedirectUris }
    } catch (error) {
      console.error("Unable to persist Cursor MCP redirect URIs after DCR", error)
    }
  }

  return Response.json(created, {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": response.headers.get("cache-control") ?? "no-store",
    },
  })
}

function forwardPost(request: Request, body: string) {
  const headers = new Headers(request.headers)
  headers.delete("content-length")
  return handler.POST(
    new Request(request.url, {
      method: "POST",
      headers,
      body,
    }),
  )
}

async function persistCursorRedirectUris(clientId: string, redirectUris: string[]) {
  await db
    .update(oauthClient)
    .set({
      redirectUris: JSON.stringify(redirectUris),
      updatedAt: new Date(),
    })
    .where(eq(oauthClient.clientId, clientId))
}
