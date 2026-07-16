import "server-only"

import { parseDocument } from "yaml"

import { isValidAgentSkillName } from "@/lib/agent-skill-name"
import { parseGitHubUrl } from "@/lib/github"
import {
  parseGitHubSkillLink,
  resolveGitHubSkillLink,
} from "@/lib/github-skill-link"

const MAX_TREE_ENTRIES = 20_000
const MAX_TREE_RESPONSE_BYTES = 20 * 1024 * 1024
const MAX_API_RESPONSE_BYTES = 1024 * 1024
const MAX_REPOSITORY_PATH_LENGTH = 512
const MAX_DESCRIPTOR_CANDIDATES = 100
const MAX_DESCRIPTOR_BYTES = 256 * 1024
const MAX_TOTAL_DESCRIPTOR_BYTES = 4 * 1024 * 1024
const MAX_PLUGIN_MANIFEST_BYTES = 256 * 1024
const MAX_MATCHING_REFS = 1_000
const DESCRIPTOR_CONCURRENCY = 6
const GITHUB_TIMEOUT_MS = 15_000

// Mirrors the repository containers discovered by the skills CLI. Declared
// plugin sources are preferred over provider-specific copies, and
// .agents/skills is excluded because it is installation output.
const CORE_SKILL_CONTAINERS = [
  "skills",
  "skills/.curated",
  "skills/.experimental",
  "skills/.system",
  "data/skills",
] as const

const AGENT_SKILL_CONTAINERS = [
  ".aider-desk/skills",
  ".autohand/skills",
  ".augment/skills",
  ".bob/skills",
  ".claude/skills",
  ".cline/skills",
  ".codeartsdoer/skills",
  ".codebuddy/skills",
  ".codemaker/skills",
  ".codestudio/skills",
  ".codex/skills",
  ".commandcode/skills",
  ".continue/skills",
  ".cortex/skills",
  ".crush/skills",
  ".devin/skills",
  ".factory/skills",
  "agent/skills",
  ".forge/skills",
  ".github/skills",
  ".goose/skills",
  ".hermes/skills",
  ".inferencesh/skills",
  ".jazz/skills",
  ".junie/skills",
  ".iflow/skills",
  ".kilocode/skills",
  ".kiro/skills",
  ".kode/skills",
  ".lingma/skills",
  ".mcpjam/skills",
  ".vibe/skills",
  ".moxby/skills",
  ".mux/skills",
  ".opencode/skills",
  ".openhands/skills",
  ".ona/skills",
  ".pi/skills",
  ".qoder/skills",
  ".qwen/skills",
  ".reasonix/skills",
  ".rovodev/skills",
  ".roo/skills",
  ".tabnine/agent/skills",
  ".terramind/skills",
  ".tinycloud/skills",
  ".trae/skills",
  ".windsurf/skills",
  ".zcode/skills",
  ".zencoder/skills",
  ".neovate/skills",
  ".pochi/skills",
  ".adal/skills",
] as const

interface GitHubRepositoryResponse {
  default_branch: string
  stargazers_count: number
  updated_at: string
}

interface GitHubCommitResponse {
  sha: string
  commit: {
    tree: {
      sha: string
    }
  }
}

interface GitHubTreeResponse {
  truncated: boolean
  tree: unknown[]
}

export interface GitHubTreeEntry {
  path: string
  mode: string
  type: "blob" | "tree" | "commit"
  sha: string
  size?: number
}

export interface DiscoveredGitHubSkill {
  name: string
  description: string
  /** Repository-relative folder containing SKILL.md. The repository root is "". */
  path: string
}

export interface GitHubSkillDiscovery {
  githubUrl: string
  repoOwner: string
  repoName: string
  repoStars: number
  repoUpdatedAt: Date
  defaultBranch: string
  /** Commit on the repository's default branch used for both the tree and descriptors. */
  commitSha: string
  tree: GitHubTreeEntry[]
  skills: DiscoveredGitHubSkill[]
  /** Exact path selected by a direct GitHub skill link, otherwise null. */
  linkedSkillPath: string | null
}

export interface ResolvedGitHubSkill extends GitHubSkillDiscovery {
  skill: DiscoveredGitHubSkill
}

type GitHubRepositorySnapshot = Omit<GitHubSkillDiscovery, "skills" | "linkedSkillPath">

export type GitHubSkillDiscoveryErrorCode =
  | "invalid_url"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "repository_too_large"
  | "invalid_path"
  | "skill_not_found"

