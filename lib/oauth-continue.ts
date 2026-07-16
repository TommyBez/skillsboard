function buildOAuthQuery(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams | null {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (key === "returnTo") continue
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (value !== undefined) query.append(key, value)
  }

  if (!query.get("client_id") || !query.get("response_type")) return null
  return query
}

/** Rebuild the authorize URL so sign-in can resume an MCP/OAuth request. */
export function getOAuthAuthorizeContinuePath(
  params: Record<string, string | string[] | undefined>,
): string | null {
  const query = buildOAuthQuery(params)
  return query ? `/api/auth/oauth2/authorize?${query.toString()}` : null
}

/** Preserve OAuth query params when switching between sign-in and sign-up. */
export function getOAuthQueryString(
  params: Record<string, string | string[] | undefined>,
): string | null {
  const query = buildOAuthQuery(params)
  if (!query) return null
  const serialized = query.toString()
  return serialized.length > 0 ? serialized : null
}
