import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { precompute } from "flags/next"

import { homepageFlags } from "@/lib/launch"
import { guidePaths } from "@/lib/seo/guides/types"

/**
 * Imported from `guides/types` rather than the `guides` barrel so the proxy
 * bundle carries eight path strings instead of every guide's body copy.
 */
const knownGuidePaths = new Set<string>(Object.values(guidePaths))

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

  // `/guides/[slug]` resolves its slug inside a `<Suspense>` boundary so the
  // route can prerender a shell, which means a `notFound()` there fires after
  // the response has committed to 200 — a soft 404. Under Cache Components
  // every dynamic route streams a shell first, so the existence check has to
  // happen before the body streams. A lookup against eight known paths is
  // cheap enough to run here.
  if (pathname.startsWith("/guides/") && !knownGuidePaths.has(pathname)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 })
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
    } else if (pathname === "/library" || pathname === "/settings/email") {
      signInUrl.searchParams.set("returnTo", pathname)
    }

    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/guides/:path*",
    "/library",
    "/library/:path*",
    "/discover",
    "/discover/:path*",
    "/settings/:path*",
    "/onboarding",
    "/consent",
  ],
}