export class GitHubSkillDiscoveryError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: GitHubSkillDiscoveryErrorCode,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "GitHubSkillDiscoveryError"
  }
}

interface DescriptorCandidate {
  entry: GitHubTreeEntry
  path: string
}

function githubApiHeaders(accept = "application/vnd.github+json") {
  const token = process.env.GITHUB_TOKEN?.trim()

  return {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function rateLimitError() {
  return new GitHubSkillDiscoveryError(
    "GitHub's API limit has been reached. Try again later.",
    429,
    "rate_limited",
  )
}

async function fetchGitHubResponse(url: string, accept?: string) {
  let response: Response

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: githubApiHeaders(accept),
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    })
  } catch (error) {
    throw new GitHubSkillDiscoveryError(
      "GitHub did not respond in time. Try again.",
      502,
      "unavailable",
      { cause: error },
    )
  }

  if (response.ok) return response

  if (
    response.status === 429
    || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")
  ) {
    throw rateLimitError()
  }
  if (response.status === 404) {
    throw new GitHubSkillDiscoveryError(
      "The GitHub repository or commit could not be found.",
      404,
      "not_found",
    )
  }

  throw new GitHubSkillDiscoveryError(
    "GitHub could not inspect this repository.",
    502,
    "unavailable",
  )
}

async function readLimitedBytes(response: Response, maxBytes: number) {
  const reportedSize = Number(response.headers.get("content-length"))
  if (Number.isFinite(reportedSize) && reportedSize > maxBytes) {
    throw new GitHubSkillDiscoveryError(
      "The GitHub response is too large to inspect safely.",
      413,
      "repository_too_large",
    )
  }

  let bytes: Uint8Array
  try {
    bytes = new Uint8Array(await response.arrayBuffer())
  } catch (error) {
    throw new GitHubSkillDiscoveryError(
      "GitHub did not finish sending the repository data. Try again.",
      502,
      "unavailable",
      { cause: error },
    )
  }
  if (bytes.byteLength > maxBytes) {
    throw new GitHubSkillDiscoveryError(
      "The GitHub response is too large to inspect safely.",
      413,
      "repository_too_large",
    )
  }
  return bytes
}

async function fetchGitHubJson<T>(url: string, maxBytes = MAX_API_RESPONSE_BYTES): Promise<T> {
  const response = await fetchGitHubResponse(url)
  const bytes = await readLimitedBytes(response, maxBytes)

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as T
  } catch (error) {
    throw new GitHubSkillDiscoveryError(
      "GitHub returned an invalid response.",
      502,
      "unavailable",
      { cause: error },
    )
  }
}

function isSafeRepositoryPath(path: string, allowEmpty = false) {
  if (!path) return allowEmpty
  if (
    path.length > MAX_REPOSITORY_PATH_LENGTH
    || path.startsWith("/")
    || path.endsWith("/")
    || path.includes("\\")
    || /[\0-\x1f\x7f]/.test(path)
  ) return false

  return path.split("/").every((segment) => segment && segment !== "." && segment !== "..")
}

function parseTreeEntry(value: unknown): GitHubTreeEntry {
  if (!value || typeof value !== "object") throw invalidGitHubResponseError()
  const candidate = value as Record<string, unknown>
  const { path, mode, type, sha, size } = candidate

  if (
    typeof path !== "string"
    || typeof mode !== "string"
    || (type !== "blob" && type !== "tree" && type !== "commit")
    || typeof sha !== "string"
    || !isGitObjectSha(sha)
    || (size !== undefined && (!Number.isSafeInteger(size) || (size as number) < 0))
  ) throw invalidGitHubResponseError()

  return {
    path,
    mode,
    type,
    sha,
    ...(typeof size === "number" ? { size } : {}),
  }
}

function invalidGitHubResponseError() {
  return new GitHubSkillDiscoveryError(
    "GitHub returned an invalid repository response.",
    502,
    "unavailable",
  )
}

function isGitObjectSha(value: string) {
  return /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/i.test(value)
}

function descriptorFolderPath(path: string) {
  return path === "SKILL.md" ? "" : path.slice(0, -"/SKILL.md".length)
}

function hasAgentInstallOutputSegment(path: string) {
  return path
    .split("/")
    .some((segment) => segment.toLowerCase() === ".agents")
}

