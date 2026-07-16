export type DeploymentEnvironment = "development" | "preview" | "production"

/**
 * Resolves the running environment from Vercel's system env vars.
 * `VERCEL_ENV` is the source of truth on Vercel ("production" | "preview" |
 * "development"); outside Vercel (local `next dev`, self-hosting, CI) we fall
 * back to `NODE_ENV`.
 */
export function getDeploymentEnvironment(): DeploymentEnvironment {
  const vercelEnv = process.env.VERCEL_ENV?.trim()
  if (
    vercelEnv === "production" ||
    vercelEnv === "preview" ||
    vercelEnv === "development"
  ) {
    return vercelEnv
  }
  return process.env.NODE_ENV === "production" ? "production" : "development"
}

/**
 * Normalizes an env var value (either a bare host like Vercel's `*_URL` host
 * vars or a full URL) into an origin. Returns undefined for empty or
 * unparseable values instead of throwing at module load.
 */
function toOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  try {
    const url = /^https?:\/\//.test(trimmed)
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`)
    return url.origin
  } catch {
    return undefined
  }
}

function uniqueOrigins(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function localPort(): string {
  return process.env.PORT?.trim() || "3000"
}

function environmentOrigins(environment: DeploymentEnvironment): string[] {
  switch (environment) {
    case "production":
      return uniqueOrigins([
        // The production domain assigned to the project (custom domain or
        // <project>.vercel.app), stable across deployments.
        toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
        // The generated per-deployment URL still serves production traffic
        // when visited directly.
        toOrigin(process.env.VERCEL_URL),
        // v0/self-hosted runtimes expose only this var, even in production.
        toOrigin(process.env.V0_RUNTIME_URL),
      ])
    case "preview":
      return uniqueOrigins([
        // Stable per-branch alias (<project>-git-<branch>-<scope>.vercel.app).
        toOrigin(process.env.VERCEL_BRANCH_URL),
        // Unique URL of this specific preview deployment.
        toOrigin(process.env.VERCEL_URL),
        toOrigin(process.env.V0_RUNTIME_URL),
      ])
    case "development":
      return uniqueOrigins([
        `http://localhost:${localPort()}`,
        `http://127.0.0.1:${localPort()}`,
        // `vercel dev` and hosted dev runtimes (e.g. v0) expose their public
        // host through these vars.
        toOrigin(process.env.VERCEL_URL),
        toOrigin(process.env.V0_RUNTIME_URL),
      ])
  }
}

/**
 * Base URL Better Auth should consider itself served from. An explicit
 * `BETTER_AUTH_URL` always wins; otherwise the URL is derived from the
 * Vercel system variable that matches the current environment.
 */
export function getAuthBaseUrl(): string | undefined {
  const explicitUrl = process.env.BETTER_AUTH_URL?.trim()
  if (explicitUrl) return explicitUrl

  switch (getDeploymentEnvironment()) {
    case "production":
      return (
        toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
        toOrigin(process.env.VERCEL_URL) ??
        toOrigin(process.env.V0_RUNTIME_URL)
      )
    case "preview":
      return (
        toOrigin(process.env.VERCEL_URL) ??
        toOrigin(process.env.VERCEL_BRANCH_URL) ??
        toOrigin(process.env.V0_RUNTIME_URL)
      )
    case "development":
      return (
        toOrigin(process.env.V0_RUNTIME_URL) ??
        toOrigin(process.env.VERCEL_URL) ??
        `http://localhost:${localPort()}`
      )
  }
}

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"])

function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return LOOPBACK_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")
  } catch {
    return false
  }
}

/**
 * Trusted origins for Better Auth, scoped to the current environment so a
 * preview deployment never has to trust production origins and vice versa.
 *
 * In production and preview this is a static allowlist built from the Vercel
 * system vars for that environment. In development the check is softened:
 * alongside the static list, any loopback origin the request itself comes
 * from is trusted, so local work isn't pinned to a single port.
 */
export function getTrustedOrigins():
  | string[]
  | ((request?: Request) => string[]) {
  const environment = getDeploymentEnvironment()
  const staticOrigins = uniqueOrigins([
    toOrigin(process.env.BETTER_AUTH_URL),
    ...environmentOrigins(environment),
  ])

  if (environment !== "development") return staticOrigins

  return (request) => {
    const requestOrigin = toOrigin(request?.headers.get("origin") ?? undefined)
    if (requestOrigin && isLoopbackOrigin(requestOrigin)) {
      return uniqueOrigins([...staticOrigins, requestOrigin])
    }
    return staticOrigins
  }
}

/**
 * Single audience for RFC 8707 `resource` on the token endpoint.
 *
 * On `@better-auth/oauth-provider` 1.6.x, a multi-entry `validAudiences`
 * allowlist is unsafe (GHSA-p2fr-6hmx-4528): clients can mint a JWT for any
 * allow-listed resource without binding it to the authorization grant.
 * Keep exactly one audience — the MCP resource URL — until upgrading to a
 * release that binds resources to the grant.
 */
export function getOAuthValidAudiences(): string[] | undefined {
  const base = getAuthBaseUrl()?.replace(/\/$/, "")
  if (!base) return undefined
  return [`${base}/api/mcp`]
}
