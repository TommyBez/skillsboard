export const INSTALLABLE_COLLECTION_SCHEMA_URL =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json" as const
export const MAX_INSTALLABLE_COLLECTION_DESCRIPTION_LENGTH = 1024
export const MAX_INSTALLABLE_COLLECTION_SKILLS = 25

const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{32}$/
const URL_SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const WIN32_DEVICE_SKILL_NAME_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/
const SHA256_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/
const MAX_SKILL_NAME_LENGTH = 64

export type Sha256Digest = `sha256:${string}`

export interface InstallableCollectionManifestEntryInput {
  artifactId: string
  skillName: string
  description: string
  digest: string
}

export interface InstallableCollectionArchiveManifestEntry {
  name: string
  description: string
  type: "archive"
  url: string
  digest: Sha256Digest
}

export interface InstallableCollectionManifest {
  $schema: typeof INSTALLABLE_COLLECTION_SCHEMA_URL
  skills: InstallableCollectionArchiveManifestEntry[]
}

export function isValidInstallableCollectionShareId(
  shareId: unknown,
): shareId is string {
  return typeof shareId === "string" && SHARE_ID_PATTERN.test(shareId)
}

function assertValidShareId(shareId: string) {
  if (!isValidInstallableCollectionShareId(shareId)) {
    throw new TypeError("Share ID must be exactly 32 URL-safe characters")
  }
}

function assertValidArtifactId(artifactId: string) {
  if (typeof artifactId !== "string" || !URL_SAFE_SEGMENT_PATTERN.test(artifactId)) {
    throw new TypeError("Artifact ID must be a non-empty URL-safe path segment")
  }
}

function assertValidSkillName(skillName: string) {
  if (
    typeof skillName !== "string" ||
    skillName.length > MAX_SKILL_NAME_LENGTH ||
    !SKILL_NAME_PATTERN.test(skillName) ||
    WIN32_DEVICE_SKILL_NAME_PATTERN.test(skillName)
  ) {
    throw new TypeError(
      "Skill name must be 1-64 safe lowercase alphanumeric characters separated by single hyphens",
    )
  }
}

function assertValidDescription(description: string) {
  if (
    typeof description !== "string" ||
    description.trim().length === 0 ||
    description.length > MAX_INSTALLABLE_COLLECTION_DESCRIPTION_LENGTH
  ) {
    throw new TypeError("Skill description must contain 1-1024 characters")
  }
}

function assertValidDigest(digest: string): asserts digest is Sha256Digest {
  if (typeof digest !== "string" || !SHA256_DIGEST_PATTERN.test(digest)) {
    throw new TypeError("Digest must be sha256: followed by 64 lowercase hexadecimal characters")
  }
}

function normalizeBaseUrl(baseUrl: string) {
  let url: URL

  if (typeof baseUrl !== "string") {
    throw new TypeError("Base URL must be an absolute HTTP(S) URL")
  }

  try {
    url = new URL(baseUrl)
  } catch {
    throw new TypeError("Base URL must be an absolute HTTP(S) URL")
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new TypeError(
      "Base URL must be an absolute HTTP(S) URL without credentials, query, or fragment",
    )
  }

  url.pathname = url.pathname.replace(/\/+$/, "")
  return url.toString().replace(/\/$/, "")
}

export function buildInstallableCollectionCommand(baseUrl: string, shareId: string) {
  const collectionUrl = buildInstallableCollectionUrl(baseUrl, shareId)
  return `npx skills add ${collectionUrl} --skill "*"`
}

export function buildInstallableCollectionUrl(baseUrl: string, shareId: string) {
  assertValidShareId(shareId)
  return `${normalizeBaseUrl(baseUrl)}/p/${encodeURIComponent(shareId)}`
}

export function buildInstallableCollectionArtifactFilename(skillName: string) {
  assertValidSkillName(skillName)
  return `${skillName}.zip`
}

export function buildInstallableCollectionArtifactPath(
  artifactId: string,
  skillName: string,
) {
  assertValidArtifactId(artifactId)

  return `../../artifacts/${encodeURIComponent(artifactId)}/${buildInstallableCollectionArtifactFilename(skillName)}`
}

export function buildWellKnownManifest(
  entries: readonly InstallableCollectionManifestEntryInput[],
): InstallableCollectionManifest {
  return {
    $schema: INSTALLABLE_COLLECTION_SCHEMA_URL,
    skills: entries.map((entry) => {
      assertValidDescription(entry.description)
      assertValidDigest(entry.digest)

      return {
        name: entry.skillName,
        description: entry.description,
        type: "archive",
        url: buildInstallableCollectionArtifactPath(entry.artifactId, entry.skillName),
        digest: entry.digest,
      }
    }),
  }
}
