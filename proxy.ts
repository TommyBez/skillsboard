import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { resolveSignedInSignUpRedirect } from "@/lib/auth-entry-redirect"

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
  const sessionCookie = getSessionCookie(request)

  // Cookie presence is optimistic only: gate protected routes when missing.
  if (!sessionCookie && isProtectedPath(pathname)) {
    const signInUrl = new URL("/sign-in", request.url)

    if (pathname === "/consent") {
      searchParams.forEach((value, key) => {
        signInUrl.searchParams.append(key, value)
      })
    } else if (pathname === "/library" || pathname === "/settings/email") {
      signInUrl.searchParams.set("returnTo", pathname)
    }

    return NextResponse.redirect(signInUrl)
  }

  // The other direction, narrowly. A signed-in visitor who takes a marketing
  // CTA should never reach the signup form at all, so the bounce happens here
  // rather than after the page has rendered — see the helper for which shapes
  // are claimed and which are left to `AuthEntry`.
  //
  // `/sign-in` is *not* given the same treatment, and must not be: it is where
  // `requireSession` sends a failed session check, so redirecting it on cookie
  // presence would put a stale cookie in a permanent /sign-in ↔ /library loop.
  // `/sign-up` is no one's failure destination, so the worst a stale cookie
  // costs here is one extra hop before `AuthEntry` — which still validates the
  // real session — hands the visitor to /sign-in.
  if (sessionCookie && pathname === "/sign-up") {
    const destination = resolveSignedInSignUpRedirect(searchParams)
    if (destination) return NextResponse.redirect(new URL(destination, request.url))
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
    "/sign-up",
  ],
}
