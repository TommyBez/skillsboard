import "server-only"

import { createHash } from "node:crypto"

import {
  buildDeterministicZip,
  canonicalizePortableArchivePath,
} from "@/lib/deterministic-zip"
import {
  GitHubSkillDiscoveryError,
  resolveGitHubSkills,
  type GitHubTreeEntry,
  type ResolvedGitHubSkill,
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

export interface InstallableSkillArchive extends SkillArchive {
  artifactBytes: number
  description: string
  digest: `sha256:${string}`
  fileCount: number
  isPrivate: boolean
  sourceBytes: number
  skillName: string
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

  return path.split("/").every((segment) => (
    segment
    && segment !== "."
    && segment !== ".."
    && segment !== "__proto__"
  ))
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
  const portablePaths = new Set<string>()
  const portableDirectories = new Set<string>()
  for (const file of files) {
    if (!isSafeRepositoryPath(file.relativePath) || !Number.isSafeInteger(file.size) || file.size < 0) {
      throw new SkillArchiveError("This skill contains a file path that cannot be packaged safely.", 422)
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new SkillArchiveError("This skill contains a file larger than 5 MB and is too large to package.", 413)
    }
    let portablePath: string
    try {
      portablePath = canonicalizePortableArchivePath(file.relativePath)
    } catch {
      throw new SkillArchiveError(
        "This skill contains a file path that cannot be extracted safely on common filesystems.",
        422,
      )
    }
    const portableSegments = portablePath.split("/")
    const parentDirectories = portableSegments.slice(0, -1).map((_, index) => (
      portableSegments.slice(0, index + 1).join("/")
    ))
    if (
      portablePaths.has(portablePath)
      || portableDirectories.has(portablePath)
      || parentDirectories.some((directory) => portablePaths.has(directory))
    ) {
      throw new SkillArchiveError(
        "This skill contains file paths that collide on common filesystems and cannot be packaged safely.",
        422,
      )
    }
    portablePaths.add(portablePath)
    for (const directory of parentDirectories) portableDirectories.add(directory)
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
) {
  const downloaded = new Array<{ bytes: Uint8Array; relativePath: string }>(files.length)
  let nextFileIndex = 0
  let downloadedBytes = 0

  async function worker() {
    while (nextFileIndex < files.length) {
      const fileIndex = nextFileIndex
      const file = files[fileIndex]
      nextFileIndex += 1
      const bytes = await fetchRawFile(repoOwner, repoName, commitSha, file)
      downloadedBytes += bytes.byteLength
      if (downloadedBytes > MAX_TOTAL_BYTES) {
        throw new SkillArchiveError("This skill is larger than 25 MB and is too large to package.", 413)
      }
      downloaded[fileIndex] = { bytes, relativePath: file.relativePath }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, files.length) }, () => worker()),
  )
  return downloaded.sort((a, b) => (
    a.relativePath < b.relativePath ? -1 : a.relativePath > b.relativePath ? 1 : 0
  ))
}

async function buildResolvedSkillArchive(
  discovery: ResolvedGitHubSkill,
  archiveRoot: string | null,
) {
  if (discovery.tree.length > MAX_TREE_ENTRIES) {
    throw new SkillArchiveError("This repository is too large to locate and package the selected skill safely.", 413)
  }

  const skillPath = discovery.skill.path
  if (!isSafeRepositoryPath(skillPath, true)) {
    throw new SkillArchiveError("The saved skill path is invalid and cannot be packaged safely.", 422)
  }

  const files = collectSkillFiles(discovery.tree, skillPath)
  const downloaded = await downloadFiles(
    discovery.repoOwner,
    discovery.repoName,
    discovery.commitSha,
    files,
  )
  const sourceBytes = downloaded.reduce((total, file) => total + file.bytes.byteLength, 0)
  const bytes = buildDeterministicZip(downloaded, archiveRoot)

  if (bytes.byteLength > MAX_TOTAL_BYTES) {
    throw new SkillArchiveError("The generated ZIP is larger than 25 MB and cannot be downloaded.", 413)
  }

  return {
    bytes,
    commitSha: discovery.commitSha,
    fileCount: files.length,
    sourceBytes,
    skillPath,
  }
}

export async function buildLatestSkillArchive(input: {
  githubUrl: string
  skillPath: string | null
}): Promise<SkillArchive> {
  if (input.skillPath === null) {
    throw new SkillArchiveError("This skill does not have a verified source path.", 422)
  }

  let discovery: ResolvedGitHubSkill
  try {
    const resolved = await resolveGitHubSkills(input.githubUrl, [input.skillPath])
    discovery = { ...resolved, skill: resolved.skills[0] }
  } catch (error) {
    if (error instanceof GitHubSkillDiscoveryError) {
      throw new SkillArchiveError(error.message, error.status, { cause: error })
    }
    throw error
  }

  const canonicalName = discovery.skill.name
  const archiveRoot = safeArchiveName(canonicalName)
  const archive = await buildResolvedSkillArchive(discovery, archiveRoot)

  return {
    bytes: archive.bytes,
    filename: `${archiveRoot}.zip`,
    commitSha: archive.commitSha,
    skillPath: archive.skillPath,
  }
}

/** Builds the root-flat, byte-stable archive required by well-known discovery. */
export async function buildInstallableSkillArchive(input: {
  githubUrl: string
  skillPath: string | null
}): Promise<InstallableSkillArchive> {
  if (input.skillPath === null) {
    throw new SkillArchiveError("This skill does not have a verified source path.", 422)
  }
  const [archive] = await buildInstallableSkillArchives({
    githubUrl: input.githubUrl,
    skillPaths: [input.skillPath],
  })
  return archive
}

/** Builds several skills from one repository snapshot and commit. */
export async function buildInstallableSkillArchives(input: {
  githubUrl: string
  skillPaths: string[]
}): Promise<InstallableSkillArchive[]> {
  if (!input.skillPaths.length) {
    throw new SkillArchiveError("Select at least one skill with a verified source path.", 422)
  }

  let discovery: Awaited<ReturnType<typeof resolveGitHubSkills>>
  try {
    discovery = await resolveGitHubSkills(input.githubUrl, input.skillPaths)
  } catch (error) {
    if (error instanceof GitHubSkillDiscoveryError) {
      throw new SkillArchiveError(error.message, error.status, { cause: error })
    }
    throw error
  }

  if (discovery.isPrivate) {
    throw new SkillArchiveError(
      "Installable collections currently support public GitHub repositories only.",
      422,
    )
  }

  const archives = new Array<InstallableSkillArchive>(discovery.skills.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < discovery.skills.length) {
      const index = nextIndex
      const skill = discovery.skills[index]
      nextIndex += 1
      const archive = await buildResolvedSkillArchive({ ...discovery, skill }, null)
      const digest = createHash("sha256").update(archive.bytes).digest("hex")
      archives[index] = {
        ...archive,
        artifactBytes: archive.bytes.byteLength,
        description: skill.description,
        digest: `sha256:${digest}`,
        filename: `${safeArchiveName(skill.name)}.zip`,
        isPrivate: discovery.isPrivate,
        skillName: skill.name,
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(3, discovery.skills.length) }, () => worker()),
  )
  return archives
}
