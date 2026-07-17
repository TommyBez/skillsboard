import "server-only"

import { zipSync, type Zippable } from "fflate"

import {
  GitHubSkillDiscoveryError,
  resolveGitHubSkill,
  type GitHubTreeEntry,
} from "@/lib/github-skill-discovery"

const MAX_TREE_ENTRIES = 20_000
const MAX_SKILL_FILES = 300
const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_TOTAL_BYTES = 25 * 1024 * 1024
const MAX_REPOSITORY_PATH_LENGTH = 512
const DOWNLOAD_CONCURRENCY = 6
const GITHUB_TIMEOUT_MS = 15_000

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
  skillPath: string | null
}): Promise<SkillArchive> {
  if (input.skillPath === null) {
    throw new SkillArchiveError("This skill does not have a verified source path.", 422)
  }

  let discovery: Awaited<ReturnType<typeof resolveGitHubSkill>>
  try {
    discovery = await resolveGitHubSkill(input.githubUrl, input.skillPath)
  } catch (error) {
    if (error instanceof GitHubSkillDiscoveryError) {
      throw new SkillArchiveError(error.message, error.status, { cause: error })
    }
    throw error
  }

  if (discovery.tree.length > MAX_TREE_ENTRIES) {
    throw new SkillArchiveError("This repository is too large to locate and package the selected skill safely.", 413)
  }

  const skillPath = discovery.skill.path
  const canonicalName = discovery.skill.name
  if (!isSafeRepositoryPath(skillPath, true)) {
    throw new SkillArchiveError("The saved skill path is invalid and cannot be packaged safely.", 422)
  }

  const files = collectSkillFiles(discovery.tree, skillPath)
  const archiveRoot = safeArchiveName(canonicalName)
  const archiveEntries = await downloadFiles(
    discovery.repoOwner,
    discovery.repoName,
    discovery.commitSha,
    files,
    archiveRoot,
  )
  const bytes = zipSync(archiveEntries, { level: 6 })

  if (bytes.byteLength > MAX_TOTAL_BYTES) {
    throw new SkillArchiveError("The generated ZIP is larger than 25 MB and cannot be downloaded.", 413)
  }

  return {
    bytes,
    filename: `${archiveRoot}.zip`,
    commitSha: discovery.commitSha,
    skillPath,
  }
}
