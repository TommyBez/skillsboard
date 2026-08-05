import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { resolveSignedInAuthRedirect } from "@/lib/auth-entry-redirect"

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

  // The other direction. A signed-in visitor who takes a marketing CTA — or
  // the "Sign in" beside it — should never reach an auth form at all, so the
  // bounce happens here rather than after the page has rendered. See the
  // helper for which shapes are claimed and which are left to `AuthEntry`.
  //
  // `/sign-in` is safe to include only because `requireSession` marks its own
  // redirects: it is where a failed session check lands, so without that marker
  // a present-but-invalid cookie would loop /sign-in ↔ /library forever.
  if (sessionCookie && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const destination = resolveSignedInAuthRedirect(searchParams)
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
    "/sign-in",
    "/sign-up",
  ],
}
