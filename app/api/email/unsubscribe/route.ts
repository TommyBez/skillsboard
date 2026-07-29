import { NextResponse } from "next/server"

import {
  PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_COOKIE,
  verifyProductCommunicationsUnsubscribeToken,
} from "@/lib/email/email-privacy"
import { withdrawProductCommunicationsByToken } from "@/lib/email/email-preferences"

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
} as const

function redirectToPage(
  request: Request,
  status: "error" | "invalid" | "success",
  token?: string,
) {
  const pageUrl = new URL("/email/unsubscribe", request.url)
  pageUrl.searchParams.set("status", status)
  if (token) pageUrl.searchParams.set("token", token)

  const response = NextResponse.redirect(pageUrl, 303)
  response.headers.set("Cache-Control", noStoreHeaders["Cache-Control"])
  return response
}

function redirectToConfirmedPage(request: Request, token: string) {
  const response = redirectToPage(request, "success")
  response.cookies.set(PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_COOKIE, token, {
    httpOnly: true,
    maxAge: 5 * 60,
    path: "/email/unsubscribe",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  const pageUrl = new URL("/email/unsubscribe", request.url)
  if (token) pageUrl.searchParams.set("token", token)

  const response = NextResponse.redirect(pageUrl, 307)
  response.headers.set("Cache-Control", noStoreHeaders["Cache-Control"])
  return response
}

export async function POST(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const pageResponse = searchParams.get("response") === "page"
  const token = searchParams.get("token") ?? ""
  const payload = verifyProductCommunicationsUnsubscribeToken(token)

  if (!payload) {
    if (pageResponse) return redirectToPage(request, "invalid")
    return new Response(null, { status: 400, headers: noStoreHeaders })
  }

  try {
    await withdrawProductCommunicationsByToken({
      emailHash: payload.emailHash,
      userId: payload.userId,
    })
  } catch (error) {
    console.error("Unable to process product communications unsubscribe", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
    if (pageResponse) return redirectToPage(request, "error", token)
    return new Response(null, { status: 503, headers: noStoreHeaders })
  }

  if (pageResponse) return redirectToConfirmedPage(request, token)
  return new Response(null, { status: 200, headers: noStoreHeaders })
}
