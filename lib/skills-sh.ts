import "server-only"

import { getVercelOidcToken } from "@vercel/oidc"
import { cacheLife, cacheTag } from "next/cache"

import { cacheTags } from "@/lib/cache-tags"

export interface CatalogSkill {
  id: string
  name: string
  slug: string
  description: string
  source: string
  owner: string
  repo: string
  installUrl: string
  installs: number
  isDuplicate?: boolean
}

interface CatalogResponse {
  skills?: unknown[]
  data?: unknown[]
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

async function catalogFetch(path: string) {
  const token = await getVercelOidcToken()
  const response = await fetch(`https://skills.sh${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(response.status === 401 ? "Skills discovery requires Vercel OIDC Federation" : "Skills catalog is temporarily unavailable")
  const payload = (await response.json()) as CatalogResponse | unknown[]
  const items = Array.isArray(payload) ? payload : payload.skills ?? payload.data ?? []
  return items.map(normalizeSkill).filter((skill): skill is CatalogSkill => Boolean(skill && !skill.isDuplicate))
}

export async function getLeaderboard(view: "all-time" | "trending" | "hot" = "trending") {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog, cacheTags.catalogView(view))

  return catalogFetch(`/api/v1/skills?view=${view}&page=1&perPage=24`)
}

async function searchCatalogCached(query: string) {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog)

  return catalogFetch(`/api/v1/skills/search?q=${encodeURIComponent(query)}&limit=24`)
}

export async function searchCatalog(query: string) {
  const normalizedQuery = query.trim().toLowerCase().slice(0, 100)
  if (normalizedQuery.length < 2) return []
  return searchCatalogCached(normalizedQuery)
}

export async function getCuratedSkills() {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog, cacheTags.catalogView("curated"))

  return catalogFetch("/api/v1/skills/curated")
}
