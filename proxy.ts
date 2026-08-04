import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { precompute } from "flags/next"

import { homepageFlags } from "@/lib/launch"
import { guidePaths } from "@/lib/seo/guides/types"

const guidePrefix = "/guides/"

/**
 * Imported from `guides/types` rather than the `guides` barrel so the proxy
 * bundle carries eight slugs instead of every guide's body copy.
 */
const knownGuideSlugs = new Set<string>(
  Object.values(guidePaths).map((path) => path.slice(guidePrefix.length)),
)

/**
 * Matches on the slug segment alone, not the whole pathname. `/guides/[slug]`
 * has sibling metadata routes — `opengraph-image` and `twitter-image` — and
 * `skipTrailingSlashRedirect` leaves `/guides/<slug>/` intact, none of which
 * equal a bare guide path. Comparing full pathnames 404s all of them. Anything
 * under a known slug is handed to the router, which 404s unmatched sub-paths
 * on its own.
 */
function isUnknownGuidePath(pathname: string) {
  if (!pathname.startsWith(guidePrefix)) return false

  const slug = pathname.slice(guidePrefix.length).split("/")[0]

  return !knownGuideSlugs.has(slug)
}

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
  if (isUnknownGuidePath(pathname)) {
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
