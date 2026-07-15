import "server-only"

import { getVercelOidcToken } from "@vercel/oidc"
import { cacheLife, cacheTag } from "next/cache"

import {
  CATALOG_PAGE_SIZE,
  SEARCH_MAX_LIMIT,
  SEARCH_PAGE_SIZE,
  type CatalogPage,
  type CatalogSkill,
  type CatalogView,
} from "@/lib/catalog"
import { cacheTags } from "@/lib/cache-tags"

export type { CatalogPage, CatalogSkill, CatalogView }
export { CATALOG_PAGE_SIZE, SEARCH_MAX_LIMIT, SEARCH_PAGE_SIZE }

interface CatalogResponse {
  skills?: unknown[]
  data?: unknown[]
  pagination?: {
    hasMore?: boolean
    page?: number
    perPage?: number
    per_page?: number
    total?: number
  }
}

function normalizeSkill(value: unknown): CatalogSkill | null {
  if (!value || typeof value !== "object") return null
  const item = value as Record<string, unknown>
  const source = String(item.source ?? item.repository ?? item.repo ?? "")
  const [owner = "", repo = ""] = source.replace("https://github.com/", "").split("/")
  const slug = String(item.slug ?? item.name ?? "")
  if (!slug || (!source && !item.installUrl)) return null
  const installUrl = String(item.installUrl ?? `https://github.com/${owner}/${repo}`)
  return {
    id: String(item.id ?? `${source}:${slug}`),
    name: String(item.name ?? slug),
    slug,
    description: String(item.description ?? "A reusable agent skill."),
    source: source || `${owner}/${repo}`,
    owner: String(item.owner ?? owner),
    repo: String(item.repo ?? repo),
    installUrl,
    installs: Number(item.installs ?? item.installCount ?? 0),
    isDuplicate: Boolean(item.isDuplicate),
  }
}

function normalizeSkills(values: unknown[]): CatalogSkill[] {
  return values
    .map(normalizeSkill)
    .filter((skill): skill is CatalogSkill => Boolean(skill && !skill.isDuplicate))
}

function flattenCurated(data: unknown[]): CatalogSkill[] {
  const nested = data.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return []
    const skills = (entry as { skills?: unknown[] }).skills
    return Array.isArray(skills) ? skills : [entry]
  })
  return normalizeSkills(nested)
}

async function catalogRequest(path: string): Promise<CatalogResponse | unknown[]> {
  const token = await getVercelOidcToken()
  const response = await fetch(`https://skills.sh${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Skills discovery requires Vercel OIDC Federation"
        : "Skills catalog is temporarily unavailable",
    )
  }
  return (await response.json()) as CatalogResponse | unknown[]
}

export async function getLeaderboard(
  view: "all-time" | "trending" | "hot" = "trending",
  page = 0,
  perPage = CATALOG_PAGE_SIZE,
): Promise<CatalogPage> {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog, cacheTags.catalogView(view))

  const safePage = Math.max(0, Math.floor(page))
  const safePerPage = Math.min(100, Math.max(1, Math.floor(perPage)))
  const payload = await catalogRequest(
    `/api/v1/skills?view=${view}&page=${safePage}&per_page=${safePerPage}`,
  )

  if (Array.isArray(payload)) {
    const skills = normalizeSkills(payload)
    return {
      skills,
      page: safePage,
      perPage: safePerPage,
      hasMore: skills.length >= safePerPage,
      source: "leaderboard",
      view,
    }
  }

  const skills = normalizeSkills(Array.isArray(payload.data) ? payload.data : payload.skills ?? [])
  const hasMore = Boolean(payload.pagination?.hasMore) || skills.length >= safePerPage

  return {
    skills,
    page: safePage,
    perPage: safePerPage,
    hasMore,
    source: "leaderboard",
    view,
  }
}

async function searchCatalogCached(query: string, limit: number): Promise<CatalogPage> {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog)

  // Request one extra row so we can tell when the catalog has more matches.
  const fetchLimit = Math.min(SEARCH_MAX_LIMIT + 1, limit + 1)
  const payload = await catalogRequest(
    `/api/v1/skills/search?q=${encodeURIComponent(query)}&limit=${fetchLimit}`,
  )

  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.skills)
      ? payload.skills
      : Array.isArray(payload.data)
        ? payload.data
        : []
  const normalized = normalizeSkills(rows)
  const hasMore = rows.length > limit
  const skills = hasMore ? normalized.slice(0, limit) : normalized

  return {
    skills,
    page: 0,
    perPage: limit,
    hasMore,
    source: "search",
    query,
  }
}

export async function searchCatalog(
  query: string,
  options: { limit?: number } = {},
): Promise<CatalogPage> {
  const normalizedQuery = query.trim().toLowerCase().slice(0, 100)
  if (normalizedQuery.length < 2) {
    return { skills: [], page: 0, perPage: 0, hasMore: false, source: "search", query: normalizedQuery }
  }

  const limit = Math.min(
    SEARCH_MAX_LIMIT,
    Math.max(SEARCH_PAGE_SIZE, Math.floor(options.limit ?? SEARCH_PAGE_SIZE)),
  )
  return searchCatalogCached(normalizedQuery, limit)
}

export async function getCuratedSkills(): Promise<CatalogPage> {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog, cacheTags.catalogView("curated"))

  const payload = await catalogRequest("/api/v1/skills/curated")
  const skills = Array.isArray(payload)
    ? normalizeSkills(payload)
    : flattenCurated(Array.isArray(payload.data) ? payload.data : payload.skills ?? [])

  return {
    skills,
    page: 0,
    perPage: skills.length,
    hasMore: false,
    source: "curated",
  }
}
