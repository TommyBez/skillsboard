import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const authPages = new Set(["/sign-in", "/sign-up"])

function isProtectedPath(pathname: string) {
  if (pathname === "/onboarding" || pathname === "/consent") return true
  return (
    pathname === "/library" ||
    pathname.startsWith("/library/") ||
    pathname === "/discover" ||
    pathname.startsWith("/discover/") ||
    pathname.startsWith("/settings/")
  )
}

function hasOAuthContinueParams(searchParams: URLSearchParams) {
  return Boolean(searchParams.get("client_id") && searchParams.get("response_type"))
}

function isInviteReturnTo(value: string | null) {
  return Boolean(value && /^\/invite\/[A-Za-z0-9_-]{1,200}$/.test(value))
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie && isProtectedPath(pathname)) {
    const signInUrl = new URL("/sign-in", request.url)

    if (pathname === "/consent") {
      searchParams.forEach((value, key) => {
        signInUrl.searchParams.append(key, value)
      })
    } else if (pathname === "/library") {
      signInUrl.searchParams.set("returnTo", "/library")
    }

    return NextResponse.redirect(signInUrl)
  }

  if (sessionCookie && authPages.has(pathname)) {
    // Let the page finish OAuth authorize / invite continue flows.
    if (hasOAuthContinueParams(searchParams) || isInviteReturnTo(searchParams.get("returnTo"))) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/library", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/library",
    "/library/:path*",
    "/discover",
    "/discover/:path*",
    "/settings/:path*",
    "/onboarding",
    "/consent",
    "/sign-in",
    "/sign-up",
  ],
}
