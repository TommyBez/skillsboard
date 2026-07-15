export function safeReturnTo(value: unknown, fallback = "/library") {
  if (value === "/library") return value
  if (typeof value === "string" && /^\/invite\/[A-Za-z0-9_-]{1,200}$/.test(value)) return value
  return fallback
}
