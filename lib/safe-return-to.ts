export function safeReturnTo(value: unknown, fallback = "/library") {
  if (value === "/library" || value === "/settings/email") return value
  if (typeof value === "string" && /^\/invite\/[A-Za-z0-9_-]{1,200}$/.test(value)) return value
  // The auth.md first-link ceremony. A UUID only, so the path cannot be bent
  // into a query string or an origin-relative redirect.
  if (
    typeof value === "string" &&
    /^\/agent\/claim\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
  ) {
    return value
  }
  return fallback
}
