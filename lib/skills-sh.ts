import "server-only"

import { getVercelOidcToken } from "@vercel/oidc"
import { cacheLife, cacheTag } from "next/cache"

import { parseDocument } from "yaml"

import {
  CATALOG_PAGE_SIZE,
  SEARCH_MAX_LIMIT,
  SEARCH_PAGE_SIZE,
  catalogSkillDetailId,
  isCatalogSkillId,
  type CatalogPage,
  type CatalogSkill,
  type CatalogSkillDetail,
  type CatalogView,
} from "@/lib/catalog"
import { cacheTags } from "@/lib/cache-tags"

export type { CatalogPage, CatalogSkill, CatalogSkillDetail, CatalogView }
export { CATALOG_PAGE_SIZE, SEARCH_MAX_LIMIT, SEARCH_PAGE_SIZE, isCatalogSkillId }

const DEFAULT_DESCRIPTION = "A reusable agent skill."

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
  const resolvedSource = source || `${owner}/${repo}`
  const fallbackId = catalogSkillDetailId(resolvedSource, slug)
  const id = typeof item.id === "string" && isCatalogSkillId(item.id)
    ? item.id
    : fallbackId
  if (!isCatalogSkillId(id)) return null
  const installUrl = String(item.installUrl ?? `https://github.com/${owner}/${repo}`)
  return {
    id,
    name: String(item.name ?? slug),
    slug,
    description: String(item.description ?? DEFAULT_DESCRIPTION),
    source: resolvedSource,
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

function parseSkillMdMeta(contents: string): { name?: string; description?: string } {
  const lines = contents.replace(/\r\n?/g, "\n").split("\n")
  if (lines[0]?.trim() !== "---") return {}

  const closingIndex = lines.findIndex((line, index) => (
    index > 0 && (line.trim() === "---" || line.trim() === "...")
  ))
  if (closingIndex < 0) return {}

  try {
    const document = parseDocument(lines.slice(1, closingIndex).join("\n"), {
      strict: true,
      uniqueKeys: true,
    })
    if (document.errors.length > 0) return {}

    const metadata = document.toJS({ maxAliasCount: 20 }) as unknown
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {}

    const { name, description } = metadata as Record<string, unknown>
    return {
      name: typeof name === "string" ? name.trim() : undefined,
      description: typeof description === "string"
        ? description.replace(/[\r\n]+/g, " ").trim()
        : undefined,
    }
  } catch {
    return {}
  }
}

function readNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function readNonNegativeCount(value: unknown) {
  const count = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN
  return Number.isFinite(count) && count >= 0 ? count : null
}

async function getSkillDetailCached(id: string): Promise<CatalogSkillDetail> {
  "use cache"
  cacheLife("catalog")
  cacheTag(cacheTags.catalog, cacheTags.catalogSkill(id))

  const path = id.split("/").map(encodeURIComponent).join("/")
  const payload = await catalogRequest(`/api/v1/skills/${path}`)
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Skill details unavailable")
  }

  const item = payload as Record<string, unknown>
  const source = readNonEmptyString(item.source)
  const slug = readNonEmptyString(item.slug)
  const installs = readNonNegativeCount(item.installs ?? 0)
  if (!source || !slug || installs === null) {
    throw new Error("Skill details unavailable")
  }

  const files = Array.isArray(item.files) ? item.files : []
  const skillMd = files.find((file) => {
    if (!file || typeof file !== "object") return false
    const pathValue = String((file as { path?: unknown }).path ?? "")
    return pathValue === "SKILL.md" || pathValue.endsWith("/SKILL.md")
  }) as { contents?: unknown } | undefined

  const meta = typeof skillMd?.contents === "string"
    ? parseSkillMdMeta(skillMd.contents)
    : {}

  const detailId = readNonEmptyString(item.id)
  return {
    id: detailId && isCatalogSkillId(detailId) ? detailId : catalogSkillDetailId(source, slug),
    source,
    slug,
    name: meta.name || slug,
    description: meta.description || DEFAULT_DESCRIPTION,
    installs,
  }
}

export async function getSkillDetail(id: string): Promise<CatalogSkillDetail> {
  if (!isCatalogSkillId(id)) {
    throw new Error("Invalid skill id")
  }
  return getSkillDetailCached(id)
}
