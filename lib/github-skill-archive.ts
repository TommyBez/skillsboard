import "server-only"

import { zipSync, type Zippable } from "fflate"

import { parseGitHubUrl } from "@/lib/github"

const MAX_TREE_ENTRIES = 20_000
const MAX_SKILL_FILES = 300
const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_TOTAL_BYTES = 25 * 1024 * 1024
const MAX_REPOSITORY_PATH_LENGTH = 512
const MAX_DESCRIPTOR_CANDIDATES = 100
const MAX_DESCRIPTOR_BYTES = 256 * 1024
const DOWNLOAD_CONCURRENCY = 6
const GITHUB_TIMEOUT_MS = 15_000

interface GitHubRepository {
  default_branch: string
}

interface GitHubCommit {
  sha: string
  commit: {
    tree: {
      sha: string
    }
  }
}

interface GitHubTreeEntry {
  path: string
  mode: string
  type: "blob" | "tree" | "commit"
  sha: string
  size?: number
}

interface GitHubTree {
  truncated: boolean
  tree: GitHubTreeEntry[]
}

interface ResolvedSkillFile extends GitHubTreeEntry {
  relativePath: string
  size: number
  type: "blob"
}

export interface SkillArchive {
  bytes: Uint8Array
  filename: string
  commitSha: string
  skillPath: string
}

export class SkillArchiveError extends Error {
  constructor(
    message: string,
    readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "SkillArchiveError"
  }
}

function githubApiHeaders() {
  const token = process.env.GITHUB_TOKEN?.trim()

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchGitHubJson<T>(url: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: githubApiHeaders(),
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    })
  } catch (error) {
    throw new SkillArchiveError("GitHub did not respond in time. Try the download again.", 502, { cause: error })
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new SkillArchiveError("The repository or its latest version is no longer available.", 404)
    }
    if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
      throw new SkillArchiveError("GitHub’s download limit has been reached. Try again later.", 429)
    }
    throw new SkillArchiveError("GitHub could not prepare this skill for download.", 502)
  }

  return response.json() as Promise<T>
}

function normalizeFolderPath(value: string | null | undefined) {
  if (!value) return null
  let path = value.trim().replace(/^\/+|\/+$/g, "")
  if (path.endsWith("/SKILL.md")) path = path.slice(0, -"/SKILL.md".length)
  if (path === "SKILL.md") path = ""
  return isSafeRepositoryPath(path, true) ? path : null
}

function isSafeRepositoryPath(path: string, allowEmpty = false) {
  if (!path) return allowEmpty
  if (
    path.length > MAX_REPOSITORY_PATH_LENGTH
    || path.startsWith("/")
    || path.includes("\\")
    || /[\0-\x1f\x7f]/.test(path)
  ) return false

  return path.split("/").every((segment) => segment && segment !== "." && segment !== "..")
}

function skillDescriptorPath(folder: string) {
  return folder ? `${folder}/SKILL.md` : "SKILL.md"
}

function ambiguousSkillError() {
  return new SkillArchiveError(
    "This repository defines the same skill name in more than one folder, so Skills Board cannot choose one safely.",
    409,
  )
}

