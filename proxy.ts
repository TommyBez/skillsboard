import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { resolveSignedInAuthRedirect } from "@/lib/auth-entry-redirect"

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
 * has sibling metadata routes — `opengraph-image` and `twitter-image` — which
 * do not equal a bare guide path, so comparing full pathnames 404s them.
 * Anything under a known slug is handed to the router, which 404s unmatched
 * sub-paths on its own.
 *
 * Trailing slashes never reach here: `redirects()` in `next.config.ts` runs
 * before the proxy, so `/guides/<slug>/` is canonicalized with a 308 first.
 * Verified against `next start` — an unknown slug with a trailing slash is
 * 308 then 404.
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

  // `/guides/[slug]` resolves its slug inside a `<Suspense>` boundary so the
  // route can prerender a shell, which means a `notFound()` there fires after
  // the response has committed to 200 — a soft 404. Under Cache Components
  // every dynamic route streams a shell first, so the existence check has to
  // happen before the body streams. A lookup against eight known slugs is
  // cheap enough to run here.
  if (isUnknownGuidePath(pathname)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 })
  }

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
    "/guides/:path*",
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
