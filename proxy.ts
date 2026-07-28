import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { precompute } from "flags/next"

import { homepageFlags } from "@/lib/launch"

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

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (pathname === "/") {
    const code = await precompute(homepageFlags)
    const variantUrl = request.nextUrl.clone()
    variantUrl.pathname = `/variants/home/${code}`

    return NextResponse.rewrite(variantUrl)
  }

  const sessionCookie = getSessionCookie(request)

  // Cookie presence is optimistic only: gate protected routes when missing.
  // Do not redirect away from /sign-in|/sign-up based on cookie presence —
  // a stale cookie would bounce users library ↔ sign-in. Auth pages validate
  // the real session themselves.
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/library",
    "/library/:path*",
    "/discover",
    "/discover/:path*",
    "/settings/:path*",
    "/onboarding",
    "/consent",
  ],
}