function frontmatterSkillName(bytes: Uint8Array) {
  const lines = new TextDecoder().decode(bytes).replaceAll("\r\n", "\n").split("\n")
  if (lines[0]?.trim() !== "---") return null

  for (const line of lines.slice(1)) {
    if (line.trim() === "---") break
    const match = line.match(/^name\s*:\s*(.+?)\s*$/)
    if (!match) continue
    return match[1].replace(/^(["'])(.*)\1$/, "$2").trim().toLowerCase()
  }
  return null
}

async function resolveSkillPath(
  tree: GitHubTreeEntry[],
  skillName: string,
  storedSkillPath: string | null,
  repoOwner: string,
  repoName: string,
  commitSha: string,
) {
  const descriptors = tree.filter((entry) => (
    entry.type === "blob"
    && ["100644", "100755"].includes(entry.mode)
    && isSafeRepositoryPath(entry.path)
    && (entry.path === "SKILL.md" || entry.path.endsWith("/SKILL.md"))
  ))
  const descriptorPaths = new Set(descriptors.map((entry) => entry.path))

  const storedPath = normalizeFolderPath(storedSkillPath)
  if (storedPath !== null && descriptorPaths.has(skillDescriptorPath(storedPath))) return storedPath

  const normalizedSkillName = skillName.trim().toLowerCase()
  const candidates = [...descriptorPaths]
    .map((descriptorPath) => descriptorPath === "SKILL.md"
      ? ""
      : descriptorPath.slice(0, -"/SKILL.md".length))
  const namedCandidates = candidates.filter((folder) => (
    folder.split("/").at(-1)?.toLowerCase() === normalizedSkillName
  ))

  if (namedCandidates.length === 1) return namedCandidates[0]
  if (namedCandidates.length > 1) throw ambiguousSkillError()

  if (candidates.includes("") && (candidates.length === 1 || repoName.toLowerCase() === normalizedSkillName)) {
    return ""
  }

  if (candidates.length === 1) return candidates[0]

  if (descriptors.length > MAX_DESCRIPTOR_CANDIDATES) {
    throw new SkillArchiveError(
      `This repository contains more than ${MAX_DESCRIPTOR_CANDIDATES} skill definitions, so the selected folder cannot be resolved safely.`,
      413,
    )
  }

  const matchingFrontmatterPaths: string[] = []
  let nextDescriptorIndex = 0

  async function worker() {
    while (nextDescriptorIndex < descriptors.length) {
      const descriptor = descriptors[nextDescriptorIndex]
      nextDescriptorIndex += 1
      const bytes = await fetchRawGitHubPath(
        repoOwner,
        repoName,
        commitSha,
        descriptor.path,
        MAX_DESCRIPTOR_BYTES,
      )
      if (frontmatterSkillName(bytes) === normalizedSkillName) {
        matchingFrontmatterPaths.push(
          descriptor.path === "SKILL.md" ? "" : descriptor.path.slice(0, -"/SKILL.md".length),
        )
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, descriptors.length) }, () => worker()),
  )

  if (matchingFrontmatterPaths.length === 1) return matchingFrontmatterPaths[0]
  if (matchingFrontmatterPaths.length > 1) throw ambiguousSkillError()

  throw new SkillArchiveError("The selected skill folder could not be found in the repository’s latest version.", 404)
}

function collectSkillFiles(tree: GitHubTreeEntry[], skillPath: string) {
  const prefix = skillPath ? `${skillPath}/` : ""
  const entriesInsideSkill = tree.filter((entry) => (
    skillPath ? entry.path.startsWith(prefix) : true
  ))

  if (entriesInsideSkill.some((entry) => entry.type === "commit" || (entry.type === "blob" && !["100644", "100755"].includes(entry.mode)))) {
    throw new SkillArchiveError("This skill contains a symbolic link or submodule that cannot be packaged safely.", 422)
  }

  const files = entriesInsideSkill
    .filter((entry): entry is GitHubTreeEntry & { type: "blob" } => entry.type === "blob")
    .map((entry): ResolvedSkillFile => ({
      ...entry,
      relativePath: skillPath ? entry.path.slice(prefix.length) : entry.path,
      size: entry.size ?? 0,
    }))

  if (!files.some((file) => file.relativePath === "SKILL.md")) {
    throw new SkillArchiveError("The selected folder does not contain a SKILL.md file.", 404)
  }
  if (files.length > MAX_SKILL_FILES) {
    throw new SkillArchiveError(`This skill contains more than ${MAX_SKILL_FILES} files and is too large to package.`, 413)
  }

  let totalSize = 0
  for (const file of files) {
    if (!isSafeRepositoryPath(file.relativePath) || !Number.isSafeInteger(file.size) || file.size < 0) {
      throw new SkillArchiveError("This skill contains a file path that cannot be packaged safely.", 422)
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new SkillArchiveError("This skill contains a file larger than 5 MB and is too large to package.", 413)
    }
    totalSize += file.size
  }

  if (totalSize > MAX_TOTAL_BYTES) {
    throw new SkillArchiveError("This skill is larger than 25 MB and is too large to package.", 413)
  }

  return files
}

function safeArchiveName(value: string) {
  const name = value
    .trim()
    .replace(/[\\/\0-\x1f\x7f]+/g, "-")
    .replace(/^\.+$/, "")
    .slice(0, 100)
  return name || "skill"
}

function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/")
}

async function fetchRawGitHubPath(
  repoOwner: string,
  repoName: string,
  commitSha: string,
  path: string,
  maxBytes: number,
) {
  const url = `https://raw.githubusercontent.com/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/${commitSha}/${encodeGitHubPath(path)}`
  let response: Response

  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    })
  } catch (error) {
    throw new SkillArchiveError(`GitHub did not finish downloading ${path}. Try again.`, 502, { cause: error })
  }

  if (!response.ok) {
    throw new SkillArchiveError(`GitHub could not download ${path}.`, 502)
  }

  const reportedSize = Number(response.headers.get("content-length"))
  if (Number.isFinite(reportedSize) && reportedSize > maxBytes) {
    throw new SkillArchiveError(`The file ${path} is too large to inspect or package safely.`, 413)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > maxBytes) {
    throw new SkillArchiveError(`The file ${path} is too large to inspect or package safely.`, 413)
  }
  return bytes
}