function isAgentInstallOutput(path: string) {
  return hasAgentInstallOutputSegment(descriptorFolderPath(path))
}

function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/")
}

function parseMatchingRefs(value: unknown, namespace: "heads" | "tags") {
  if (!Array.isArray(value) || value.length > MAX_MATCHING_REFS) {
    throw invalidGitHubResponseError()
  }

  const prefix = `refs/${namespace}/`
  return value.map((candidate) => {
    if (!candidate || typeof candidate !== "object") throw invalidGitHubResponseError()
    const ref = (candidate as Record<string, unknown>).ref
    if (typeof ref !== "string" || !ref.startsWith(prefix) || ref.length === prefix.length) {
      throw invalidGitHubResponseError()
    }
    return ref.slice(prefix.length)
  })
}

async function fetchMatchingGitHubRefs(
  snapshot: GitHubRepositorySnapshot,
  refPrefix: string,
) {
  if (
    !refPrefix
    || refPrefix.length > MAX_REPOSITORY_PATH_LENGTH
    || /[\0-\x1f\x7f]/.test(refPrefix)
  ) {
    throw new GitHubSkillDiscoveryError(
      "The direct skill link contains an invalid Git ref.",
      400,
      "invalid_path",
    )
  }

  const repositoryUrl = `https://api.github.com/repos/${encodeURIComponent(snapshot.repoOwner)}/${encodeURIComponent(snapshot.repoName)}`
  const encodedPrefix = encodeGitHubPath(refPrefix)
  const [heads, tags] = await Promise.all([
    fetchGitHubJson<unknown>(`${repositoryUrl}/git/matching-refs/heads/${encodedPrefix}`),
    fetchGitHubJson<unknown>(`${repositoryUrl}/git/matching-refs/tags/${encodedPrefix}`),
  ])

  return [
    snapshot.defaultBranch,
    snapshot.commitSha,
    ...parseMatchingRefs(heads, "heads"),
    ...parseMatchingRefs(tags, "tags"),
  ]
}

function collectDescriptorCandidates(tree: GitHubTreeEntry[]) {
  return tree
    .map((entry): DescriptorCandidate | null => {
      if (
        entry.type !== "blob"
        || !["100644", "100755"].includes(entry.mode)
        || !isSafeRepositoryPath(entry.path)
        || (entry.path !== "SKILL.md" && !entry.path.endsWith("/SKILL.md"))
        || isAgentInstallOutput(entry.path)
      ) return null

      return {
        entry,
        path: descriptorFolderPath(entry.path),
      }
    })
    .filter((candidate): candidate is DescriptorCandidate => candidate !== null)
}

function containerRemainder(path: string, container: string) {
  if (!path.startsWith(`${container}/`)) return null
  return path.slice(container.length + 1).split("/")
}

function selectContainerCandidates(
  candidates: DescriptorCandidate[],
  container: string,
  maxDepth: 1 | 2,
  descriptorPaths: Set<string>,
) {
  return candidates.filter((candidate) => {
    const remainder = containerRemainder(candidate.path, container)
    if (!remainder || remainder.length < 1 || remainder.length > maxDepth) return false
    if (remainder.length === 1) return true

    const parentDescriptor = `${container}/${remainder[0]}/SKILL.md`.toLowerCase()
    return !descriptorPaths.has(parentDescriptor)
  })
}

function selectDefaultCandidates(
  candidates: DescriptorCandidate[],
  pluginContainers: string[],
) {
  const descriptorPaths = new Set(candidates.map((candidate) => candidate.entry.path.toLowerCase()))
  const selected: DescriptorCandidate[] = candidates.filter((candidate) => (
    candidate.path !== "" && candidate.path.split("/").length === 1
  ))
  const selectedPaths = new Set(selected.map((candidate) => candidate.entry.path))

  for (const container of CORE_SKILL_CONTAINERS) {
    for (const candidate of selectContainerCandidates(candidates, container, 2, descriptorPaths)) {
      if (selectedPaths.has(candidate.entry.path)) continue
      selected.push(candidate)
      selectedPaths.add(candidate.entry.path)
    }
  }

  for (const container of pluginContainers) {
    for (const candidate of selectContainerCandidates(candidates, container, 1, descriptorPaths)) {
      if (selectedPaths.has(candidate.entry.path)) continue
      selected.push(candidate)
      selectedPaths.add(candidate.entry.path)
    }
  }

  for (const container of AGENT_SKILL_CONTAINERS) {
    for (const candidate of selectContainerCandidates(candidates, container, 2, descriptorPaths)) {
      if (selectedPaths.has(candidate.entry.path)) continue
      selected.push(candidate)
      selectedPaths.add(candidate.entry.path)
    }
  }

  return selected
}

