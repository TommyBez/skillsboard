const REDACTED_INVITATION_PATH = "/invite/[redacted]"

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

    const pathname = redactInvitationPath(url.pathname)
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

export function getAnalyticsDeploymentEnvironment() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENVIRONMENT ?? "unknown"
}
