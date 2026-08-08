const REDACTED_INVITATION_PATH = "/invite/[redacted]"
const REDACTED_INSTALLABLE_COLLECTION_PATH = "/p/[redacted]"
const INSTALLABLE_COLLECTION_PATH_PATTERN = /^\/p\/[^/]+(?:\/|$)/i

const ALLOWED_MARKETING_QUERY_PARAMETERS = new Set([
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
])

const POSTHOG_URL_PROPERTY_KEYS = new Set([
  "$current_url",
  "$external_click_url",
  "$initial_current_url",
  "$initial_pathname",
  "$initial_referrer",
  "$pathname",
  "$prev_pageview_pathname",
  "$referrer",
  "$sentry_url",
  "$session_entry_current_url",
  "$session_entry_pathname",
  "$session_entry_url",
])

function redactInvitationPath(pathname: string) {
  if (!/\/invite\/[^/]+/i.test(pathname)) return pathname
  return pathname.replace(/\/invite\/[^/]+/gi, REDACTED_INVITATION_PATH)
}

function redactInstallableCollectionPath(pathname: string) {
  if (!/\/p\/[^/]+/i.test(pathname)) return pathname
  return pathname.replace(/\/p\/[^/]+/gi, REDACTED_INSTALLABLE_COLLECTION_PATH)
}

export function isInstallableCollectionPathname(pathname: string) {
  return INSTALLABLE_COLLECTION_PATH_PATTERN.test(pathname)
}

export type PostHogRoutePrivacyState = "active" | "bearer" | "pending-bearer"
export type PostHogRoutePrivacyEffect =
  | "none"
  | "resume"
  | "resume-with-pageview"
  | "suspend"

type PostHogRoutePrivacyEvent =
  | {
      type: "navigation-start"
      currentPathname: string
      destinationPathname: string
    }
  | { type: "navigation-commit"; pathname: string }

export function initialPostHogRoutePrivacyState(
  pathname: string,
): PostHogRoutePrivacyState {
  return isInstallableCollectionPathname(pathname) ? "bearer" : "active"
}

export function transitionPostHogRoutePrivacy(
  state: PostHogRoutePrivacyState,
  event: PostHogRoutePrivacyEvent,
): { effect: PostHogRoutePrivacyEffect; state: PostHogRoutePrivacyState } {
  if (event.type === "navigation-commit") {
    if (isInstallableCollectionPathname(event.pathname)) {
      return {
        effect: state === "active" ? "suspend" : "none",
        state: "bearer",
      }
    }

    return state === "active"
      ? { effect: "none", state: "active" }
      : { effect: "resume-with-pageview", state: "active" }
  }

  const currentIsBearer = isInstallableCollectionPathname(event.currentPathname)
  if (isInstallableCollectionPathname(event.destinationPathname)) {
    if (currentIsBearer) {
      return {
        effect: state === "active" ? "suspend" : "none",
        state: "bearer",
      }
    }

    return {
      effect: state === "active" ? "suspend" : "none",
      state: "pending-bearer",
    }
  }

  if (currentIsBearer) return { effect: "none", state: "bearer" }
  if (state === "pending-bearer") return { effect: "resume", state: "active" }
  if (state === "bearer") {
    return { effect: "resume-with-pageview", state: "active" }
  }
  return { effect: "none", state: "active" }
}

export function sanitizeAnalyticsUrl(value: string) {
  const isAbsolute = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
  if (!isAbsolute && !value.startsWith("/")) return value

  try {
    const url = new URL(value, "https://analytics.invalid")
    for (const key of [...url.searchParams.keys()]) {
      if (!ALLOWED_MARKETING_QUERY_PARAMETERS.has(key.toLowerCase())) {
        url.searchParams.delete(key)
      }
    }

    const pathname = redactInstallableCollectionPath(redactInvitationPath(url.pathname))
    const search = url.searchParams.toString()
    const sanitizedPath = `${pathname}${search ? `?${search}` : ""}`
    return isAbsolute ? `${url.origin}${sanitizedPath}` : sanitizedPath
  } catch {
    return value
  }
}

export function sanitizePostHogUrlProperties<T extends Record<string, unknown> | undefined>(
  properties: T,
) {
  if (!properties) return properties

  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      POSTHOG_URL_PROPERTY_KEYS.has(key) && typeof value === "string"
        ? sanitizeAnalyticsUrl(value)
        : value,
    ]),
  ) as T
}