function selectFallbackCandidates(candidates: DescriptorCandidate[]) {
  return candidates.filter((candidate) => (
    candidate.path === "" || candidate.path.split("/").length <= 5
  ))
}

function validateDescriptorCandidates(candidates: DescriptorCandidate[]) {

  if (candidates.length > MAX_DESCRIPTOR_CANDIDATES) {
    throw new GitHubSkillDiscoveryError(
      `This repository contains more than ${MAX_DESCRIPTOR_CANDIDATES} skill definitions and is too large to inspect safely.`,
      413,
      "repository_too_large",
    )
  }

  let declaredBytes = 0
  for (const candidate of candidates) {
    const size = candidate.entry.size
    if (size !== undefined && size > MAX_DESCRIPTOR_BYTES) {
      throw new GitHubSkillDiscoveryError(
        `The skill definition at ${candidate.entry.path} is too large to inspect safely.`,
        413,
        "repository_too_large",
      )
    }
    declaredBytes += size ?? 0
  }
  if (declaredBytes > MAX_TOTAL_DESCRIPTOR_BYTES) {
    throw new GitHubSkillDiscoveryError(
      "The repository's skill definitions are too large to inspect safely.",
      413,
      "repository_too_large",
    )
  }

  return candidates
}

const CSI_ESCAPE = /\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g
const OSC_ESCAPE = /\x1b\][\s\S]*?(?:\x07|\x1b\\)/g
const DCS_PM_APC_ESCAPE = /\x1b[P^_][\s\S]*?(?:\x1b\\)/g
const SIMPLE_ESCAPE = /\x1b[\x20-\x7e]/g
const C1_CONTROL = /[\x80-\x9f]/g
const TERMINAL_CONTROL = /[\x00-\x06\x07\x08\x0b\x0c\x0d-\x1a\x1c-\x1f\x7f]/g

function sanitizeMetadataString(value: string) {
  return value
    .replace(OSC_ESCAPE, "")
    .replace(DCS_PM_APC_ESCAPE, "")
    .replace(CSI_ESCAPE, "")
    .replace(SIMPLE_ESCAPE, "")
    .replace(C1_CONTROL, "")
    .replace(TERMINAL_CONTROL, "")
    .replace(/[\r\n]+/g, " ")
    .trim()
}

function parseSkillDescriptor(bytes: Uint8Array, path: string): DiscoveredGitHubSkill | null {
  let source: string
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n?/g, "\n")
  } catch {
    return null
  }

  const lines = source.split("\n")
  if (lines[0]?.trim() !== "---") return null

  const closingIndex = lines.findIndex((line, index) => (
    index > 0 && (line.trim() === "---" || line.trim() === "...")
  ))
  if (closingIndex < 0) return null

  try {
    const document = parseDocument(lines.slice(1, closingIndex).join("\n"), {
      strict: true,
      uniqueKeys: true,
    })
    if (document.errors.length > 0) return null

    const metadata = document.toJS({ maxAliasCount: 20 }) as unknown
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null

    const { name, description } = metadata as Record<string, unknown>
    if (typeof name !== "string" || typeof description !== "string") return null

    const sanitizedDescription = sanitizeMetadataString(description)
    if (!isValidAgentSkillName(name) || !sanitizedDescription) return null

    return {
      name,
      description: sanitizedDescription,
      path,
    }
  } catch {
    return null
  }
}