async function fetchRawFile(
  repoOwner: string,
  repoName: string,
  commitSha: string,
  file: ResolvedSkillFile,
) {
  return fetchRawGitHubPath(repoOwner, repoName, commitSha, file.path, MAX_FILE_BYTES)
}

async function downloadFiles(
  repoOwner: string,
  repoName: string,
  commitSha: string,
  files: ResolvedSkillFile[],
  archiveRoot: string,
) {
  const archiveEntries: Zippable = {}
  let nextFileIndex = 0
  let downloadedBytes = 0

  async function worker() {
    while (nextFileIndex < files.length) {
      const file = files[nextFileIndex]
      nextFileIndex += 1
      const bytes = await fetchRawFile(repoOwner, repoName, commitSha, file)
      downloadedBytes += bytes.byteLength
      if (downloadedBytes > MAX_TOTAL_BYTES) {
        throw new SkillArchiveError("This skill is larger than 25 MB and is too large to package.", 413)
      }
      archiveEntries[`${archiveRoot}/${file.relativePath}`] = bytes
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, files.length) }, () => worker()),
  )
  return archiveEntries
}

export async function buildLatestSkillArchive(input: {
  githubUrl: string
  skillName: string
  skillPath?: string | null
}): Promise<SkillArchive> {
  const { repoOwner, repoName } = parseGitHubUrl(input.githubUrl)
  const repository = await fetchGitHubJson<GitHubRepository>(
    `https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}`,
  )
  if (!repository.default_branch) {
    throw new SkillArchiveError("The repository does not have a default branch to download.", 404)
  }

  const commit = await fetchGitHubJson<GitHubCommit>(
    `https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/commits/${encodeURIComponent(repository.default_branch)}`,
  )
  const tree = await fetchGitHubJson<GitHubTree>(
    `https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/git/trees/${encodeURIComponent(commit.commit.tree.sha)}?recursive=1`,
  )

  if (tree.truncated || tree.tree.length > MAX_TREE_ENTRIES) {
    throw new SkillArchiveError("This repository is too large to locate and package the selected skill safely.", 413)
  }

  const skillPath = await resolveSkillPath(
    tree.tree,
    input.skillName,
    input.skillPath ?? null,
    repoOwner,
    repoName,
    commit.sha,
  )
  const files = collectSkillFiles(tree.tree, skillPath)
  const archiveRoot = safeArchiveName(input.skillName)
  const archiveEntries = await downloadFiles(repoOwner, repoName, commit.sha, files, archiveRoot)
  const bytes = zipSync(archiveEntries, { level: 6 })

  if (bytes.byteLength > MAX_TOTAL_BYTES) {
    throw new SkillArchiveError("The generated ZIP is larger than 25 MB and cannot be downloaded.", 413)
  }

  return {
    bytes,
    filename: `${archiveRoot}.zip`,
    commitSha: commit.sha,
    skillPath,
  }
}
