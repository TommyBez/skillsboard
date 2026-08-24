export type PostHogScopeRequirement = "optional-user" | "team" | "user"
export type PostHogPageViewRequirement = PostHogScopeRequirement | "anonymous"

function isPathAtOrBelow(pathname: string, root: string) {
  return pathname === root || pathname.startsWith(`${root}/`)
}

/**
 * The root route tracker can commit before a streamed route-group boundary.
 * This small route map lets its pending pageview wait for the destination's
 * identity instead of inheriting the scope of the route being replaced.
 */
export function postHogPageViewRequirement(
  pathname: string,
): PostHogPageViewRequirement {
  if (
    [
      "/collections",
      "/connect",
      "/discover",
      "/library",
      "/settings/organization",
      "/start",
    ].some((root) => isPathAtOrBelow(pathname, root))
  ) {
    return "team"
  }

  if (
    ["/onboarding", "/settings/email"].some((root) =>
      isPathAtOrBelow(pathname, root),
    )
  ) {
    return "user"
  }

  return pathname === "/consent" ? "optional-user" : "anonymous"
}