async function fetchDescriptor(
  repoOwner: string,
  repoName: string,
  commitSha: string,
  entry: GitHubTreeEntry,
) {
  let response: Response
  try {
    response = await fetch(
      `https://raw.githubusercontent.com/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/${encodeURIComponent(commitSha)}/${encodeGitHubPath(entry.path)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
      },
    )
  } catch (error) {
    throw new GitHubSkillDiscoveryError(
      `GitHub did not finish downloading ${entry.path}. Try again.`,
      502,
      "unavailable",
      { cause: error },
    )
  }

  if (response.status === 429) throw rateLimitError()
  if (response.status === 404) {
    throw new GitHubSkillDiscoveryError(
      `The skill definition at ${entry.path} could not be found.`,
      404,
      "not_found",
    )
  }
  if (!response.ok) {
    throw new GitHubSkillDiscoveryError(
      `GitHub could not download ${entry.path}.`,
      502,
      "unavailable",
    )
  }

  return readLimitedBytes(response, MAX_DESCRIPTOR_BYTES)
}

function resolveRelativeRepositoryPath(basePath: string, relativePath: unknown) {
  if (typeof relativePath !== "string" || !relativePath.startsWith("./")) return null

  const resolved: string[] = basePath ? basePath.split("/") : []
  for (const segment of relativePath.slice(2).split("/")) {
    if (!segment || segment === ".") continue
    if (segment === "..") {
      if (!resolved.length) return null
      resolved.pop()
      continue
    }
    resolved.push(segment)
  }

  const path = resolved.join("/")
  if (!isSafeRepositoryPath(path, true) || hasAgentInstallOutputSegment(path)) return null
  return path
}

function repositoryPath(basePath: string, childPath: string) {
  const path = [basePath, childPath].filter(Boolean).join("/")
  return isSafeRepositoryPath(path) && !hasAgentInstallOutputSegment(path) ? path : null
}

async function readPluginManifest(
  snapshot: GitHubRepositorySnapshot,
  path: string,
) {
  const entry = snapshot.tree.find((candidate) => (
    candidate.path === path
    && candidate.type === "blob"
    && ["100644", "100755"].includes(candidate.mode)
  ))
  if (!entry || (entry.size !== undefined && entry.size > MAX_PLUGIN_MANIFEST_BYTES)) return null

  try {
    const bytes = await fetchDescriptor(
      snapshot.repoOwner,
      snapshot.repoName,
      snapshot.commitSha,
      entry,
    )
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

function addPluginContainers(
  containers: Set<string>,
  pluginBase: string,
  skills: unknown,
) {
  if (Array.isArray(skills)) {
    for (const skillPath of skills) {
      const resolved = resolveRelativeRepositoryPath(pluginBase, skillPath)
      if (resolved === null) continue
      const parent = resolved.split("/").slice(0, -1).join("/")
      if (parent && !hasAgentInstallOutputSegment(parent)) containers.add(parent)
    }
  }

  const defaultContainer = repositoryPath(pluginBase, "skills")
  if (defaultContainer) containers.add(defaultContainer)
}

async function discoverPluginContainers(snapshot: GitHubRepositorySnapshot) {
  const containers = new Set<string>()
  const marketplace = await readPluginManifest(snapshot, ".claude-plugin/marketplace.json")

  if (marketplace) {
    const metadata = marketplace.metadata
    const pluginRootValue = metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>).pluginRoot
      : undefined
    const pluginRoot = pluginRootValue === undefined
      ? ""
      : resolveRelativeRepositoryPath("", pluginRootValue)

    if (pluginRoot !== null && Array.isArray(marketplace.plugins)) {
      for (const value of marketplace.plugins) {
        if (!value || typeof value !== "object" || Array.isArray(value)) continue
        const plugin = value as Record<string, unknown>
        const pluginBase = plugin.source === undefined
          ? pluginRoot
          : resolveRelativeRepositoryPath(pluginRoot, plugin.source)
        if (pluginBase === null) continue
        addPluginContainers(containers, pluginBase, plugin.skills)
      }
    }
  }

  const pluginManifest = await readPluginManifest(snapshot, ".claude-plugin/plugin.json")
  if (pluginManifest) addPluginContainers(containers, "", pluginManifest.skills)

  return [...containers]
}

async function discoverDescriptors(
  candidates: DescriptorCandidate[],
  repoOwner: string,
  repoName: string,
  commitSha: string,
) {
  const parsed = new Array<DiscoveredGitHubSkill | null>(candidates.length).fill(null)
  const downloadsBySha = new Map<string, Promise<Uint8Array>>()
  let nextIndex = 0
  let totalBytes = 0

  async function worker() {
    while (nextIndex < candidates.length) {
      const index = nextIndex
      nextIndex += 1
      const candidate = candidates[index]

      let download = downloadsBySha.get(candidate.entry.sha)
      if (!download) {
        download = fetchDescriptor(repoOwner, repoName, commitSha, candidate.entry)
        downloadsBySha.set(candidate.entry.sha, download)
      }

      const bytes = await download
      totalBytes += bytes.byteLength
      if (totalBytes > MAX_TOTAL_DESCRIPTOR_BYTES) {
        throw new GitHubSkillDiscoveryError(
          "The repository's skill definitions are too large to inspect safely.",
          413,
          "repository_too_large",
        )
      }
      parsed[index] = parseSkillDescriptor(bytes, candidate.path)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(DESCRIPTOR_CONCURRENCY, candidates.length) }, () => worker()),
  )

  const skills: DiscoveredGitHubSkill[] = []
  const canonicalNames = new Set<string>()
  for (const skill of parsed) {
    if (!skill) continue
    const canonicalName = skill.name.toLowerCase()
    if (canonicalNames.has(canonicalName)) continue
    canonicalNames.add(canonicalName)
    skills.push(skill)
  }
  return skills
}

function parseRepositoryUrl(value: string) {
  try {
    return parseGitHubUrl(value)
  } catch (error) {
    throw new GitHubSkillDiscoveryError(
      "Use a valid github.com repository URL.",
      400,
      "invalid_url",
      { cause: error },
    )
  }
}

function normalizeSkillPath(value: string) {
  let path = value.replace(/^\/+|\/+$/g, "")
  if (path === "SKILL.md") path = ""
  else if (path.endsWith("/SKILL.md")) path = path.slice(0, -"/SKILL.md".length)

  if (!isSafeRepositoryPath(path, true) || hasAgentInstallOutputSegment(path)) {
    throw new GitHubSkillDiscoveryError(
      "The selected skill path is invalid.",
      400,
      "invalid_path",
    )
  }
  return path
}

async function fetchGitHubRepositorySnapshot(value: string): Promise<GitHubRepositorySnapshot> {
  const parsedUrl = parseRepositoryUrl(value)
  const repositoryUrl = `https://api.github.com/repos/${encodeURIComponent(parsedUrl.repoOwner)}/${encodeURIComponent(parsedUrl.repoName)}`
  const repository = await fetchGitHubJson<GitHubRepositoryResponse>(repositoryUrl)

  if (
    !repository
    || typeof repository !== "object"
    || typeof repository.default_branch !== "string"
    || !repository.default_branch
    || !Number.isSafeInteger(repository.stargazers_count)
    || repository.stargazers_count < 0
    || typeof repository.updated_at !== "string"
  ) throw invalidGitHubResponseError()

  const repoUpdatedAt = new Date(repository.updated_at)
  if (Number.isNaN(repoUpdatedAt.getTime())) throw invalidGitHubResponseError()

  const commit = await fetchGitHubJson<GitHubCommitResponse>(
    `${repositoryUrl}/commits/${encodeURIComponent(repository.default_branch)}`,
  )
  if (
    !commit
    || typeof commit !== "object"
    || !isGitObjectSha(commit.sha)
    || !commit.commit
    || !commit.commit.tree
    || !isGitObjectSha(commit.commit.tree.sha)
  ) throw invalidGitHubResponseError()

  const rawTree = await fetchGitHubJson<GitHubTreeResponse>(
    `${repositoryUrl}/git/trees/${encodeURIComponent(commit.commit.tree.sha)}?recursive=1`,
    MAX_TREE_RESPONSE_BYTES,
  )
  if (
    !rawTree
    || typeof rawTree !== "object"
    || typeof rawTree.truncated !== "boolean"
    || !Array.isArray(rawTree.tree)
  ) {
    throw invalidGitHubResponseError()
  }
  if (rawTree.truncated || rawTree.tree.length > MAX_TREE_ENTRIES) {
    throw new GitHubSkillDiscoveryError(
      "This repository is too large to locate its skills safely.",
      413,
      "repository_too_large",
    )
  }

  const tree = rawTree.tree.map(parseTreeEntry)

  return {
    ...parsedUrl,
    repoStars: repository.stargazers_count,
    repoUpdatedAt,
    defaultBranch: repository.default_branch,
    commitSha: commit.sha,
    tree,
  }
}

export async function discoverGitHubSkills(value: string): Promise<GitHubSkillDiscovery> {
  const snapshot = await fetchGitHubRepositorySnapshot(value)
  const candidates = collectDescriptorCandidates(snapshot.tree)

  const inspectCandidates = (selected: DescriptorCandidate[]) => discoverDescriptors(
    validateDescriptorCandidates(selected),
    snapshot.repoOwner,
    snapshot.repoName,
    snapshot.commitSha,
  )

  const parsedLink = parseGitHubSkillLink(value)
  if (parsedLink.kind === "invalid") {
    throw new GitHubSkillDiscoveryError(
      "Use a valid direct GitHub skill link.",
      400,
      "invalid_path",
    )
  }
  if (parsedLink.kind === "content" && !parsedLink.refAndPath.length) {
    throw new GitHubSkillDiscoveryError(
      "The direct skill link does not include a Git ref.",
      400,
      "invalid_path",
    )
  }

  const link = parsedLink.kind === "content"
    ? resolveGitHubSkillLink(
        parsedLink,
        await fetchMatchingGitHubRefs(snapshot, parsedLink.refAndPath[0]),
      )
    : null
  if (link?.kind === "unsupported_ref") {
    throw new GitHubSkillDiscoveryError(
      "Direct skill links must point to the repository's current default branch.",
      400,
      "invalid_path",
    )
  }
  if (link?.kind === "invalid_skill_path") {
    throw new GitHubSkillDiscoveryError(
      "Use a direct link to a skill folder or its SKILL.md file.",
      400,
      "invalid_path",
    )
  }
  if (link?.kind === "skill") {
    if (link.ref !== snapshot.defaultBranch && link.ref !== snapshot.commitSha) {
      throw new GitHubSkillDiscoveryError(
        "Direct skill links must point to the repository's current default branch.",
        400,
        "invalid_path",
      )
    }

    const normalizedPath = normalizeSkillPath(link.path)
    const linkedCandidate = candidates.find((candidate) => (
      candidate.path === normalizedPath
    ))
    if (!linkedCandidate) {
      throw new GitHubSkillDiscoveryError(
        "The linked folder does not contain a valid SKILL.md definition.",
        404,
        "skill_not_found",
      )
    }

    const linkedSkills = await inspectCandidates([linkedCandidate])
    if (!linkedSkills.length) {
      throw new GitHubSkillDiscoveryError(
        "The linked folder does not contain a valid SKILL.md definition.",
        404,
        "skill_not_found",
      )
    }

    return {
      ...snapshot,
      skills: linkedSkills,
      linkedSkillPath: normalizedPath,
    }
  }

  const rootCandidate = candidates.find((candidate) => candidate.path === "")
  if (rootCandidate) {
    const rootSkills = await inspectCandidates([rootCandidate])
    if (rootSkills.length) {
      return { ...snapshot, skills: rootSkills, linkedSkillPath: null }
    }
  }

  const pluginContainers = await discoverPluginContainers(snapshot)
  const defaultSkills = await inspectCandidates(
    selectDefaultCandidates(candidates, pluginContainers),
  )
  if (defaultSkills.length) {
    return { ...snapshot, skills: defaultSkills, linkedSkillPath: null }
  }

  const skills = await inspectCandidates(selectFallbackCandidates(candidates))

  return { ...snapshot, skills, linkedSkillPath: null }
}

export async function resolveGitHubSkill(
  value: string,
  skillPath: string,
): Promise<ResolvedGitHubSkill> {
  const normalizedPath = normalizeSkillPath(skillPath)
  const snapshot = await fetchGitHubRepositorySnapshot(value)
  const descriptorPath = normalizedPath ? `${normalizedPath}/SKILL.md` : "SKILL.md"
  const descriptor = snapshot.tree.find((entry) => (
    entry.path === descriptorPath
    && entry.type === "blob"
    && ["100644", "100755"].includes(entry.mode)
  ))

  if (!descriptor) {
    throw new GitHubSkillDiscoveryError(
      "The selected skill could not be found in this repository.",
      404,
      "skill_not_found",
    )
  }
  if (descriptor.size !== undefined && descriptor.size > MAX_DESCRIPTOR_BYTES) {
    throw new GitHubSkillDiscoveryError(
      `The skill definition at ${descriptor.path} is too large to inspect safely.`,
      413,
      "repository_too_large",
    )
  }

  const bytes = await fetchDescriptor(
    snapshot.repoOwner,
    snapshot.repoName,
    snapshot.commitSha,
    descriptor,
  )
  const skill = parseSkillDescriptor(bytes, normalizedPath)
  if (!skill) {
    throw new GitHubSkillDiscoveryError(
      "The selected folder does not contain a valid SKILL.md definition.",
      404,
      "skill_not_found",
    )
  }

  return {
    ...snapshot,
    skills: [skill],
    skill,
    linkedSkillPath: normalizedPath,
  }
}
