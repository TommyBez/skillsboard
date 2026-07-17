const REDACTED_INVITATION_PATH = "/invite/[redacted]"

const ALLOWED_MARKETING_QUERY_PARAMETERS = new Set([
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
])

const SENSITIVE_PROPERTY_KEYS = new Set([
  "accesstoken",
  "authorization",
  "code",
  "codechallenge",
  "email",
  "githuburl",
  "invitationid",
  "invitationtoken",
  "nonce",
  "password",
  "redirecturi",
  "refreshtoken",
  "repositoryurl",
  "returnto",
  "secret",
  "state",
  "teamname",
  "token",
])

const SENSITIVE_PATH_PREFIXES = [
  "/api/auth",
  "/consent",
  "/invite",
  "/sign-in",
  "/sign-up",
]

function analyticsPathname(value: string) {
  try {
    const url = new URL(value, "https://analytics.invalid")
    try {
      return decodeURIComponent(url.pathname).toLowerCase()
    } catch {
      return url.pathname.toLowerCase()
    }
  } catch {
    return value.toLowerCase()
  }
}

export function isSensitiveAnalyticsUrl(value: string) {
  const pathname = analyticsPathname(value)
  return SENSITIVE_PATH_PREFIXES.some((prefix) => (
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  ))
}

export function sanitizeAnalyticsUrl(value: string) {
  const invitationRedacted = value
    .replace(/\/invite\/[^/?#]+/gi, REDACTED_INVITATION_PATH)
    .replace(/%2finvite%2f[^&#]+/gi, "%2Finvite%2F%5Bredacted%5D")

  const looksLikeUrl = invitationRedacted.startsWith("/")
    || /^[a-z][a-z\d+.-]*:\/\//i.test(invitationRedacted)

  if (!looksLikeUrl) {
    return invitationRedacted.replace(
      /([?&](?:code|code_challenge|email|invitationid|nonce|redirect_uri|returnto|state|token)=)[^&#\s]*/gi,
      "$1[redacted]",
    )
  }

  try {
    const isAbsolute = /^[a-z][a-z\d+.-]*:\/\//i.test(invitationRedacted)
    const url = new URL(invitationRedacted, "https://analytics.invalid")
    for (const key of [...url.searchParams.keys()]) {
      if (!ALLOWED_MARKETING_QUERY_PARAMETERS.has(key.toLowerCase())) {
        url.searchParams.delete(key)
      }
    }
    if (isSensitiveAnalyticsUrl(url.pathname)) url.search = ""
    url.hash = ""
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}`
  } catch {
    return invitationRedacted
  }
}

export function sanitizeAnalyticsValue<T>(value: T): T {
  if (typeof value === "string") return sanitizeAnalyticsUrl(value) as T
  if (Array.isArray(value)) return value.map(sanitizeAnalyticsValue) as T
  if (!value || typeof value !== "object") return value
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_PROPERTY_KEYS.has(key.toLowerCase().replace(/[^a-z\d]/g, "")))
      .map(([key, child]) => [key, sanitizeAnalyticsValue(child)]),
  ) as T
}

export function getAnalyticsDeploymentEnvironment() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENVIRONMENT ?? "unknown"
}
